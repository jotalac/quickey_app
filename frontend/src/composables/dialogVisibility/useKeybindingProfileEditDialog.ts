import { ref } from "vue"

const isDialogVisible = ref(false)

export function useEditSaveDialog() {
    const showDialog = () => {
        isDialogVisible.value = true
    }

    const hideDialog = () => {
        isDialogVisible.value = false
    }

    return {
        isDialogVisible,
        showDialog,
        hideDialog
    }
}