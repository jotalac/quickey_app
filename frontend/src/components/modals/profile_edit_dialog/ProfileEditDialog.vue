<script setup lang="ts">
import type { SocialLinks } from '@/components/profile/ProfileDisplay.vue';
import { useProfileEditDialog } from '@/composables/useProfileEditDialog';
import {ref, computed, onBeforeMount, watch} from 'vue'


interface Props {
    username: string,
    bio: string,
    socialMediaLink: SocialLinks[]
}

const {isDialogVisible, hideDialog} = useProfileEditDialog()

const props = defineProps<Props>()

//initial values
const newUsername = ref('')
const newBio = ref('')
const profilePicFile = ref<File | null>(null)

const instagramLink = ref()

const usernameEdited = computed(() => newUsername.value.trim() !== props.username)
const bioEdited = computed(() => newBio.value.trim() !== props.bio)

watch(() => isDialogVisible.value, () => {
    newBio.value = props.bio
    newUsername.value = props.username
    setSocialMediaLinks(props.socialMediaLink)
})

const setSocialMediaLinks = (socialLinks: SocialLinks[]) => {
    instagramLink.value = socialLinks.find((item) => item.platform === 'instagram')?.url
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
                    <InputText v-model="newUsername" name="newUsername" class="edit-input" placeholder="New username" maxlength="20" minlength="3"/>
                    <Button label="Save" class="button-save" severity="success" icon="pi pi-save" :disabled="!usernameEdited"/>
                    <Button label="Reset" class="button-save" outlined :disabled="!usernameEdited" @click="newUsername = props.username"/>
                </div>
            </div>

            <div class="edit-cont">
                <span class="section-label">Bio</span>
                    <Textarea v-model="newBio" name="newBio" class="bio-textarea" placeholder="Your new bio " maxlength="1000"/>
                    <div class="button-area">
                        <Button label="Save" class="button-save" severity="success" icon="pi pi-save" :disabled="!bioEdited" />
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
                        <InputText placeholder="https://instagram.com/example" class="social-link-input" :default-value="instagramLink"/>
                    </div>
                    <div class="social-media-cont">
                        <i class="pi pi-facebook social-media-icon"/>
                        <InputText placeholder="https://facebook.com/example" class="social-link-input"/>
                    </div>
                    <div class="social-media-cont">
                        <i class="pi pi-reddit social-media-icon"/>
                        <InputText placeholder="https://reddit.com/example" class="social-link-input"/>
                    </div>
                    <div class="social-media-cont">
                        <i class="pi pi-twitter social-media-icon"/>
                        <InputText placeholder="https://x.com/example" class="social-link-input"/>
                    </div>

                    <div class="button-area">
                        <Button label="Save" class="button-save" severity="success" icon="pi pi-save" />
                        <Button label="Reset" class="button-save" outlined/>
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