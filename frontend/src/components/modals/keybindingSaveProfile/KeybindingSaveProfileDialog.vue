<script setup lang="ts">
import { useEditSaveDialog } from '@/composables/useKeybindingProfileEditDialog';
import { computed, ref, watch } from 'vue';
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import KeybindingPreview from '@/components/KeybindingPreview.vue';
import { keybindingSaveApi } from '@/api/keybinding/keybinding_save';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod' 
import { userKeybindingApi } from '@/api/keybinding/keybinding_user';

interface Props {
    keybidingData: KeybindingDataSave | null
}

const{isDialogVisible, hideDialog} = useEditSaveDialog()
const props = defineProps<Props>()
const emit = defineEmits<{
    dialogHide: []
}>()

// name and description edit
const saveName = ref<string>()
const saveDescription = ref<string>()
const isPublic = ref<boolean>()
const isLiked = ref<boolean>()
const likeCount = ref<number>()

let descriptionOriginal = ""

//edit form validaiton
const resolver = zodResolver(z.object({}))

const isFormEdited = computed<boolean>(() => {
    return saveName.value?.trim() === props.keybidingData?.name &&
        saveDescription.value?.trim() === descriptionOriginal &&
        isPublic.value === props.keybidingData?.public 
})

const restoreFormValues = () => {
    saveName.value = props.keybidingData?.name 
    saveDescription.value = descriptionOriginal
    isPublic.value = props.keybidingData?.public
}

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
        console.log(response)
                
    } catch (error) {
        console.log(error)
        // Revert on error
        isLiked.value = originalLikedState
        likeCount.value = originalLikeCount
        console.error('Error toggling like:', error)
    }
}

// ===== menu items ===========
//items in the menu
const leftMenuItems = computed(() => [
    {
        label: 'Use binding',
        icon: 'pi pi-times',
        command: () => {console.log("sdfsdf")}
    },
    {
        label: 'Send to device',
        icon: 'pi pi-file-import',
        command: () => {console.log("sdfsdf")}

    }

])

watch(() => props.keybidingData, async () => {
    saveName.value = props.keybidingData?.name || ''
    descriptionOriginal = await keybindingSaveApi.getDescription(props.keybidingData?._id as string)
    saveDescription.value = descriptionOriginal
    isPublic.value = props.keybidingData?.public
    isLiked.value = props.keybidingData?.isLiked
    likeCount.value = props.keybidingData?.likeCount
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
                    <Form v-slot="$form" :resolver="resolver" :validate-on-blur="true" class="form-element">
                        <label for="save-name" class="input-label">Name</label>
                        <InputText
                        v-model="saveName"
                        name="saveName"
                        id="save-name"
                        placeholder="Save name"
                        class="form-input"
                        />

                        <label for="save-description" class="input-label">Description</label>
                        <Textarea 
                            v-model="saveDescription" 
                            name="saveDesc" 
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
                                    :disabled="isFormEdited"
                                />
    
                                <Button 
                                    label="Restore"
                                    icon="pi pi-refresh"
                                    outlined
                                    class="button-restore"
                                    :disabled="isFormEdited"
                                    @click="restoreFormValues"
                                />
                            </div>
                        </div>
                    </Form>
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
                </div>

                <MenuBar
                    :model="leftMenuItems"
                />
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
}

.input-label{
    margin-bottom: 10px;
}

.form-input{
    margin-bottom: 20px
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

/* likes conts */
.like-cont{
    display: flex;
    flex-direction: row;
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