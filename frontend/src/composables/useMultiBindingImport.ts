import { useActionCategories } from "@/composables/useActionCategories"
import { useMultiBindingDialogStore } from "@/stores/multiBindingDialogStore"
import type { ActionCategory, ActionDefinition, MultiBindingAction } from "@/types/buttonBindHome"

export const useMulitBindingImport = () => {
    const {categories} = useActionCategories()
    const store = useMultiBindingDialogStore()


    //helper function to function to find action definition by actionCode
    const findActionDefinition = (actionCode: string): ActionDefinition | undefined => {
        for (const category of categories.value) {
            const action = category.actions.find(a => a.actionCode === actionCode)
            if (action) return action
        }
        return undefined
    }

    const importExistingValues = (buttonValues: string[]) => {
        //if nothing was binded, nothing needs to be imported
        if (!buttonValues || buttonValues.length === 0) {
            store.actionsBinded = []
            return
        }

        //check if it was multibinding
        if (buttonValues[0] !== 'multi') {
            importNormalKeyBinding(buttonValues)
        } else {
            importMultiKeyBinding(buttonValues)
        }
    }

    const importNormalKeyBinding = (buttonValues: string[]) => {
        for (let i = 0; i < buttonValues.length; i++) {
            const index = i;
            const actionDef = findActionDefinition('hold')
            const actionValue = buttonValues[i]
            
            if (actionDef) {
                importNewAction(index, actionDef, actionValue, 'hold')
            }
        }
    }

    const importMultiKeyBinding = (buttonValues: string[]) => {
        for (let i = 1; i < buttonValues.length; i++) {
            const parts = buttonValues[i].split("_")

            if (parts.length >= 2) {
                const index = parseInt(parts[0])
                const actionCode = parts[1]
                const actionValue = parts.length > 2 ? parts.slice(2).join("_") : "";
                const actionDef = findActionDefinition(actionCode)

                if (actionDef) importNewAction(index, actionDef, actionValue, actionCode)
            }            
            
        }
    }

    const importNewAction = (index: number, actionDef: ActionDefinition, actionValue: string, actionCode: string) => {
        const importedAction: MultiBindingAction = {
            id: `${actionCode}-${Date.now()}-${index}`,
            actionCode: actionCode,
            label: actionDef.label,
            icon: actionDef.icon,
            value: actionValue,
            requiresInput: actionDef.requiresInput || false
        }

        store.actionsBinded.push(importedAction)
    }

    return {importExistingValues, findActionDefinition}
}