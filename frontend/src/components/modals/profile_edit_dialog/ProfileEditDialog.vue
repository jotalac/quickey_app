<script setup lang="ts">
import { authFormApi } from '@/api/auth/auth_form';
import { profileEditApi } from '@/api/profile/profile_edit_api';
import type { SocialLinks } from '@/components/profile/ProfileDisplay.vue';
import { useAuth } from '@/composables/useAuth';
import { useProfileEditDialog } from '@/composables/useProfileEditDialog';
import {ref, computed, onBeforeMount, watch} from 'vue'


interface Props {
    username: string,
    bio: string,
    socialMediaLink: SocialLinks[]
}

const {isDialogVisible, hideDialog} = useProfileEditDialog()
const {initializeAuth} = useAuth()

const props = defineProps<Props>()

//initial values
const newUsername = ref('')
const newBio = ref('')
const profilePicFile = ref<File | null>(null)

const instagramLink = ref()
const facebookLink = ref()
const redditLink = ref()
const xLink = ref()
const socialLinksValid = ref({
    instagram: true,
    facebook: true, 
    x: true, 
    reddit: true}
)
const allSocialLinksValid = computed(() =>
  Object.values(socialLinksValid.value).every(v => v)
)


const usernameEdited = computed(() => newUsername.value.trim() !== props.username)
const usernameValid = ref<{valid: boolean, msg: string}>({valid: true, msg: ""}) 

const bioEdited = computed(() => newBio.value.trim() !== props.bio)

watch(() => isDialogVisible.value, () => {
    newBio.value = props.bio
    newUsername.value = props.username
    setSocialMediaLinks(props.socialMediaLink)
})

const setSocialMediaLinks = (socialLinks: SocialLinks[]) => {
    instagramLink.value = socialLinks.find((item) => item.platform === 'instagram')?.url
    facebookLink.value = socialLinks.find((item) => item.platform === 'facebook')?.url
    redditLink.value = socialLinks.find((item) => item.platform === 'reddit')?.url
    xLink.value = socialLinks.find((item) => item.platform === 'x')?.url
}

// === usrename handling ===
const saveUsername = async () => {
    try {
        const response = await profileEditApi.editUsername(newUsername.value)

        console.log(response)
        initializeAuth()
    } catch (error) {
        console.log(error)
    }
}

const validateUsername = async () => {
    if (!usernameEdited.value) {
        usernameValid.value = {valid: true, msg: "Usrename valid"}
        return
    }
    if (newUsername.value.length > 20 || newUsername.value.length < 3) {
        usernameValid.value = {valid: false, msg: "Username too short"}
        return
    }

    const usernameAvailible = await authFormApi.checkUsernameAvailible(newUsername.value.trim())
    if (!usernameAvailible) {
        usernameValid.value = {valid: false, msg: "Username already taken"}
        return 
    }

    usernameValid.value = {valid: true, msg: "Usrename valid"}
}

// == bio handling ==
const saveBio = async () => {
    try {
        const response = await profileEditApi.editBio(newBio.value)

        console.log(response)
    } catch (error) {
        console.log(error)
    }
}

//=== social media handling ===
const validateInstagramLink = () => {
    if (!instagramLink.value.startsWith("https://www.instagram.com/") && instagramLink.value !== '') {
        socialLinksValid.value.instagram = false
    } else {
        socialLinksValid.value.instagram = true
    }
}
const validateFacebookLink = () => {
    console.log()
    if (!facebookLink.value.startsWith("https://www.facebook.com/") && facebookLink.value !== '') {
        socialLinksValid.value.facebook = false
    } else {
        socialLinksValid.value.facebook = true
    }
}
const validateXLink = () => {
    if (!xLink.value.startsWith("https://x.com/") && xLink.value !== '') {
        socialLinksValid.value.x = false
    } else {
        socialLinksValid.value.x = true
    }
}
const validateRedditLink = () => {
    if (!redditLink.value.startsWith("https://www.reddit.com/user/") && redditLink.value !== '') {
        socialLinksValid.value.reddit = false
    } else {
        socialLinksValid.value.reddit = true
    }
}



</script>

<template>
    <Dialog
        v-model:visible="isDialogVisible"
        modal
        maximizable
        header="Edit profile"
        :style="{width: '90%', height: '90%'}"
        @hide="hideDialog"
    >   
        <div class="dialog-content">
            <h1 style="margin-bottom: 1em;">Edit profile <i class="pi pi-pencil" style="font-size: 1em;"/></h1>
            <div class="edit-cont">
                <span class="section-label">Username</span>
                <div class="edit-section">
                    <InputText 
                        v-model="newUsername" 
                        name="newUsername" 
                        class="edit-input"
                        :class="!usernameValid.valid ? 'input-invalid' : ''" 
                        placeholder="New username" 
                        maxlength="20" 
                        minlength="3"
                        @blur="validateUsername"
                    />
                    <span v-if="!usernameValid.valid" class="username-error">{{ usernameValid.msg }}</span>
                    <div class="button-area">
                        <Button label="Save" class="button-save" severity="success" icon="pi pi-save" :disabled="!usernameEdited || !usernameValid.valid" @click="saveUsername"/>
                        <Button label="Reset" class="button-save" outlined :disabled="!usernameEdited" @click="newUsername = props.username"/>
                    </div>
                </div>
            </div>

            <div class="edit-cont">
                <span class="section-label">Bio</span>
                    <Textarea v-model="newBio" name="newBio" class="bio-textarea" placeholder="Your new bio " maxlength="1000"/>
                    <div class="button-area">
                        <Button label="Save" class="button-save" severity="success" icon="pi pi-save" :disabled="!bioEdited" @click="saveBio"/>
                        <Button label="Reset" class="button-save" outlined @click="newBio = props.bio" :disabled="!bioEdited"/>
                    </div>
            </div>


            <div class="edit-cont upload-cont">
                <span class="section-label">Profile picture</span>
                <FileUpload name="newProfilePicture" mode="advanced" :multiple="false" accept="image/*" :file-limit="1" :max-file-size="1500000">
                    <template #empty>
                        <span class="file-choose-info">Drag and drop images here to upload</span>
                    </template> -->
                </FileUpload>
            </div>

            <div class="edit-cont">
                <span class="section-label">Social media links</span>
                    
                    <div class="social-media-cont">
                        <i class="pi pi-instagram social-media-icon"/>
                        <InputText 
                            v-model="instagramLink" 
                            placeholder="https://www.instagram.com/example" 
                            class="social-link-input" 
                            @blur="validateInstagramLink"
                            :class="socialLinksValid.instagram ? '': 'input-invalid'"
                            maxlength="200"
                        />
                    </div>
                    <div class="social-media-cont">
                        <i class="pi pi-facebook social-media-icon"/>
                        <InputText 
                            v-model="facebookLink" 
                            placeholder="https://www.facebook.com/example" 
                            class="social-link-input" 
                            maxlength="200"
                            @blur="validateFacebookLink"
                            :class="socialLinksValid.facebook ? '': 'input-invalid'"                            
                        />
                    </div>
                    <div class="social-media-cont">
                        <i class="pi pi-reddit social-media-icon"/>
                        <InputText 
                            v-model="redditLink" 
                            placeholder="https://www.reddit.com/user/example" 
                            class="social-link-input" 
                            maxlength="200"
                            @blur="validateRedditLink"
                            :class="socialLinksValid.reddit ? '': 'input-invalid'"                            
                        />
                    </div>
                    <div class="social-media-cont">
                        <i class="pi pi-twitter social-media-icon"/>
                        <InputText 
                            v-model="xLink" 
                            placeholder="https://x.com/example" 
                            class="social-link-input" 
                            maxlength="200"
                            @blur="validateXLink"
                            :class="socialLinksValid.x ? '': 'input-invalid'"                            
                        />
                    </div>

                    <div class="button-area">
                        <Button label="Save" class="button-save" severity="success" icon="pi pi-save" :disabled="!allSocialLinksValid"/>
                        <Button label="Reset" class="button-save" outlined @click="setSocialMediaLinks(props.socialMediaLink)"/>
                    </div>
            </div>


        </div>
    </Dialog>
</template>

<style scoped>
.dialog-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    overflow-y: auto;
    gap: 30px;
}

.edit-input{
    margin-right: auto;
}

.edit-cont {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    background: var(--blue-dark);
    border: 1px solid var(--gray-dark);
    padding: 10px 15px;
    border-radius: var(--border-rad-main);
    gap: 10px;
    justify-content: space-between;
    width: 700px;
    min-height: 100px;
}

.edit-section{
    display: flex;
    width: 100%;
    gap: 10px;
}


.section-label {
    font-size: 0.6em;
    letter-spacing: .15em;
    text-transform: uppercase;
    font-weight: bold;
    color: var(--gray-bright);
}

/* === username === */
.username-error{
    color: var(--red-vivid);
    align-self: center;
}

.input-invalid{
    border-color: var(--red-vivid);
}

/* ==== bio edit ==== */
.bio-textarea{
    resize: none;
    height: 300px;
}

.button-area{
    display: flex;
    margin-left: auto;
    gap: 10px;
}

/* === file upload === */
.upload-cont{
    overflow-y: scroll;
}

:deep(.p-fileupload) {
    width: 600px;
    max-width: 700px;
    background-color: transparent;
    border: none;
}

:deep(.p-fileupload-choose-button){
    color: var(--primary-1000) !important;
}

:deep(.p-fileupload-upload-button) {
    background-color: var(--p-button-success-background);
    color: var(--p-button-success-color);
}

.file-choose-info{
    color: var(--gray-bright);
}

/* === social media links === */
.social-media-cont{
    display: flex;
    align-items: center;
    gap: 20px;
}

.social-media-icon{
    font-size: 1.7em;
    color: var(--gray-bright);
}

.social-link-input{
    width: 400px;
}

</style>