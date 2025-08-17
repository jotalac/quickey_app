<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import type { MultiBindingAction } from '@/types/buttonBindHome';
import { Icon } from '@iconify/vue';
import { useMultiBindingDialogStore } from '@/stores/multiBindingDialogStore';
import { storeToRefs } from 'pinia';


//import all possible action node components
import DefaultActionNode from '@/components/modals/multiBinding/actionNodes/DefaultActionNode.vue';
import WriteActionNode from '@/components/modals/multiBinding/actionNodes/WriteActionNode.vue';
import KeyPressNode from '@/components/modals/multiBinding/actionNodes/KeyPressNode.vue';
import MouseMoveNode from '@/components/modals/multiBinding/actionNodes/MouseMoveNode.vue';
import MouseClickNode from '@/components/modals/multiBinding/actionNodes/MouseClickNode.vue';
import DelayNode from '@/components/modals/multiBinding/actionNodes/DelayNode.vue';

//map special action actionCode to special components (dont need to specify those that dont reqire any input)
const mapActionComponents: Record<string, any> = {
    'write': WriteActionNode,
    'pressRelease':  KeyPressNode,
    'hold': KeyPressNode,
    'release': KeyPressNode,
    'mouseMove': MouseMoveNode,
    'mouseClick': MouseClickNode,
    'delay': DelayNode
}  
const getActionComponent = (actionCode: string) => {
    return mapActionComponents[actionCode] || DefaultActionNode
}

const multiBindingDialogStore = useMultiBindingDialogStore()
const { actionsBinded, isAtLimit } = storeToRefs(multiBindingDialogStore)

const handleActionsChange = (newActions: MultiBindingAction[]) => {
    console.log(newActions);    
}

const handleRemoveAction = (actionId: string) => {
    // emit('removeAction', index)
    multiBindingDialogStore.removeAction(actionId)
}

const dragGroup = {
    name: 'actions',
    pull: false,
    put: () => !isAtLimit.value
}


</script>

<template>
    <div class="actions-display-cont">

         <!-- if there are no stats binded currentl -->
        <div v-if="actionsBinded.length === 0" class="action-drop-zone-empty-text">
            <Icon icon="material-symbols:no-sim-outline-rounded" width="40" height="40" />
            <p>Start draging actions to build an action sequence</p>
        </div>

        <VueDraggable
            :key="actionsBinded.length"
            v-model="actionsBinded"
            :group="dragGroup"
            class="action-sequence"
            :scroll="true"
            

            @update:model-value="handleActionsChange"
            item-key="id"
            
            :animation="300"
            :delay="0"
            :delay-on-touch-start="50"
            ghost-class="ghost-action"
            chosen-class="chosen-action"
            drag-class="drag-action"
            move-class="draggable-move"
            handle=".drag-handle"
        >
  
            <component 
                v-for="(element, index) in actionsBinded"
                :is="getActionComponent(element.actionCode)"
                :action-element="element"
                :index="index"
                :key="element.id"
                @remove="handleRemoveAction"
            />

        </VueDraggable>
    </div>
</template>

<style scoped>
.actions-display-cont {
    display: flex;
    flex-direction: column;
    align-items: start;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    flex-grow: 1;
    margin: 0;
    margin-right: 15px;
    height: 90%;
    background-color: var(--blue-dark);
    border-radius: var(--border-rad-smaller);
    padding: 10px 10px;
    
}

.drop-zone-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--gray-main);
    text-align: center;
    border: 2px dashed var(--primary-600);
    border-radius: var(--border-rad-main);
    opacity: 0.7;
    padding: 40px;
}

.drop-zone-icon {
    font-size: 3rem;
    margin-bottom: 10px;
}

.action-sequence {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 100px;
    width: 100%;
    height: 100%;
}

.action-drop-zone-empty-text{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: var(--gray-main);
    font-size: var(--bigger-text);
}


</style>