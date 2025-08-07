<script setup lang="ts">
import { useEditSaveDialog } from '@/composables/useKeybindingProfileEditDialog';
import { computed, ref, watch, toRaw } from 'vue';
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import KeybindingPreview from '@/components/KeybindingPreview.vue';
import { keybindingSaveApi } from '@/api/keybinding/keybinding_save';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod' 
import { userKeybindingApi } from '@/api/keybinding/keybinding_user';
import { useConfirm, useToast } from 'primevue';
import { storeToRefs } from 'pinia';
import { useDeviceStore } from '@/stores/deviceStore';
import { useButtonBindStore } from '@/stores/buttonBindStore';
import { useButtons } from '@/composables/useButtonsBindingHome';
import { useRouter } from 'vue-router';
import type { KnobBindHome } from '@/types/buttonBindHome';

interface Props {
    keybidingData: KeybindingDataSave | null
}

const toast = useToast()
const confirm = useConfirm()
const router = useRouter()


const{isDialogVisible, hideDialog} = useEditSaveDialog()
const props = defineProps<Props>()
const emit = defineEmits<{
    dialogHide: [],
    upadeSuccess: [updatedData: any],
    likeChange: [isLiked: any],
    saveDeleted: [saveId: string]
}>()

// name and description edit
const saveName = ref<string>()
const saveDescription = ref<string>()
const isPublic = ref<boolean>()
const isLiked = ref<boolean>()
const likeCount = ref<number>()



let descriptionOriginal = ""

const validateFormValues = (): boolean => {
    let valid = true
    const currentNameLength = saveName.value?.trim().length 
    const currentDescLength = saveDescription.value?.trim().length 
    if (currentNameLength!! < 3 || currentNameLength!! > 50) {
        toast.add({severity: 'warn', summary: "Name length must be 3-50 characters", life: 1000})
        valid = false
    } 
    if (currentDescLength!! > 3000) {
        toast.add({severity: 'warn', summary: "Description length must be 0-3000 characters", life: 1000})
        valid = false
    }

    return valid
}

const isFormEdited = computed<boolean>(() => {
    return saveName.value?.trim() !== props.keybidingData?.name ||
        saveDescription.value?.trim() !== descriptionOriginal ||
        isPublic.value !== props.keybidingData?.public 
})

const restoreFormValues = () => {
    saveName.value = props.keybidingData?.name 
    saveDescription.value = descriptionOriginal
    isPublic.value = props.keybidingData?.public
}

const saveNewInfo = async () => {
    if (!props.keybidingData?._id) return

    //validate the values manually :[
    if (!validateFormValues()) return

    const saveResult = await userKeybindingApi.editKeybindingSave(saveName.value!!, saveDescription.value!!, isPublic.value!!, props.keybidingData._id)
    
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
const likeButtonToggle = async () => {
    if (!props.keybidingData?._id) return

    const originalLikedState = isLiked.value
    const originalLikeCount = likeCount.value

    // Optimistically update UI
    isLiked.value = !isLiked.value
    
    if (isLiked.value) {
        likeCount.value = (likeCount.value ?? 0) + 1
    } else {
        likeCount.value = Math.max(0, (likeCount.value ?? 1) - 1) // Prevent negative counts
    }

    try {
        const response = await keybindingSaveApi.toggleLike(isLiked.value, props.keybidingData._id)
        
        emit('likeChange', {isLiked: isLiked.value, saveId: props.keybidingData._id, likeCount: likeCount.value})
    } catch (error) {
        console.log(error)
        // Revert on error
        isLiked.value = originalLikedState
        likeCount.value = originalLikeCount
        console.error('Error toggling like:', error)
    }
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
const {sendToDevice} = deviceStore

const buttonBindStore = useButtonBindStore()
const {initButtons, resetButton} = useButtons()

const leftMenuItems = computed(() => [
    {
        label: 'Use keybinding',
        icon: 'pi pi-arrow-circle-left',
        tooltip: 'Device not connected',
        command: useKeybinding
    },
    {
        label: 'Send to device',
        icon: 'pi pi-upload',
        disabled: !isConnected.value,
        command: saveToDevice

    }

])

// ==== keybinding actions ====
const saveToDevice = async () => {
    if (!isConnected.value || !props.keybidingData) return

    // convert data for export
    const dataToSend: Record<string, string[]> = {}

    const originalData = JSON.parse(JSON.stringify(props.keybidingData.keyBinding));
    
    originalData.forEach((btn: any) => {
        dataToSend[String(btn.id)] = toRaw(btn.value)
    })

    console.log(dataToSend)

    await sendToDevice(dataToSend)
}

const useKeybinding = () => {
    if (!props.keybidingData) return

    const originalData = JSON.parse(JSON.stringify(props.keybidingData.keyBinding))

    //init the buttons if there are not
    if (buttonBindStore.allButtons.length === 0) {initButtons()}
    buttonBindStore.resetAllButtons() //reset current binding


    originalData.forEach((btn: any) => {
        if (btn.id === 'knob') {
            const state = btn.value.every((value: string) => value === '') ? 'notBinded' : 'binded'
            const knobElement: KnobBindHome = {state: state, values: {left: btn.value[0], right: btn.value[1], button: btn.value[2]}}
            buttonBindStore.setKnob(knobElement)
        }

        const state = buttonBindStore.getStateFromValue(btn.value)
        buttonBindStore.updateButton(Number(btn.id), {state: state, value: btn.value})
    })

    dialogHide()
    router.push("/app")
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
    // console.log(isFormEdited.value)
    // //if the form is edited and unsaved, user confirm
    // if (isFormEdited.value) {
    //     showConfirmClose()
    // } else {
    //     hideDialog()
    //     emit('dialogHide')
    // }

} 

// const showConfirmClose = () => {
//     confirm.require({
//         header: "Loose edited data",
//         message: "Do you want to close the dialog and loose all unsaved edits?",
//         icon: "pi pi-question",
//         rejectProps: {
//             label: "Cancel",
//             outlined: true
//         },
//         acceptProps: {
//             label: "Yes",
//             outlined: true,
//             severity: "warn"
//         },
//         accept: () => {
//             hideDialog()
//             emit('dialogHide')
//         }
//     })
// }

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
                    <Form :key="props.keybidingData?._id" v-slot="$form" class="form-element" @submit="saveNewInfo" validate-on-value-update>

                        <label for="save-name" class="input-label">Name</label>
                        <InputText
                        v-model="saveName"
                        name="saveName"
                        id="save-name"
                        placeholder="Save name"
                        class="form-input"
                        maxlength="50"
                        />

                        <label for="save-description" class="input-label">Description</label>
                        <Textarea 
                            v-model="saveDescription" 
                            name="saveDescription" 
                            id="save-description"
                            placeholder="Save description (optional)"
                            class="form-input"
                            maxlength="3000"
                        />
                        
                        <div class="form-bottom">
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
                        <div class="like-cont">
                            <Button 
                                :label="isLiked ? 'Liked' : 'Like'"
                                :icon="isLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"
                                :class="['button-like', { active: isLiked }]"
                                rounded
                                outlined
                                @click="likeButtonToggle"
                            />
                            <p class="like-count-text"><i class="pi pi-heart-fill like-count-icon"/>{{ likeCount }}</p>
                        </div>
                        
                        <Button
                            label="Delete"
                            icon="pi pi-trash"
                            rounded
                            class="delete-button"     
                            variant="text"
                            severity="warn"
                            @click="deleteSaveConfirm"     
                        />

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

</style>