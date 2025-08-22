import {api} from "../api"


export const profileEditApi = {
    async editUsername(newUsername: string) {
        try {
            const response = await api.patch('/profile/edit/username', {newUsername})
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }
    },

    async editBio(newBio: string) {
        try {
            const response = await api.patch('/profile/edit/bio', {newBio})
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }
    },

    async editSocialMediaLinks(links: {platform: string, url: string}[]) {
        try {
            const response = await api.patch('/profile/edit/social-media-links', {links})
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }
    },

    async editProfilePicture(newFile: File) {
        try {
            //setup formbody for automatic adjust for image sending
            const formData = new FormData()
            formData.append("profilePic", newFile)

            const response = await api.post('/profile/edit/profile-picture', formData)
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }
    },

}