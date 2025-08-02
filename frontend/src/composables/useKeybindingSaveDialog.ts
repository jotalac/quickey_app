import { useMulitBindingImport } from "./useMultiBindingImport"
import { useKnobActionCategories } from '@/composables/useKnobActionCategories';

export const useKeybindingSaveEdit = () => {
    const {findActionDefinition} = useMulitBindingImport()


    // const getCurrentPageButtons = (currentPage: number, totalPages: number, current) => {
    //     //handle knob
    //     if (currentPage.value === (totalPages + 1)) {
    //         currentPageButtons.value = props.keybidingData?.keyBinding[27].value
    //         console.log(currentPageButtons.value)
    //     } else {
    //         const firstIndex = ((currentPage.value - 1) * 9) + 1
    //         const lastIndex = ((currentPage.value) * 9)
    //         const pageButtons = props.keybidingData?.keyBinding.filter(button => {
    //             return Number(button.id) >= firstIndex && Number(button.id) <= lastIndex;
    //         })
    //         currentPageButtons.value = pageButtons
    //     }
    // }

    const convertValueForTooltip = (values: string[]): string => {
        if (!values || values.length <= 1) return ''
    
        const filteredValues = values.slice(1) // Remove 'multi' identifier
    
        if (filteredValues.length === 0) return 'Multi-binding (no actions)'
    
        const actionDescriptions = filteredValues.map((value, index) => {
            const parts = value.split("_")
            console.log(parts)
            if (parts.length >= 3) {
                const actionCode = parts[1]
                const actionValue = parts.slice(2).join('_') // In case value contains underscores
                const actionDef = findActionDefinition(actionCode)
                
                //format differently if the node doesnt requiere intpu
                if (parts[2] === '' && actionDef) {
                    return `${index + 1}. ${actionDef.label}`
                }   
                else if (actionDef) {
                    return `${index + 1}. ${actionDef.label}: ${actionValue}`
                }
                return `${index + 1}. ${actionCode}: ${actionValue}`
            }

            return `${index + 1}. ${value}`
        })
    
        return `Multi-binding:\n${actionDescriptions.join('\n')}`
    }

    const { rotateCategories, buttonCategories } = useKnobActionCategories()
    // Simple knob tooltip function
    const getKnobTooltip = (knobValues: string[]): string => {
        if (!knobValues || knobValues.length !== 3) return ''
        
        const [left, right, button] = knobValues
        const actions = []
        
        if (left) actions.push(`↪ Left: ${getActionLabel(left)}`)
        if (right) actions.push(`↩ Right: ${getActionLabel(right)}`)
        if (button) actions.push(`● Press: ${getActionLabel(button)}`)
        
        return actions.length ? actions.join('\n') : ''
    }

    // Find action label from categories
    const getActionLabel = (value: string): string => {
        const allCategories = [...rotateCategories.value, ...buttonCategories.value]
        
        for (const category of allCategories) {
            const action = category.items.find(item => item.value === value)
            if (action) return action.label
        }
        
        return value // Return raw value if not found
    }

    const getTextFromValue = (values: string[]) => {
        if (values.length === 0) return ''
        else if (values[0] === 'multi') {
            return 'multi'
        } else {
            return values.join(" + ")
        }
    }

    const getButtonState = (values: string[]) => {
        if (values.length === 0) return 'notBinded'
        else if (values[0] === 'multi') return 'multiBinding'
        return 'binded' 
    }

    const getKnobState = (values: string[]) => {
        if (values.every(value => value === '')) {
            return ''
        }
        return 'binded'
    }

    return {convertValueForTooltip, getKnobTooltip, getActionLabel, getTextFromValue, getButtonState, getKnobState}
}