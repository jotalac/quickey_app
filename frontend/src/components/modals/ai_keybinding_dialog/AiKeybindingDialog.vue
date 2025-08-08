<script setup lang="ts">
import { useAiKeybindingDialog } from '@/composables/useAiKeybindingDialog';
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import ShinyText from '@/components/vue_bits/ShinyText.vue';
import SuggestionAi from './SuggestionAi.vue';

// interface Props {
//     keyNumber: number
// }

// const props = defineProps<Props>()
const {isDialogVisible, hideDialog, activeKey} = useAiKeybindingDialog()

const promptText = ref('')

</script>

<template>
    <Dialog
        v-model:visible="isDialogVisible"
        modal
        :header="`AI keybinding generation - key ${activeKey}`"
        :style="{width: '70%', height: '400px'}"
        @hide="hideDialog"
    >   
        <div class="dialog-content">
            <div class="main-cont">
                <Textarea
                    v-model="promptText"
                    class="prompt-input"
                    placeholder="Prompt (describe your action)"
                    maxlength="400"
                />
    
                <div class="suggestions-cont">
                    <p>Suggestions</p>
                    <SuggestionAi text="Generate google shit broskiu wh"/>
                    <SuggestionAi text="In csgo select the first gun"/>
                    <SuggestionAi text="Adobe create new empty layer"/>
                </div>
    
            </div>
            
            <div class="buttons-cont">
                <div class="generate-info">
                    <Button outlined class="generate-btn">
                        <Icon icon="mingcute:ai-fill" class="ai-btn-icon"/>
                        <ShinyText text="Generate" class="shiny-text" :speed="2"/>
                    </Button>
        
                    <p>Remaining 1/3</p>
                </div>

                <div class="dialog-buttons">
                    <Button 
                        :class="['control-button-dialog', 'dialog-save-button']" 
                        outlined
                        icon="pi pi-file-check"
                        disabled
                        label="Save"
                    />
                    <Button 
                        class="control-button-dialog" 
                        outlined
                        label="Cancel"
                        icon="pi pi-times-circle"
                        @click="hideDialog"
                    />
                </div>
            </div>

        </div>

    </Dialog>

</template>

<style scoped>

.dialog-content{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.main-cont{
    display: flex;
    align-items: start;
    justify-content: space-between;
    width: 100%;
}

.prompt-input{
    height: 200px;
    width: 70%;
    resize: none;
    margin-bottom: 20px;
}

.suggestions-cont{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 300px;
}

.suggestions-cont p {
    width: 100%;
    color: var(--gray-main);
}

.buttons-cont{
    width: 100%;
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.generate-info{
    display: flex;
    align-items: center;
}

.generate-info p {
    color: var(--gray-main);
}

.generate-btn{
    color: var(--blue-vivid);
    margin-right: 20px;
}

.ai-btn-icon{
    width: 20px;
    height: 20px;
}

.control-button-dialog{
    margin-right: 20px;
}

.dialog-save-button{
    color: var(--green-dark);
}


</style>