<script setup lang="ts">
import {computed} from 'vue'

interface Props {
    text: string,
    isDisabled: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
    suggestionClicked: [suggestionText: string]
}>()

const textDispaly = computed(() => { return props.text.length > 20 ? props.text.slice(0, 20) + "..." : props.text})

const suggestionClick = () => {
    emit('suggestionClicked', props.text)
}

</script>

<template>
     <!-- <div class="suggestion">
        <i class="pi pi-question"/>
        <span>{{ textDispaly }}</span>
    </div> -->

    <Button
        :label="textDispaly"
        class="suggestion"
        icon="pi pi-question"
        @click="suggestionClick"
        :disabled="props.isDisabled"
    />


</template>

<style scoped>
.suggestion{
    width: 100%;
    background-color: var(--blue-dark);
    padding: 5px;
    border-radius: var(--border-rad-main);
    border: var(--gray-main) 1px solid;
    color: var(--gray-bright);
    cursor: pointer;
    margin: 7px 0px;
    padding: 5px;
}

:deep(.p-button-icon) {
    margin-right: 5px;
}

.suggestion span{
    color: var(--gray-bright);
}
</style>