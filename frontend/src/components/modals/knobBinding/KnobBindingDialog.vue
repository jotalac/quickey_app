<script setup lang="ts">
import { useKnobDialogStore } from '@/stores/knobDialogStore';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import KnobActionSelect from '@/components/modals/knobBinding/KnobActionSelect.vue';
import { useKnobActionCategories } from '@/composables/useKnobActionCategories';
import { useButtonBindStore } from '@/stores/buttonBindStore';
import type { KnobBindHome } from '@/types/buttonBindHome';
import {ref, watch} from 'vue'

const dialogStore = useKnobDialogStore()
const {isVisible} = storeToRefs(dialogStore)
const {rotateCategories, buttonCategories} = useKnobActionCategories()

const buttonBindStore = useButtonBindStore()
// const {knobElement} = storeToRefs(useButtonBindStore())

//import the state when opening the dialog
watch(isVisible, (visible) => {
    if (visible) {
        const currentKnob = buttonBindStore.knobElement
        if(currentKnob) {
            knobElementDialog.value = {
                state: currentKnob.state,
                values: { ...currentKnob.values} 
            }
        } else {
            knobElementDialog.value = {
                state: 'notBinded',
                values: {left: '', right: '', button: ''}
            }
        }
    }
})

const saveBinding = () => {
    buttonBindStore.setKnob({ ...knobElementDialog.value }) //create deep copy
    dialogStore.closeDialog()
}

const knobElementDialog = ref<KnobBindHome>({state: 'notBinded', values: {left: '', right: '', button: ''}})

const handleActionSelected = (type: 'left' | 'right' | 'button', value: string) => {
    console.log("Type: " +type);
    console.log("Value: " + value);
    
    knobElementDialog.value.values[type] = value
    knobElementDialog.value.state = 'binded'
}

const handleActionDelete = (type: 'left' | 'right' | 'button') => {
    knobElementDialog.value.values[type] = ''

    if (knobElementDialog.value.values.button === '' && knobElementDialog.value.values.left === '' && knobElementDialog.value.values.right === '' ) {
        knobElementDialog.value.state = 'notBinded'
    }
}

const closeDialog = () => {
    knobElementDialog.value = {
        state: 'notBinded',
        values: { left: '', right: '', button: '' }
    }
    dialogStore.closeDialog()
}

</script>

<template>
    <Dialog
        v-model:visible="isVisible"
        modal
        header="Knob binding"
        :style="{width: '70vw', height: '300px'}"
        :breakpoints="{ '1200px':'80vw',  '1000px': '95vw'}"
        @hide="dialogStore.closeDialog"
        
    >
        <div class='knob-dialog-content'>
            <div class="dialog-content-section">
                <p class="section-header"><Icon icon="material-symbols:rotate-left" class="section-icon"/>Rotate left</p>
                <KnobActionSelect :action-categories="rotateCategories" type="left" @action-selected="handleActionSelected" @action-delete="handleActionDelete" :default-value="knobElementDialog.values.left"/>
            </div>

            <div class="dialog-content-section">
                <p class="section-header"><Icon icon="material-symbols:rotate-right" class="section-icon"/>Rotate right</p>
                <KnobActionSelect :action-categories="rotateCategories" type="right" @action-selected="handleActionSelected" @action-delete="handleActionDelete" :default-value="knobElementDialog.values.right"/>
            </div>

            <div class="dialog-content-section">
                <p class="section-header"><Icon icon="tdesign:gesture-click-filled" class="section-icon"/> Knob button</p>
                <KnobActionSelect :action-categories="buttonCategories" type="button" @action-selected="handleActionSelected" @action-delete="handleActionDelete" :default-value="knobElementDialog.values.button"/>
            </div>

            <div class="control-buttons-dialog">
                <Button 
                    :class="['control-button-dialog', 'dialog-save-button']" 
                    outlined
                    icon="pi pi-file-check"
                    label="Save"
                    @click="saveBinding"
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
    </Dialog>

</template>

<style scoped>


.knob-dialog-content{
    display: flex;
    width: 100%;
    justify-content: space-evenly;
    padding: 10px 30px;
    padding-bottom: 50px;
}

.dialog-content-section{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
}

.section-icon{
    width: 25px;
    height: 25px;
    margin-right: 10px;
}

.section-header{
    display: flex;
    text-align: center;
    align-items: center;
    margin-bottom: 20px;
}

.knob-select{
    width: 100%;
}

.control-buttons-dialog{
    position: absolute;
    right: 10px;
    bottom: 20px;
}

.control-button-dialog{
    margin-right: 20px;
}

.dialog-save-button{
    color: var(--green-dark);
}

@media (max-width: 900px) {
    .knob-dialog-content{
        flex-direction: column;
        align-items: center;
    }

    .dialog-content-section{
        width: 90%;
        margin-bottom: 40px;
    }


}

</style>