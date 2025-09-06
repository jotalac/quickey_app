import { ref } from "vue"

const isDialogVisible = ref(false)
const activeKey = ref<number | null>(null)

export function useAiKeybindingDialog() {
    const showDialog = (keyNumber: number) => {
        isDialogVisible.value = true
        activeKey.value = keyNumber
    }

    const hideDialog = () => {
        isDialogVisible.value = false
    }

    return {
        isDialogVisible,
        activeKey,
        showDialog,
        hideDialog
    }
}