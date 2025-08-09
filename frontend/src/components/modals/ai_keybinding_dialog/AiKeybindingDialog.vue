<script setup lang="ts">
import { useAiKeybindingDialog } from '@/composables/useAiKeybindingDialog';
import {  watch, ref } from 'vue';
import { Icon } from '@iconify/vue';
import ShinyText from '@/components/vue_bits/ShinyText.vue';
import SuggestionAi from './SuggestionAi.vue';
import { aiGenKeybindingApi } from '@/api/ai_generation/ai_gen_keybinding_api';
import { useToast } from 'primevue';

// interface limitsResponse {
//     status: string,
//     msg: string,
//     data?: {
//         dailyLimit: number,
//         remaining: number,
//         availibleIn?: number
//     }
// }

const {isDialogVisible, hideDialog, activeKey} = useAiKeybindingDialog()
const toast = useToast()

const remainingGenerations = ref(0)
const totalGenerations = ref(0)
const availibleIn = ref(0)
const suggestedGenerations = ref<string[]>(["Generate google shit broskiu wh", "Inn csgo select the first gun", "Adobe create new empty layer"])

const promptText = ref('')
const promptLengthLimit = 400

const isGenerating = ref(false)
const generatedOutput = ref<string | null>(null)

const applySuggestion = (newText: string) => {
    promptText.value = newText
} 

const generateOutput = async () => {
    isGenerating.value = true
    //do the api call and generate the output
    await new Promise(resolve => setTimeout(resolve, 2000));
    isGenerating.value = false
}

//get the limits before opening
watch(isDialogVisible, async () => {
    if (!isDialogVisible.value) return //get the data only when SHOWING the dialog
    const response: any = await aiGenKeybindingApi.getGenerationLimits()

    if (response.status === "error") {
        toast.add({severity: 'error', summary: "Error", detail: response.msg})
        hideDialog()
        return
    }

    remainingGenerations.value = response.data.remaining
    totalGenerations.value = response.data.dailyLimit

    //add the countdown to new availibility
    if (remainingGenerations.value === 0) { 
        availibleIn.value = response.data.availibleIn
    }

})

</script>

<template>
    <Toast/>
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
                    :maxlength="promptLengthLimit"
                    :disabled="isGenerating"
                />
    
                <div class="suggestions-cont">
                    <p>Prompts suggestions:</p>
                    <SuggestionAi v-for="(suggestion, index) in suggestedGenerations" v-bind:key="index"  :text="suggestion" @suggestion-clicked="applySuggestion"/>
                </div>
    
            </div>
            
            <div class="buttons-cont">
                <div class="generate-info">
                    <Button outlined class="generate-btn" @click="generateOutput" :disabled="isGenerating || promptText === ''">
                        <Icon icon="mingcute:ai-fill" class="ai-btn-icon"/>
                        <ShinyText text="Generate" class="shiny-text" :speed="2"/>
                    </Button>
        
                    <p>Remaining <span>{{ remainingGenerations }}/{{ totalGenerations }}</span></p>
                    <p v-if="availibleIn">Refresh in: <span>{{ availibleIn }} minutes</span></p>
                </div>

                <div class="dialog-buttons">
                    <Button 
                        :class="['control-button-dialog', 'dialog-save-button']" 
                        outlined
                        icon="pi pi-file-check"
                        label="Save"
                        :disabled="generatedOutput === null"
                        :loading="isGenerating"
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
    padding: 0 5px
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

.generate-info span{
    color: var(--blue-vivid);
}

.generate-info p {
    color: var(--gray-main);
    margin-right: 30px;
}




.generate-btn{
    color: var(--blue-vivid);
    margin-right: 20px;
}

/* animated ai button */
.ai-btn-icon{
    width: 20px;
    height: 20px;

    animation: ai-jump 2.4s ease-in-out infinite;
    animation-delay: .15s;
    will-change: transform;
}
@keyframes ai-jump {
    0%   { transform: translateY(0) scale(1); }
    10%  { transform: translateY(-6px) scale(1.05); } 
    18%  { transform: translateY(0) scale(1); }       
    22%  { transform: translateY(-3px) scale(1.02); } 
    28%  { transform: translateY(0) scale(1); }
    100% { transform: translateY(0) scale(1); }    
}



.control-button-dialog{
    margin-right: 20px;
}

.dialog-save-button{
    color: var(--green-dark);
}


</style>