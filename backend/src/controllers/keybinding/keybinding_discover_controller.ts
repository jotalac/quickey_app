import { Request, Response } from "express"
import { IUser } from "../../@types/user"
import mongoose, { FilterQuery, PipelineStage } from "mongoose"
import { IKeyBinding } from "../../@types/keybinding"
import { getSortOptions, getTotalCountResults } from "./keybinding_user_controller"
import KeyBinding from "../../models/keybinding_model"

const getBindingDiscover = async (req: Request, res: Response) => {
    try {
        const {userId} = req.query 
        //get the filter values
        const {searchText, filterCategories, sortBy = "date_desc", page = "1", limit = "15"} = req.query
        // const query: any = {userId: user._id, }
        const pipeline: PipelineStage[] = []

        const initMatch: FilterQuery<IKeyBinding> = {public: true}
        if (searchText && typeof searchText === 'string') {
            initMatch.name = {$regex: searchText, $options: 'i'} //case insensitive search
        }

        if (filterCategories && typeof filterCategories === 'string') {
            const categories = filterCategories.split(',').filter(cat => cat.trim() !== '')
            if (categories.length > 0) {
                initMatch.category = {$in: categories}
            }
        }

        pipeline.push({$match: initMatch})

        //join with the likes collection
        pipeline.push({
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'keyBindingId',
                as: 'likesData'
            }
        })

        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userInfo'
            }
        }); 

        //add like count field to the results 
        pipeline.push({
            $addFields: {
                likeCount: { $size: '$likesData'},
                isLiked: {$in: [userId, '$likesData.userId']},
                username: {$arrayElemAt: ['$userInfo.username', 0]}
            }
        })


        //sort the results based on the sort filter
        const sortData = getSortOptions(sortBy as string)
        pipeline.push({$sort: sortData})

        const totalCount = await getTotalCountResults(pipeline)

        //handle paginaiton
        const pageNum = parseInt(page as string) || 1
        const pageSize = parseInt(limit as string) || 1
        const skip = (pageNum - 1) * pageSize
        pipeline.push({$skip: skip})
        pipeline.push({$limit: pageSize})

        
        //clean up the outpuyt
        pipeline.push({
            $project: {
                likesData: 0,
                userId: 0,
                useNumber: 0,
                updatedAt: 0,
                description: 0
            }
        })

        const bindingData = await KeyBinding.aggregate(pipeline)

        res.status(200).json({
            status: 'success',
            data: bindingData,
            count: totalCount
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            msg: "Error getting user binding data"
        })
    }
}

const getHotKeybindings = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const timeWindow = parseInt(req.query.days as string) || 7; // Last 7 days
    
    // Calculate hot scores using aggregation pipeline
    const hotKeybindings = await KeyBinding.aggregate([
      // Only public keybindings
      { $match: { public: true } },
      
      // FIRST: Lookup total likes to get likeCount
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'keyBindingId',
          as: 'likesData'
        }
      },
      
      // Add total like count
      {
        $addFields: {
          likeCount: { $size: '$likesData' }
        }
      },
      
      // Add age calculation
      {
        $addFields: {
          ageInDays: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24 // milliseconds to days
            ]
          }
        }
      },
      
      // SECOND: Lookup recent likes (last N days)
      {
        $lookup: {
          from: 'likes',
          let: { keybindingId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$keyBindingId', '$$keybindingId'] }, // Fixed: was 'keybindingId'
                    {
                      $gte: [
                        '$createdAt',
                        new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000)
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'recentLikes'
        }
      },
      
      // Calculate hot score (now likeCount exists)
      {
        $addFields: {
          recentLikeCount: { $size: '$recentLikes' },
          hotScore: {
            $add: [
              // Recent likes weight (higher impact)
              { $multiply: [{ $size: '$recentLikes' }, 10] },
              
              // Total likes weight (moderate impact)
              { $multiply: ['$likeCount', 2] },
              {$multiply: [{$subtract: [7, '$ageInDays']}, 5]}
            ]
          }
        }
      },
      { $match: { hotScore: { $gt: 40 } } }, // only score higher then 45 can be counted as hot
      
      // Sort by hot score
      { $sort: { hotScore: -1 } },
      
      // Limit results
      { $limit: limit },
      
      // Populate user info
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      
      // Project final fields
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          keyBinding: 1,
          public: 1,
          likeCount: 1,
          createdAt: 1,
          hotScore: 1,
          recentLikeCount: 1,
          ageInDays: 1,
          username: { $arrayElemAt: ['$userInfo.username', 0] },
          // Clean up lookup data
        //   likesData: 0,
        //   recentLikes: 0,
        //   userInfo: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: hotKeybindings,
      message: `Found ${hotKeybindings.length} hot keybindings`
    });

  } catch (error) {
    console.error('Error fetching hot keybindings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hot keybindings'
    });
  }
};

export {getBindingDiscover, getHotKeybindings}