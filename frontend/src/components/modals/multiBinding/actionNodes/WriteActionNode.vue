<script setup lang="ts">
import type { ActionNodeProps, ActionNodeEmits } from '@/types/buttonBindHome';
import { Icon } from '@iconify/vue';

const props = defineProps<ActionNodeProps>()
const emit = defineEmits<ActionNodeEmits>()

const handleRemoveAction = () => {
    emit('remove', props.actionElement.id)
}

</script>

<template>
     <!-- main template for displaying the actions -->
    <div
        class="action-node"
        :key="props.actionElement.id"
        @click="() => console.log(props.actionElement.value)"
    >
        <!-- Drag handle -->
        <div class="drag-handle">
            <i class="pi pi-bars"></i>
        </div>
        <!-- index show -->
        <p class="node-index">{{ props.index + 1}}:</p>
        
        <!-- Action icon -->
        <Icon :icon="props.actionElement.icon" class="action-icon"/>
        
        <!-- Action content -->
        <div class="node-content">
            <p class="node-key">{{ props.actionElement.label }}</p>
            <InputText v-model="actionElement.value" class="node-content-input" type="text" placeholder="Write some text" maxlength="500"/>
        </div>
        
        <!-- Remove button -->
        <Button class="delete-btn" @click="handleRemoveAction" icon="pi pi-times" outlined size="small"/>
    </div>
</template>

<style scoped>
.node-content-input{
    width: 70%;
    height: 30px;
    margin-bottom: 5px;
}

</style>