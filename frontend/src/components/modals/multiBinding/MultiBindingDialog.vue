<script setup lang="ts">
import { useActionCategories } from '@/composables/useActionCategories';
import { useMultiBindingDialogStore } from '@/stores/multiBindingDialogStore';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue'
import ActionsDisplay from '@/components/modals/multiBinding/ActionsDisplay.vue';
import ActionsSelection from '@/components/modals/multiBinding/ActionsSelection.vue';
import { useButtonBindStore } from '@/stores/buttonBindStore';
import { useMulitBindingImport } from '@/composables/useMultiBindingImport';

// const emit = defineEmits<{
//     save: [buttonId: number, actions: any[]]
// }>()

const multiBindingDialogStore = useMultiBindingDialogStore()
const { categories } = useActionCategories()
const {importExistingValues} = useMulitBindingImport()

const {isVisible, activeButtonId, dialogTitle, hasActions, actionsBinded} = storeToRefs(multiBindingDialogStore)
const {closeDialog, addAction, removeAction} = multiBindingDialogStore

const buttonBindStore = useButtonBindStore()

//watch when dialogs opens and import existing values 
watch([isVisible, activeButtonId], ([visible, buttonId]) => {
    if (visible && buttonId) {
        const button = buttonBindStore.allButtons.find(btn => btn.id === buttonId)
        if (button && button.value) importExistingValues(button.value)
        else multiBindingDialogStore.actionsBinded = [] //reset the binding if it is empty
    }
})


const handleSave = () => {
    const multiBindingValues: string[] = actionsBinded.value.map((actionData, index) => {
        if (!actionData.requiresInput) return `${index}_${actionData.value}_`
        
        return `${index}_${actionData.actionCode}_${actionData.value.trim()}`

    })

    // add the multi at the start, so the controlled knows how to treat the values
    multiBindingValues.unshift('multi'); 

    
    if (multiBindingValues.length > 1) {
        buttonBindStore.updateButton(activeButtonId.value!, {
            value: multiBindingValues,
            state: "multiBinding",
            // text: `multi(${multiBindingValues.length - 1})`
        })
    } else {
        
        buttonBindStore.updateButton(activeButtonId.value!, {
            value: [],
            state: 'notBinded'
        })
    }

    // emit('save', activeButtonId.value!, multiBindingValues)
    closeDialog()
}

</script>


<template>
    <Dialog 
        v-model:visible="isVisible"
        modal
        class="multi-binding-dialog"
        @hide="closeDialog"
        :style="{ width: '70%', height: '80%' }"
        :header="dialogTitle"
    >
        <!-- Main content container -->
        <div class="multi-dialog-container">
            <!-- Left side - Actions display (Drop zone) -->
            <ActionsDisplay
            />

            <!-- Right side - Actions selection (Drag source) -->
            <ActionsSelection
                class="actions-select-cont"
            />

            <!-- controls buttons -->
            <div class="control-buttons-dialog">
                <Button 
                    :class="['control-button-dialog', 'dialog-save-button']" 
                    outlined
                    icon="pi pi-file-check"
                    label="Save"
                    @click="handleSave"

                />
                <Button 
                    :class="['control-button-dialog', 'dialog-cancel-button']" 
                    outlined
                    label="Cancel"
                    icon="pi pi-times-circle"
                    @click="closeDialog"
                />
            </div>
        </div>

        <!-- <div class="actions-select-cont">

        </div>

        <div class="control-buttons-dialog">
            <Button 
                :class="['control-button-dialog', 'dialog-save-button']" 
                outlined
                icon="pi pi-file-check"
                label="Save"

            />
            <Button 
                :class="['control-button-dialog', 'dialog-cancel-button']" 
                outlined
                label="Cancel"
                icon="pi pi-times-circle"
                @click="closeDialog"
            />
        </div> -->
        

    </Dialog>

</template>


<style scoped>

.multi-dialog-container{
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
}


.control-buttons-dialog{
    position: absolute;
    right: 0;
    bottom: 0;
}

.control-button-dialog{
    margin-right: 20px;
}

.dialog-save-button{
    color: var(--green-dark);
}




</style>