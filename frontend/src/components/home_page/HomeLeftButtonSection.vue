<script setup lang="ts">
import {computed} from "vue"
import { useDeviceStore } from "@/stores/deviceStore";
import { storeToRefs } from "pinia";
import { useDeviceActions } from "@/composables/useButtonActions";
import { useAuth } from "@/composables/useAuth";
import SaveBindingDialog from "@/components/modals/SaveBindingDialog.vue";
import { useSaveDialog } from "@/composables/useSaveDialog";

const deviceStore = useDeviceStore()
const {isConnected} = storeToRefs(deviceStore)

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


    </div>
</template>

<style scoped>

:deep(#binding-controlls-menu .pi){
    color: var(--primary-50);    
}

</style>