import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MultiBindingAction } from '@/types/buttonBindHome'

export const useMultiBindingDialogStore = defineStore('dialog', () => {
    const MAX_NODES = 20

    // State
    const isVisible = ref(false)
    const activeButtonId = ref<number | null>(null)
    const actionsBinded = ref<MultiBindingAction[]>([])
    const isAtLimit = computed(() => actionsBinded.value.length >= MAX_NODES)

    //states for listening for buttons
    const capturingKeyPress = ref(false)
    // const capturingCurrentKey = ref<string>()
    const capturingActionId = ref<string | null>(null)

    // Getters
    const dialogTitle = computed(() => 
        activeButtonId.value ? `Multi-key binding - Key ${activeButtonId.value}` : 'Multi-key binding'
    )
    
    const hasActions = computed(() => actionsBinded.value.length > 0)

    const isCapturingAction = computed(() => (actionId: string) =>{
        return capturingKeyPress && capturingActionId.value === actionId
    })

    const isActionBinded = (actionId: string) => {
        const actionIndex = actionsBinded.value.findIndex(action => action.id === actionId)
        return actionsBinded.value[actionIndex].value != ''
    }

    // Actions
    const openDialog = (buttonId: number) => {
        console.log("Opening dialog for button:", buttonId)
        activeButtonId.value = buttonId
        isVisible.value = true

        //when there is already something binded show import it to the dialog
        // if (currentButtonValues.length === 0) {
        //     actionsBinded.value = [] // reset actions on open
        // } else {
        //     // initActionsMulit()
        // }
    }

    const closeDialog = () => {
        console.log("Closing dialog")
        isVisible.value = false
        activeButtonId.value = null
        actionsBinded.value = []
    }

    const addAction = (action: MultiBindingAction) => {        
        actionsBinded.value.push(action)
    }

    const removeAction = (actionId: string) => {
        const index = actionsBinded.value.findIndex(action => action.id === actionId)
        
        if (index !== -1) {
            actionsBinded.value.splice(index, 1)
        }
    }

    //actions for key capturing
    const updateAction = (index: number, updates: Partial<MultiBindingAction>) => {
        if (actionsBinded.value[index]) { //check if the action exists
            Object.assign(actionsBinded.value[index], updates)
        }
    }

    const startCapturing = (actionId: string) => {
        capturingKeyPress.value = true
        capturingActionId.value = actionId

        console.log("Started capturing on id: " + actionId);
    }

    const stopCapturing = () => {
        capturingKeyPress.value = false
        capturingActionId.value = null
    } 

    const handleKeyCapture = (keyCode: string) => {

        if (capturingActionId.value){
            const actionIndex = actionsBinded.value.findIndex(action => action.id === capturingActionId.value)
            if (actionIndex !== -1) {
                updateAction(actionIndex, {value: keyCode})
            }
        }
        stopCapturing()
    }

    return {
        // State
        isVisible,
        activeButtonId,
        actionsBinded,
        // Getters
        dialogTitle,
        isActionBinded,
        hasActions,
        // Actions
        openDialog,
        closeDialog,
        addAction,
        removeAction,
        isAtLimit,


        //capturing
        capturingKeyPress,
        // capturingCurrentKey,
        capturingActionId,
        isCapturingAction,
        updateAction,
        startCapturing,
        stopCapturing,
        handleKeyCapture
    }
})