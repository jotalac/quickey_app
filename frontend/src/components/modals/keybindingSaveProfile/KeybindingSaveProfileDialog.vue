<script setup lang="ts">
import { useEditSaveDialog } from '@/composables/useKeybindingProfileEditDialog';
import { computed, ref, watch } from 'vue';
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import KeybindingPreview from '@/components/KeybindingPreview.vue';

interface Props {
    keybidingData: KeybindingDataSave | null
}

const{isDialogVisible, hideDialog} = useEditSaveDialog()
const props = defineProps<Props>()

// name and description edit
const saveName = ref<string>()
const saveDescription = ref<string>()

// ===== menu items ===========
//items in the menu
const leftMenuItems = computed(() => [
    {
        label: 'Actions',
        items: [
            {
                label: 'Use binding',
                icon: 'pi pi-times',
                command: () => {console.log("sdfsdf")}
            },
            {
                label: 'Send to device',
                icon: 'pi pi-file-import',
                command: () => {console.log("sdfsdf")}

            }
        ]
    }
])

watch(() => props.keybidingData, () => {
    saveName.value = props.keybidingData?.name
    saveDescription.value = props.keybidingData?
})

</script>

<template>
    <Dialog
        v-model:visible="isDialogVisible"
        modal
        maximizable
        :header="`Edit - ${props.keybidingData?.name}`"
        :style="{width: '90%', height: '90%'}"
        @hide="hideDialog"
    >   
        <div class="dialog-content">
            <div class="left-edit-section">
                <div class="username-description-edit">
                    <InputText
                        v-model="saveName"
                    />

                    <Textarea />
                </div>

                <Menu
                    :model="leftMenuItems"
                />
            </div>


            <div class="keybindig-section">
                <KeybindingPreview :keybiding-data="props.keybidingData" />
            </div>

        </div>

    </Dialog>


</template>

<style scoped>

.dialog-content{
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 100%;
}

.keybinding-section{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}


</style>