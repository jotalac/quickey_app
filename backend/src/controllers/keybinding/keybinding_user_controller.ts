import { Request, Response } from "express"
import KeyBinding from "../../models/keybinding_model"
import { IUser } from "../../@types/user"
import mongoose, { FilterQuery, PipelineStage, ObjectId } from "mongoose"
import { IKeyBinding } from "../../@types/keybinding"

const verfiyBindingName = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser
        const {saveName} = req.body
    
        const valid = await bindingNameValid(user._id, saveName)
        
        res.status(200).json({
            status: "success",
            valid: valid
        })

    } catch (error) {
        res.status(500).json({
            status: "error",
            valid: false,
            msg: "name validation failed"
        })
    }
} 

const getBindingUser = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser
        //get the filter values
        const {searchText, filterCategories, sortBy = "date_desc", publicFilter = "all", likedFilter = "false", page = "1", limit = "15"} = req.query
        // const query: any = {userId: user._id, }
        const pipeline: PipelineStage[] = []

        const initMatch: FilterQuery<IKeyBinding> = {userId: new mongoose.Types.ObjectId(user._id)}
        if (searchText && typeof searchText === 'string') {
            initMatch.name = {$regex: searchText, $options: 'i'} //case insensitive search
        }

        if (filterCategories && typeof filterCategories === 'string') {
            const categories = filterCategories.split(',').filter(cat => cat.trim() !== '')
            if (categories.length > 0) {
                initMatch.category = {$in: categories}
            }
        }

        if (publicFilter !== 'all' && typeof publicFilter === 'string') {
            initMatch.public = publicFilter === 'public'
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

        //add like count field to the results 
        pipeline.push({
            $addFields: {
                likeCount: { $size: '$likesData'},
                isLiked: {$in: [user._id, '$likesData.userId']},
                username: user.username,
            }
        })

        if (likedFilter === "true") {
            pipeline.push({$match: {isLiked: true}})
        }

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

const getDescription = async (req: Request, res: Response) => {
    try {
        const {saveId} = req.params
        const user = req.user as IUser

        const savedData = await KeyBinding.findById(saveId)

        
        if (!savedData || !savedData.userId.equals(user._id)) {
            res.status(400).json({
                status: "error",
                msg: "Invalid save id"
            })
            return
        }

        res.status(200).json({
            status: "success",
            data: savedData.description
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            msg: "Error getting description"
        })
    }
}

const updateSave = async (req: Request, res: Response) => {
    const {saveId} = req.params
    const user = req.user as IUser
    let {newName, newDescription, newIsPublic} = req.body
    newName = newName.trim()
    newDescription = newDescription.trim()
    //check if all data is provided
    if (!saveId || !newName || newDescription === undefined || newIsPublic === undefined) {
        res.status(400).json({status: "error", msg: "Not all data provided"})
        return 
    }
    //check if user owns the save
    if (!await userOwnsSave(user._id, saveId)) {
        res.status(400).json({status: "error", msg: "Invalid save ID"})
        return 
    }

    //check if name doesnt already exists
    if (!await validateNameUpdate(newName, user._id, saveId)) {
        res.status(400).json({status: "error", msg: "New name is not valid"})
        return
    }
    
    //validate description
    if (newDescription.length > 3000) {
        res.status(400).json({status: "error", msg: "Description is too long"})
        return
    }

    try {
        await KeyBinding.findByIdAndUpdate(
            saveId,
            {
                name: newName,
                description: newDescription,
                public: newIsPublic
            }
        )

        res.status(200).json({
            status: "success",
            msg: "Save updated successfully",
            newData: {
                saveName: newName,
                saveDescription: newDescription,
                isPublic: newIsPublic,
                id: saveId 
            }
        })
    } catch (error) {
        res.status(500).json({status: "error", msg: "Updating save failed!"})
    }
}

//helper funcations
const bindingNameValid = async (userId: string, saveName: string): Promise<Boolean> => {
    const exists = await KeyBinding.exists({
        userId: userId,
        name: saveName
    })

    return !exists
}

const validateNameUpdate = async (newName: string, userId: string, saveId: string): Promise<boolean> => {
    if (newName.length > 50 || newName.length < 3) {
        return false
    }

    const existsSave = await KeyBinding.exists({
        userId: userId,
        name: newName,
        _id: {$ne: saveId}
    })
    return !existsSave
}

const userOwnsSave = async (userId: string, saveId: string): Promise<boolean> => {
    const exists = await KeyBinding.exists({userId: userId, _id: saveId})
    return !!exists 
}

const getSortOptions = (sortValue: string): Record<string, 1 | -1> => {
    switch (sortValue) {
        case "date_asc":
            return {updatedAt: 1} 
        case "most_liked":
            return {likeCount: -1, updatedAt: -1}
        case "name_asc":
            return {name: 1}
        case "name_desc":
            return { name: -1 }
        default: // "date_desc"
            return { updatedAt: -1 }
    }
}

const getTotalCountResults = async (pipeline: PipelineStage[]) => {
    const totalCountPipeline = [...pipeline, {$count: "count"}]
    const countResult = await KeyBinding.aggregate(totalCountPipeline)
    return countResult[0]?.count || 0
}

export {verfiyBindingName, bindingNameValid, getBindingUser, getDescription, updateSave}