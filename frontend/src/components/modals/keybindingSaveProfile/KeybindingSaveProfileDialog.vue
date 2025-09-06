<script setup lang="ts">
import { useEditSaveDialog } from '@/composables/dialogVisibility/useKeybindingProfileEditDialog';
import { computed, ref, watch } from 'vue';
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import KeybindingPreview from '@/components/KeybindingPreview.vue';
import { keybindingSaveApi } from '@/api/keybinding/keybinding_save';
import { userKeybindingApi } from '@/api/keybinding/keybinding_user';
import { useConfirm, useToast } from 'primevue';
import { storeToRefs } from 'pinia';
import { useDeviceStore } from '@/stores/deviceStore';
import { useKeybindingSave } from '@/composables/useKeybindingSave';
import { useAuth } from '@/composables/useAuth';

interface Props {
    keybidingData: KeybindingDataSave | null
    editable?: boolean
}

const toast = useToast()
const confirm = useConfirm()

const {currentUser} = useAuth()

const {saveKeybindingToDevice, useCurrentKeybinding, convertDateFormat, likeButtonToggle, validateFormValues} = useKeybindingSave()
const{isDialogVisible, hideDialog} = useEditSaveDialog()
const props = defineProps<Props>()
const emit = defineEmits<{
    dialogHide: [],
    upadeSuccess: [updatedData: any],
    likeChange: [isLiked: boolean, saveId: string, likeCount: number],
    saveDeleted: [saveId: string]
}>()

// name and description edit
const saveName = ref<string>("")
const saveDescription = ref<string>("")
const isPublic = ref<boolean>(false)
const isLiked = ref<boolean>(false)
const likeCount = ref<number>(0)

let descriptionOriginal = ""

const validateFormValuesLocal = (): boolean => {
    return validateFormValues(saveName.value, saveDescription.value)
}

const isFormEdited = computed<boolean>(() => {
    return saveName.value?.trim() !== props.keybidingData?.name ||
        saveDescription.value?.trim() !== descriptionOriginal ||
        isPublic.value !== props.keybidingData?.public 
})

const restoreFormValues = () => {
    saveName.value = props.keybidingData?.name || ''
    saveDescription.value = descriptionOriginal
    isPublic.value = props.keybidingData?.public || false
}

const saveNewInfo = async () => {
    if (!props.keybidingData?._id) return

    //validate the values manually :[
    if (!validateFormValuesLocal()) return

    const saveResult = await userKeybindingApi.editKeybindingSave(saveName.value, saveDescription.value, isPublic.value, props.keybidingData._id)
    
    if (saveResult.status === 'success') {
        toast.add({severity: 'success', summary: "Save updated", life: 1000})
        //set the new data to be the original dat
        descriptionOriginal = saveResult.newData.saveDescription
        emit('upadeSuccess', saveResult.newData)
        dialogHide()
    } else {
        toast.add({severity: 'error', summary: "Error", detail: saveResult.msg, life: 2000})
    }
}

// === likes ===
const likeButtonToggleLocal = async () => {
    if (!props.keybidingData?._id) return

    await likeButtonToggle(props.keybidingData._id, likeCount, isLiked)    

    emit('likeChange', isLiked.value, props.keybidingData._id, likeCount.value)
}

// ===== delete save ======
const deleteSaveConfirm = () => {
    confirm.require({
        header: "Delete save",
        message: "Do you want to permanently delete this save?",
        icon: "pi pi-trash",
        rejectProps: {
            label: "Cancel",
            outlined: true
        },
        acceptProps: {
            label: "Yes",
            outlined: true,
            severity: "warn"
        },
        accept: async () => {
            const deleted = await deleteSave()

            if (deleted) {
                if (props.keybidingData?._id) {
                    emit("saveDeleted", props.keybidingData._id)
                }
                dialogHide()
            } else {
                toast.add({severity: 'error', summary: "Error", detail: "Error deleting this save", life: 2000})
            }    
        },

    })
}

const deleteSave = async (): Promise<boolean> => {
    if (!props.keybidingData?._id) return false
    try {
        const response = await userKeybindingApi.deleteKeybindingSave(props.keybidingData?._id) 
        
        if (response.status === 'success') return true
        else return false
    } catch (error) {
        console.log(error);
        return false
    }
}

// ===== menu items ===========
//items in the menu
const deviceStore = useDeviceStore()
const {isConnected} = storeToRefs(deviceStore)

const leftMenuItems = computed(() => [
    {
        label: 'Use keybinding',
        icon: 'pi pi-arrow-circle-left',
        disabled: !currentUser.value,
        command: useKeybinding
    },
    {
        label: 'Send to device',
        icon: 'pi pi-upload',
        disabled: !isConnected.value || !currentUser.value,
        command: saveToDevice

    }

])

// ==== keybinding actions ====
const saveToDevice = async () => {
    await saveKeybindingToDevice(props.keybidingData?.keyBinding)
}

const useKeybinding = () => {
    if (!props.keybidingData) return
    useCurrentKeybinding(props.keybidingData.keyBinding)
    hideDialog()
}


 
watch(() => props.keybidingData, async () => {
    if (props.keybidingData) {
        saveName.value = props.keybidingData?.name || ''
        descriptionOriginal = await keybindingSaveApi.getDescription(props.keybidingData?._id)
        saveDescription.value = descriptionOriginal
        isPublic.value = props.keybidingData?.public
        isLiked.value = props.keybidingData?.isLiked
        likeCount.value = props.keybidingData?.likeCount
    }
})

const selectOptions = [
    {label: 'Private', icon: 'pi pi-lock', value: false},
    {label: 'Public', icon: 'pi pi-globe', value: true}
]

// === dialog controls ===
const dialogHide = () => {
    hideDialog()
    emit('dialogHide')
} 


</script>

<template>
    <Dialog
        v-model:visible="isDialogVisible"
        modal
        maximizable
        :header="`Edit - ${props.keybidingData?.name}`"
        :style="{width: '90%', height: '90%'}"
        @hide="dialogHide"
    >   
        <div class="dialog-content">
            <div class="left-edit-section">
                <div class="edit-form-cont">
                    <Form :key="props.keybidingData?._id" class="form-element" @submit="saveNewInfo" validate-on-value-update>

                        <label for="save-name" class="input-label">Name</label>
                        <InputText
                        v-model="saveName"
                        name="saveName"
                        id="save-name"
                        placeholder="Save name"
                        class="form-input"
                        maxlength="50"
                        :disabled="!editable"
                        />

                        <label for="save-description" class="input-label">Description</label>
                        <Textarea 
                            v-model="saveDescription" 
                            name="saveDescription" 
                            id="save-description"
                            placeholder="Save description (optional)"
                            class="form-input"
                            maxlength="3000"
                            :disabled="!editable"
                        />
                        
                        <div v-if="editable" class="form-bottom">
                            <SelectButton 
                                v-model="isPublic"
                                :options="selectOptions"
                                option-label="label"
                                option-value="value"
                            >
                                <template #option="{option}">
                                    <i :class="option.icon"/>
                                    <span>{{ option.label }}</span>
                                </template>
                            </SelectButton>

                            <div class="form-button-cont">
                                <Button
                                    label="Save"
                                    icon="pi pi-save"
                                    outlined
                                    class="button-save"
                                    :disabled="!isFormEdited"
                                    type="submit"
                                />
    
                                <Button 
                                    label="Restore"
                                    icon="pi pi-refresh"
                                    outlined
                                    class="button-restore"
                                    :disabled="!isFormEdited"
                                    @click="restoreFormValues"
                                />
                            </div>
                        </div>
                    </Form>

                    <MenuBar
                        :model="leftMenuItems"
                        class="actions-cont"
                    />

                    <div class="like-delete-cont">
                        <ConfirmDialog/>
                        <div v-if="currentUser" class="like-cont">
                            <Button 
                                :label="isLiked ? 'Liked' : 'Like'"
                                :icon="isLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"
                                :class="['button-like', { active: isLiked }]"
                                rounded
                                outlined
                                @click="likeButtonToggleLocal"
                            />
                            <p class="like-count-text"><i class="pi pi-heart-fill like-count-icon"/>{{ likeCount }}</p>
                        </div>
                        
                        <Button
                            v-if="editable"
                            label="Delete"
                            icon="pi pi-trash"
                            rounded
                            class="delete-button"     
                            variant="text"
                            severity="warn"
                            @click="deleteSaveConfirm"     
                        />

                    </div>

                    <div class="user-date-cont">
                        <p>{{ convertDateFormat(props.keybidingData?.createdAt || '') }}</p>
                        <p><i class="pi pi-user"/>{{ props.keybidingData?.username }}</p>
                    </div>
                </div>

       
            </div>


            <div class="keybindig-section">
                <KeybindingPreview :keybiding-data="props.keybidingData" />
            </div>

        </div>

    </Dialog>


</template>

<style scoped>

.dialog-content{
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 100%;
}

.keybinding-section{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.left-edit-section{
    width: 40%;
    max-width: 800px;
    height: 90%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}

/* === edit form element === */
.edit-form-cont{
    display: flex;
    flex-direction: column;
}

.form-element{
    display: flex;
    flex-direction: column;
    margin-bottom: 50px;
}

.input-label{
    margin-bottom: 10px;
}

.form-input{
    margin-bottom: 20px
}
.input-incorrect{
    color: var(--red-vivid);
    border: var(--red-vivid) 1px solid;
}

#save-description{
    height: 150px;
    resize: none !important;
    color: var(--gray-bright);
}

.form-bottom{
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
/* .form-button-cont{
    width: 100%;
    display: flex;
    justify-content: end;
    margin-bottom: 20px;
} */

.button-save{
    color: var(--green-bright);
    margin-right: 20px;
}

.button-restore{
    color: var(--gray-bright);
}

/* actions menu */
.actions-cont {
    display: flex;
    width: 100%;
    justify-content: space-evenly;
    margin-bottom: 20px;
    /* border: 1px solid var(--primary-50);
    border-radius: var(--border-rad-main); */
}

/* likes conts */
.like-delete-cont{
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.like-cont{
    display: flex;
    align-items: center;
}

.like-count-icon{
    margin-right: 5px;
}

.like-count-text{
    color: var(--gray-bright)
}

.button-like{
    width: 150px;
    color: var(--gray-bright);
    margin-right: 15px;
}

.button-like.active{
    color: var(--red-vivid);
}

.user-date-cont{
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 35px;
    color: var(--p-togglebutton-color);
}

.user-date-cont i{
    margin-right: 10px;
}


/* resposnsiblity */
@media (max-width: 1350px) {
    .dialog-content{
        flex-direction: column;
    }

    .left-edit-section{
        width: 80%;
        margin-bottom: 50px;
    }
}

</style>