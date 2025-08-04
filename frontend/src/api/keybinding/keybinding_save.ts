import {api} from "@/api/api"
import {debounce} from 'lodash'

const likeSaveCore = async (saveId: string) => {
    try {
        const response = await api.post(`/keybinding/${saveId}/like`)
        
        return response.data
    } catch (error) {
        console.log(error)
        return {status: 'error'}
    }
}

const unlikeSaveCore = async (saveId: string) => {
    try {
        const response = await api.delete(`/keybinding/${saveId}/unlike`)
        
        return response.data
    } catch (error) {
        console.log(error)
        return {status: 'error'}
    }
}

const toggleLike = async (isLiked: boolean, saveId: string) => {
    if (isLiked) {
        return await likeSaveCore(saveId)
    } else {
        return await unlikeSaveCore(saveId)
    }
}



const getDescription =  async (saveId: string) => {
    try {
        const response = await api.get(`/keybinding/${saveId}/get-description`)
        return response.data.data
    } catch (error) {
        console.log(error);
        return ''
    }
}

export const keybindingSaveApi = {
    getDescription,
    toggleLike: debounce(toggleLike, 500),
}