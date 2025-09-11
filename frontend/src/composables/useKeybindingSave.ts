import { useButtonBindStore } from "@/stores/buttonBindStore";
import { useDeviceStore } from "@/stores/deviceStore";
import type { KeybindingDataSave } from "@/types/keybindingSaveTypes";
import { storeToRefs } from "pinia";
import { toRaw, type Ref } from "vue";
import { useButtons } from "./useButtonsBindingHome";
import type { KnobBindHome } from "@/types/buttonBindHome";
import { useRouter } from "vue-router";
import { keybindingSaveApi } from "@/api/keybinding/keybinding_save";
import { useToast } from "primevue";


export const useKeybindingSave = () => {
    const deviceStore = useDeviceStore()
    const {isConnected} = storeToRefs(deviceStore)
    const {sendToDevice} = deviceStore
    const buttonBindStore = useButtonBindStore()
    const {initButtons, currentBindingName} = useButtons()
    const router = useRouter()
    const toast = useToast()

    
    // ==== keybinding actions ====
    const saveKeybindingToDevice = async (keybinding: KeybindingDataSave["keyBinding"] | undefined, saveName: string) => {    
        if (!isConnected.value || !keybinding) return
        
        // convert data for export
        const dataToSend: Record<string, string[]> = {}
        dataToSend["bindingName"] = [saveName]
    
        const originalData = JSON.parse(JSON.stringify(keybinding));
        
        originalData.forEach((btn: any) => {
            dataToSend[String(btn.id)] = toRaw(btn.value)
        })
        
        await sendToDevice(dataToSend)
    }
    
    const useCurrentKeybinding = (keybinding: KeybindingDataSave["keyBinding"], saveName: string) => {
    
        const originalData = JSON.parse(JSON.stringify(keybinding))
    
        //init the buttons if there are not
        if (buttonBindStore.allButtons.length === 0) {initButtons()}
        buttonBindStore.resetAllButtons() //reset current binding

        currentBindingName.value = saveName
    
    
        originalData.forEach((btn: any) => {
            if (btn.id === 'knob') {
                const state = btn.value.every((value: string) => value === '') ? 'notBinded' : 'binded'
                const knobElement: KnobBindHome = {state: state, values: {left: btn.value[0], right: btn.value[1], button: btn.value[2]}}
                buttonBindStore.setKnob(knobElement)
            }
    
            const state = buttonBindStore.getStateFromValue(btn.value)
            buttonBindStore.updateButton(Number(btn.id), {state: state, value: btn.value})
        })
        router.push("/app")
    }

    const convertDateFormat = (dateUnformated: string) => {
        return new Date(dateUnformated).toLocaleDateString()
    }   
    
    
    const likeButtonToggle = async (saveId: string, likeCount: Ref<number>, isLiked: Ref<boolean>) => {
        
        const originalLikedState = isLiked.value
        const originalLikeCount = likeCount.value

        // Optimistically update UI
        isLiked.value = !isLiked.value
        
        if (isLiked.value) {
            likeCount.value = (likeCount.value ?? 0) + 1
        } else {
            likeCount.value = Math.max(0, (likeCount.value ?? 1) - 1) // Prevent negative counts
        }

        try {
            await keybindingSaveApi.toggleLike(isLiked.value, saveId)
            
            // emit('likeChange', {isLiked: isLiked.value, saveId: props.keybidingData._id, likeCount: likeCount.value})
        } catch (error) {
            console.log(error)
            isLiked.value = originalLikedState
            likeCount.value = originalLikeCount
        }
    }

    const validateFormValues = (saveName: string, saveDescription: string): boolean => {
        let valid = true
        const currentNameLength = saveName.trim().length 
        const currentDescLength = saveDescription.trim().length 
        if (currentNameLength < 3 || currentNameLength > 50) {
            toast.add({severity: 'warn', summary: "Name length must be 3-50 characters", life: 1000})
            valid = false
        } 
        if (currentDescLength > 3000) {
            toast.add({severity: 'warn', summary: "Description length must be 0-3000 characters", life: 1000})
            valid = false
        }

        return valid
    }


    return {saveKeybindingToDevice, useCurrentKeybinding, convertDateFormat, likeButtonToggle, validateFormValues}

}