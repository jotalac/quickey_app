<script setup lang="ts">
import UsageGuide from '@/components/guide/UsageGuide.vue';
import { ref } from 'vue';

const tabMenuItems = ref([
    {label: 'Usage', icon: 'pi pi-web'},
    {label: 'Assembly', icon: 'pi pi-web'},
    {label: 'Firmware update', icon: 'pi pi-web'}
])

const activeTabIndex = ref(0)



</script>

<template>
    <div class="guide-wrapper">
        <TabMenu :model="tabMenuItems" v-model:activeIndex="activeTabIndex" class="menu-choice"/>
        <div class="guide-content">
            <UsageGuide v-if="activeTabIndex === 0"/>

        </div>

    </div>
</template>

<style scoped>
.guide-wrapper{
    width: 100%;
    /* margin-top: 65px; */
    padding: 80px 0 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 90%;
    overflow-y: scroll;
}

.menu-choice{
    /* position: static; */
    max-width: 500px;
    position: fixed;
    top: 80px;
    border-radius: var(--border-rad-main);
    z-index: 10;
}

.guide-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 1500px;
    padding-top: 30px;
}

</style>