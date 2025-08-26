<script setup lang="ts">
import { useProfileDeleteDialog } from '@/composables/useProfileDeleteDialog';
import {computed, ref} from 'vue'

const {isDialogVisible, hideDialog} = useProfileDeleteDialog()

const keyword = "delete account"
const typedWord = ref("")

const wordCorrect = computed(() => typedWord.value.trim() === keyword)

const emits = defineEmits<{deleteAccount: []}>()
</script>

<template>
    <Dialog
        v-model:visible="isDialogVisible"
        modal
        header="Delete Account"
        :style="{width: '600px'}"
        @hide="hideDialog"
    >
        <div class="delete-content">
            <!-- <p>Are you sure you want to delete your account?</p> -->
            <p>Type <span class="highlight-word">"{{ keyword }}"</span>to confirm account delete. <i class="pi pi-user-minus"/></p>

            <InputText v-model="typedWord" placeholder="Are you sure you want to delete your account?" class="input-text"/>
            
            <div class="button-group">
                <Button 
                    label="Cancel" 
                    outlined 
                    @click="hideDialog"
                />
                <Button 
                    label="Delete Account" 
                    severity="warn"
                    outlined
                    :disabled="!wordCorrect"
                    @click="emits('deleteAccount')"
                />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.delete-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
    padding: 10px 0;

}

.button-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 10px;
}

.delete-content p {
    line-height: 1.6;
    color: var(--gray-bright);
}

.input-text{
    width: 500px;
}

.highlight-word{
    color: var(--red-vivid);
    font-weight: bold;
}
</style>