<script setup lang="ts">
import { useSaveDialog } from '@/composables/dialogVisibility/useSaveDialog';
import {onBeforeMount, onMounted, ref, toRaw} from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod'
import { userKeybindingApi } from '@/api/keybinding/keybinding_user';
import type { ButtonBindHome, ButtonBindSave, KnobBindHome } from '@/types/buttonBindHome';
import { useButtons } from '@/composables/useButtonsBindingHome';
import { useToast } from 'primevue';
import { useConstantsStore } from '@/stores/constantsStore';
import { storeToRefs } from 'pinia';


const {isDialogVisible, hideDialog} = useSaveDialog()
const nameServerError = ref('')
const {allButtons, knobElement, currentBindingName} = useButtons()
const toast = useToast()

//get the categories
const constantsStore = useConstantsStore()
const {keybindingCategories} = storeToRefs(constantsStore)

const handleCancel = () => {
    hideDialog()
}

//form handler
const resolver = zodResolver(
    z.object({
        saveName: z.string().trim()
            .min(1, "Name is requiered")
            .min(3, "Minimum 3 characters are requiered")
            .max(50, "Maximum 50 characters allowed"),
        saveDescription: z.union([z.string().url().nullish(), z.literal(""), z.string().max(3000, "Max desc length is 3000 characters")]),
        saveCategory: z.string().min(1, "Please select a category")
    })
)

const checkNameBlur = async (name: string) => {
    nameServerError.value = ''

    const nameAvailible = await userKeybindingApi.verifyKeybindingName(name.trim())

    if (!nameAvailible) {
        nameServerError.value = "Name is already used"
    } 
}

const onSubmit = async ({valid, values, reset}: {valid: boolean, values: any, reset: () => void}) => {
    if (!valid) return

    if (nameServerError.value) return

    //get data for save
    const saveBidingData = convertDataForSave(allButtons.value, knobElement.value)
    if (allDefaultValues(saveBidingData)) {
        toast.add({severity: 'error', summary: "Error saving", detail: "Cannot save empty values", life: 1500})
        return
    }

    const saveResult = await userKeybindingApi.saveKeybinding(saveBidingData, values.saveName, values.saveDescription, values.saveCategory)
    
    if (saveResult.status === 'success') {
        toast.add({severity: 'success', summary: "Keybinding saved successfully", life: 1000})
        currentBindingName.value = values.saveName
        hideDialog()
    } else {
        toast.add({severity: 'error', summary: "Error", detail: saveResult.msg, life: 2000})
    }
}

//helper funcations
const convertDataForSave = (originalData: ButtonBindHome[], knobData: KnobBindHome): ButtonBindSave[] => {
    const saveData: ButtonBindSave[] =  []
    //add buttons data
    originalData.forEach((btn: ButtonBindHome) => {
        saveData.push({id: String(btn.id), value: btn.value})
    })

    //add knob data
    saveData.push({id: 'knob', value: [knobData.values.left, knobData.values.right, knobData.values.button]})

    return saveData
}   


const allDefaultValues = (saveData: ButtonBindSave[]): boolean => {
    return saveData.every(btn => {
        if (btn.id === "knob") {
            // Knob is empty if all three values are empty strings
            return btn.value.length === 3 && btn.value.every(val => val.trim() === "")
        } else {
            // Regular button is empty if no non-empty values
            return btn.value.length === 0
        }
    })
}



</script>

<template>
    <Dialog
        v-model:visible="isDialogVisible"
        modal
        header="Save Binding Preset"
        :style="{width: '700px', height: '550px'}"
        @hide="handleCancel"
    >
            <Form v-slot="$form" :resolver="resolver" @submit="onSubmit" class="dialog-form">

                <FormField initial-value="">
                    <label for="save-name" class="input-label"><i class="pi pi-save"/>Save name*</label>
                    <InputText 
                        id="save-name" 
                        name="saveName" 
                        :class="['form-input', {'input-incorrect': nameServerError}]"
                        @blur="(event: Event) => checkNameBlur((event.target as HTMLInputElement).value)"
                        placeholder="Name - must be unique within your saves" 
                        maxlength="50"
                        v-tooltip.top="{
                            value: nameServerError,
                            pt: {
                                text: {class: 'error-tooltip-text'}
                            }
                        }"
                    />
                </FormField>

                <FormField initial-value="">
                    <label for="save-description" class="input-label"><i class="pi pi-pencil"/>Save description</label>
                    <Textarea id="save-description" name="saveDescription" class="form-input" placeholder="Description ... " maxlength="3000"/>
                </FormField>

                <FormField initial-value="general">
                    <label for="save-category" class="input-label"><i class="pi pi-bars"/>Category*</label>
                    <Select 
                        id="save-category" 
                        name="saveCategory" 
                        class="form-input" 
                        placeholder="Select category" 
                        :options="keybindingCategories"
                    />
                </FormField>


                <div class="button-area">
                    <Button
                        label="Save"
                        outlined
                        icon="pi pi-save"
                        class="save-button"
                        type="submit"
                    />
                    <Button
                        label="Cancel"
                        outlined
                        icon="pi pi-times"
                        class="cancel-button"
                        @click="hideDialog"
                    />
                </div>

            </Form>

    </Dialog>

</template>

<style scoped>
.dialog-form{
    width: 100%;
}

.form-input{
    width: 100% !important;
    margin-top: 10px;
    margin-bottom: 30px;
}

.input-incorrect{
    color: var(--red-vivid);
    border: var(--red-vivid) 1px solid;
}

#save-description{
    height: 150px;
    resize: none !important;
}

.input-label{
    color: var(--gray-bright);
}

.input-label i {
    margin-right: 10px;
}

#save-description{ 
    font-size: var(--smaller-text) !important;
}


/* buttons */
.button-area{
    display: flex;
    justify-content: end;
}

.save-button{
    color: var(--green-dark);
    margin-right: 15px;
}


</style>