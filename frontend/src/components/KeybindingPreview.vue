<script setup lang="ts">
import {onBeforeMount, ref, watch} from 'vue'
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import { useKeybindingSaveEdit } from '@/composables/useKeybindingSavePreview';
import ButtonBox from '@/components/home_page/ButtonBox.vue';
import HomeKnob from '@/components/home_page/HomeKnob.vue'; 
import RoundPageButton from '@/components/home_page/RoundPageButton.vue'; 

interface Props {
    keybidingData: KeybindingDataSave | null
}

const props = defineProps<Props>()
const {getKnobTooltip, convertValueForTooltip, getActionLabel, getTextFromValue, getButtonState, getKnobState} = useKeybindingSaveEdit()

const totalPages = 3
const currentPage = ref(1)
const currentPageButtons = ref()

const getCurrentPageButtons = () => {
    //handle knob
    if (currentPage.value === (totalPages + 1)) {
        currentPageButtons.value = props.keybidingData?.keyBinding[27].value
        console.log(currentPageButtons.value)
    } else {
        const firstIndex = ((currentPage.value - 1) * 9) + 1
        const lastIndex = ((currentPage.value) * 9)
        const pageButtons = props.keybidingData?.keyBinding.filter(button => {
            return Number(button.id) >= firstIndex && Number(button.id) <= lastIndex;
        })
        currentPageButtons.value = pageButtons
    }
}

const changeBindingPage = (pageNum: number) => {
    currentPage.value = pageNum
    getCurrentPageButtons()
}


onBeforeMount(() => {
    currentPage.value = 1
    getCurrentPageButtons()
})

</script>

<template>
    <Transition name="page-slide" mode="out-in">
            <div class="buttons-container" :data-page="currentPage" :key="currentPage">
                <ButtonBox
                    v-if="currentPage <= totalPages"
                    v-for="button in currentPageButtons"
                    :key="button.id"
                    :button-id="button.id"
                    :text="getTextFromValue(button.value)"
                    :state="getButtonState(button.value)"
                    :active-context-menu="null"
                    mode="read"
                    v-tooltip.right="{
                        value: convertValueForTooltip(button.value),
                        disabled: getButtonState(button.value) !== 'multiBinding',
                        pt: {
                            text: {
                                class: 'multi-binding-tooltip',
                                style: 'width: 300px'
                            }
                        }
                    }"
                />

                <HomeKnob
                    v-if="currentPage === (totalPages + 1)"
                    :state="getKnobState(currentPageButtons)"
                    class="knob-display"
                    :mode="'read'"
                    v-tooltip.right="{
                        value: getKnobTooltip(currentPageButtons),
                        disabled: getKnobState(currentPageButtons) !== 'binded',
                        pt: {
                            text: {
                                class: 'multi-binding-tooltip',
                                style: 'width: 300px'
                            }
                        }
                    }"
                />

            </div>
        </Transition>


            
        <div class="page-buttons">
            <RoundPageButton
                v-for="page in totalPages"
                :key="page"
                :number-display="page"
                :enabled="true"
                :data-page="page"
                :class="{ active: currentPage === page }"
                @click="changeBindingPage(page)"
                :mode="'read'"
            />
            <!-- knob button -->
            <RoundPageButton
                :key="'knob'"
                :number-display="'K'"
                :enabled="true"
                :icon="'pi pi-circle-fill'"
                :class="[{ active: currentPage === (totalPages + 1)}, 'knob-page-btn']"
                @click="changeBindingPage(totalPages+1)"
                :mode="'read'"
            />
        </div>

</template>

<style scoped>
.buttons-container{
    display: grid;
    height: 510px;
    width: 510px;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
}

.page-buttons {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: row;
}

.knob-display {
    grid-column: 2;
    grid-row: 2;
}

/* Multi-binding tooltip styling */
/* :deep(.p-tooltip .multi-binding-tooltip){
    width: 300px !important;
    border: var(--gray-main) 1px solid;
    
} */

/* ============ transition animation between pages ========= */
.page-slide-enter-active,
.page-slide-leave-active {
    transition: all 0.2s ease-in-out;
}

.page-slide-enter-from {
    /* opacity: 0; */
    filter: brightness(1.3);
    /* transform: translateX(50px); */
    /* transform: scale(0.95); */
    
}

.page-slide-leave-to {
    /* opacity: 0; */
    /* transform: translateX(-50px); */
    filter: brightness(1.5);
    /* transform: scale(0.95); */
}

.page-slide-enter-to,
.page-slide-leave-from {
    opacity: 1;
    filter: brightness(1.0);
    /* transform: translateX(0); */
    transform: scale(1.0);
}








@media (max-width: 620px){
  .buttons-container{
    transform: scale(.6);
  }
}

/* Keep knob centered */
.knob-display { grid-column: 2; grid-row: 2; }

/* Page buttons wrap when tight */
.page-buttons{
  display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:10px;
}

</style>