import {api} from "@/api/api"

export const discoverKeybindingApi = {
    async getKeybindingDiscover(userId: string, searchText: string, filterCategories: string[], sortBy: string, page: number, limit: number) {
        try {
            const response = await api.get('/keybinding/get-discover-binding', {
                params: {
                    searchText,
                    filterCategories: filterCategories.join(','),
                    sortBy,
                    page,
                    limit,
                    userId
                }
            })
            
            return response.data
        } catch (error) {
            console.log(error)
            return {status: 'error', msg: 'Failed to get saved data'}
        }
    },

    async getHotKeybindings(limit: number, userId?: string) {
        try {
            const response = await api.get('/keybinding/get-hot-binding', {
                params: {
                    limit,
                    userId
                }
            })
            
            return response.data
        } catch (error) {
            console.log(error)
            return {status: 'error', msg: 'Failed to get saved data'}
        }
    },


    
}