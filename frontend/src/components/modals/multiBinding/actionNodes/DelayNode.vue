<script setup lang="ts">
import type { ActionNodeProps, ActionNodeEmits } from '@/types/buttonBindHome';
import { Icon } from '@iconify/vue';
import {ref, watch, onMounted} from 'vue'

const delayTime = ref(200) 

const props = defineProps<ActionNodeProps>()
const emit = defineEmits<ActionNodeEmits>()

const handleRemoveAction = () => {
    emit('remove', props.actionElement.id)
}

const updateValue = () => {
    
    props.actionElement.value = delayTime.value.toString()
    console.log(props.actionElement.value);
}

watch(delayTime, updateValue)

onMounted(() => {
    if(props.actionElement.value !== '') {
        delayTime.value = parseInt(props.actionElement.value)
    }
    // Always call updateValue to ensure the default value is set
    updateValue()
})


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

            <div class="node-content-controls">
                <InputNumber v-model="delayTime" class="node-delay-input" type="number" placeholder="Enter time to sleep" :min="10" :max="50000" :use-grouping="false"/>
                <p>ms</p>
            </div>

        </div>
        
        <!-- Remove button -->
        <Button class="delete-btn" @click="handleRemoveAction" icon="pi pi-times" outlined size="small"/>
    </div>
</template>

<style scoped>
.node-content-controls{
    display: flex;
}



:deep(input){
    width: 100px;
    height: 30px;
    margin-bottom: 5px;
    margin-right: 10px;
    text-align: end;
}

</style>