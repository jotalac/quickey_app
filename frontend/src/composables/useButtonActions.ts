import { useButtonBindStore } from '@/stores/buttonBindStore'
import { useDeviceStore } from '@/stores/deviceStore'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from "primevue/usetoast";
import { useButtons } from './useButtonsBindingHome';


export function useDeviceActions () {
    const deviceStore = useDeviceStore()
    const buttonStore = useButtonBindStore()
    const {currentBindingName} = useButtons()

    // const {isConnected} = storeToRefs(deviceStore)
    const {importFromDevice} = deviceStore

    const confirm = useConfirm()
    const toast = useToast()

    const resetButtons = () => {
            confirm.require({
                message: "Do you want to delete all current bindings?",
                header: "Reset all button binding",
                icon: "pi pi-times",
                rejectProps: {
                    label: "Cancel",
                    outlined: true,
                },
                acceptProps: {
                    label: "Yes",
                    outlined: true,
                    severity: 'warn'
                },
                accept: () => {
                    buttonStore.resetAllButtons()
                    currentBindingName.value = 'custom'
                    toast.add({ severity: 'info', summary: 'Reseted', detail: 'All binding reseted', life: 2000 });
                },
                reject: () => {
                    console.log("Reset canceled")
                    // toast.add({ severity: 'info', summary: 'Canceled', detail: 'Reset canceled', life: 1000 });
                }
            })
    }

    const importData = async () => {
        confirm.require({
            message: "Import current data and overwrite the current bindings?",
            header: "Import data from device",
            icon: "pi pi-file-import",
            rejectProps: {
                label: 'Cancel',
                outlined: true
            },
            acceptProps: {
                label: 'Import',
                outlined: true,
                severity: 'success'
            },
            accept: async () => {
                await importFromDevice()
            },
            reject: () => {
                console.log("Import canceled")
            }
        })

    }

    return {
        resetButtons,
        importData
    }
}