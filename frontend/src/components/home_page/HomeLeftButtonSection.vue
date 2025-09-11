<script setup lang="ts">
import {computed} from "vue"
import { useDeviceStore } from "@/stores/deviceStore";
import { storeToRefs } from "pinia";
import { useDeviceActions } from "@/composables/useButtonActions";
import { useAuth } from "@/composables/useAuth";
import SaveBindingDialog from "@/components/modals/SaveBindingDialog.vue";
import { useSaveDialog } from "@/composables/dialogVisibility/useSaveDialog";
import { useButtons } from "@/composables/useButtonsBindingHome";

const deviceStore = useDeviceStore()
const {isConnected} = storeToRefs(deviceStore)
const {currentBindingName} = useButtons()

const {resetButtons, importData} = useDeviceActions()


const {isLoggedIn} = useAuth()

const {showDialog} = useSaveDialog()
const showSaveDialog = () => {
    showDialog()
}


//items in the menu
const items = computed(() => [
    {
        label: 'Controls',
        items: [
            {
                label: 'Reset',
                icon: 'pi pi-refresh',
                command: resetButtons
            },
            {
                label: 'Import from device',
                icon: 'pi pi-file-import',
                disabled: !isConnected.value,
                command: importData
            },
            {
                label: 'Save preset',
                icon: 'pi pi-save',
                disabled: !isLoggedIn.value,
                command: showSaveDialog
            }
        ]
    }
])

</script>

<template>
    <div id="left-section">
        <div>
            <ConfirmDialog/>
            <SaveBindingDialog/>
            <Menu :model="items" id="binding-controlls-menu" class="box-shadow-normal"/>
        </div>
        <div v-if="currentBindingName !== 'custom'" class="current-save-display">
            <div class="blinking-icon"></div>
            <span class="save-info">Editing:</span>
            <span class="save-name">{{ currentBindingName }}</span>
        </div>


    </div>
</template>

<style scoped>

:deep(#binding-controlls-menu .pi){
    color: var(--primary-50);    
}

.current-save-display{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 20px;
    max-width: 230px;
    text-align: center;
}

.save-info{
    color: var(--primary-600);
    margin-right: 10px;
}

.save-name{
    color: var(--primary-50);
    /* font-weight: bold; */
}

.blinking-icon {
    width: 15px;
    height: 15px;
    background-color: var(--primary-600);
    border-radius: 50%;
    margin-right: 5px;
    animation: blink 1s infinite alternate;
}
@keyframes blink {
    0% { opacity: 1; }   /* Fully visible */
    100% { opacity: 0.5; } /* Fades out */
}
</style>