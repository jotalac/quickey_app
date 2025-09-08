<script setup lang="ts">
import { authFormApi } from '@/api/auth/auth_form_api';
import type { AuthUser } from '@/api/auth/auth_service';
import { profileEditApi } from '@/api/profile/profile_edit_api';
import type { SocialLinks } from '@/components/profile/ProfileDisplay.vue';
import { useAuth } from '@/composables/useAuth';
import { useProfileEditDialog } from '@/composables/dialogVisibility/useProfileEditDialog';
import { useToast } from 'primevue';
import {ref, computed, watch} from 'vue'
import EditSocialMediaLinks from '@/components/modals/profile_edit_dialog/EditSocialMediaLinks.vue';


interface Props {
    username: string,
    bio: string,
    socialMediaLink: SocialLinks[]
}

const {isDialogVisible, hideDialog} = useProfileEditDialog()
const { setCurrentUser} = useAuth()
const toast = useToast()

const props = defineProps<Props>()

const emit = defineEmits<{
    bioUpdated: [bioText: string], 
    socialLinksUpdated: [newLinks: SocialLinks[]],
    profilePicUpdated: [profilePicUrl: string]
}>()

//initial values
const newUsername = ref('')
const newBio = ref('')
const fileUploadRef = ref<any>(null);

const usernameEdited = computed(() => newUsername.value.trim() !== props.username)
const usernameValid = ref<{valid: boolean, msg: string}>({valid: true, msg: ""}) 

const bioEdited = computed(() => newBio.value.trim() !== props.bio)

watch(() => isDialogVisible.value, () => {
    newBio.value = props.bio
    newUsername.value = props.username
})

// === usrename handling ===
const saveUsername = async () => {
    try {
        const response = await profileEditApi.editUsername(newUsername.value)
        
        if (response.status === 'success') {
            const newName = response.data as AuthUser
            setCurrentUser(newName)
            toast.add({severity: "success", summary: "Username changed!", life: 700})
        } else {
            toast.add({severity: "error", summary: "Error", detail: response.msg, life: 2000})
        }
        
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

        if (response.status === 'success') {
            emit('bioUpdated', newBio.value.trim())
            toast.add({severity: "success", summary: "Bio updated!", life: 700})
        } else {
            toast.add({severity: "error", summary: "Error saving new bio", life: 1000})
        }

    } catch (error) {
        console.log(error)
    }
}

// === image upload handle ===
const uploadNewImage = async (event: any) => {
    const newFile: File | undefined = event.files?.[0]

    if (!newFile) {
        console.log("No file selected for upload")
        return 
    }

    console.log(newFile.name, newFile.size, newFile.type )

    try {
        const response = await profileEditApi.editProfilePicture(newFile)

        if (response.status === 'success') {
            emit('profilePicUpdated', response.url)
            toast.add({severity: "success", summary: "Profile picture updated!", life: 700})
            fileUploadRef.value?.clear(); 
        } else {
            console.log(response);
            
            toast.add({severity: "error", summary: "Error", detail: response.msg, life: 2000})
        }
    } catch (error) {
        console.log(error)
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
                <FileUpload ref="fileUploadRef" name="profilePic" @uploader="uploadNewImage($event)" :custom-upload="true" mode="advanced" :multiple="false" accept="image/*" :file-limit="1" :max-file-size="4000000">
                    <template #empty>
                        <span class="file-choose-info">Drag and drop images here to upload</span>
                    </template>
                </FileUpload>
            </div>

            <div class="edit-cont">
                <span class="section-label">Social media links</span>
                    <EditSocialMediaLinks :social-media-link="props.socialMediaLink" @updated="emit('socialLinksUpdated', $event)"/>
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






/* Let dialog body shrink and avoid horizontal scroll */
:deep(.p-dialog) { max-width: 100vw; }
:deep(.p-dialog-content) { max-width: 100%; overflow-x: hidden; }

/* Critical: allow flex items to shrink below content size */
.dialog-content,
.edit-cont,
.edit-section { min-width: 0; }

/* Panels fill dialog width but cap at a reasonable max */
.edit-cont {
  width: 100%;
  max-width: 700px;           /* cap on large screens */
  box-sizing: border-box;
}

/* Inputs and upload must not force width */
.edit-input,
.bio-textarea,
:deep(.p-fileupload) { width: 100%; min-width: 0; }

/* FileUpload buttons wrap instead of overflowing */
:deep(.p-fileupload .p-fileupload-buttonbar) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
:deep(.p-fileupload .p-button) { flex: 1 1 auto; }

/* Tighter layout on phones */
@media (max-width: 640px){
  .dialog-content { padding: 6px 4px; gap: 14px; }
  .edit-cont { padding: 12px; }
  .edit-section { flex-wrap: wrap; gap: 10px; }
  .button-area { width: 100%; justify-content: stretch; gap: 8px; flex-wrap: wrap; }
  .button-area :deep(.p-button) { flex: 1 1 100%; }
}


/* Let dialog body shrink and avoid horizontal scroll */
:deep(.p-dialog) { max-width: 100vw; }
:deep(.p-dialog-content) { max-width: 100%; overflow-x: hidden; }

/* Critical: allow flex items to shrink below content size */
.dialog-content,
.edit-cont,
.edit-section { min-width: 0; }

/* Panels fill dialog width but cap at a reasonable max */
.edit-cont {
  width: 100%;
  max-width: 700px;           /* cap on large screens */
  box-sizing: border-box;
}

/* Inputs and upload must not force width */
.edit-input,
.bio-textarea,
:deep(.p-fileupload) { width: 100%; min-width: 0; }

/* FileUpload buttons wrap instead of overflowing */
:deep(.p-fileupload .p-fileupload-buttonbar) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
:deep(.p-fileupload .p-button) { flex: 1 1 auto; }

/* Tighter layout on phones */
@media (max-width: 640px){
  .dialog-content { padding: 6px 4px; gap: 14px; }
  .edit-cont { padding: 12px; }
  .edit-section { flex-wrap: wrap; gap: 10px; }
  .button-area { width: 100%; justify-content: stretch; gap: 8px; flex-wrap: wrap; }
  .button-area :deep(.p-button) { flex: 1 1 100%; }
}

</style>