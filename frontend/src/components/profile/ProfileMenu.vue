<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter()
const activeIndex = ref(0)

const items = ref([
    {label: 'Dashboard', icon: 'pi pi-th-large'},
    {label: 'Profile', icon: 'pi pi-user'},
    {label: 'Settings', icon: 'pi pi-cog'},
    {label: 'Security', icon: 'pi pi-lock'},
])


const {logout} = useAuth()
const logoutUser = async () => {
    await logout()
    router.push('/login')
}

//tabs changing
const emit = defineEmits<{
    tabChanged: [index: number]
}>()

const onTabChange = () => {
    console.log(activeIndex.value)
    emit('tabChanged', activeIndex.value)
}

</script>

<template>
    <div class="menu-section">
        <TabMenu :model="items" v-model:activeIndex="activeIndex" @tab-change="onTabChange"></TabMenu>

        <Button
            text
            label="Logout"
            icon="pi pi-times"
            rounded
            size="small"
            class="logout-button"
            @click="logoutUser"
        />

    </div>

</template>

<style scoped>
.menu-section{
    width: 100%;
    /* min-width: 230px; */
    background-color: var(--primary-1000);
    /* padding-top: 10px; */
    display: flex;
    flex-direction: row;
    align-items: center;
}

/* top profile */
.profile-section{
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-top: 30px;
    margin-bottom: 50px;
    width: 100%;
}

#menu-profile-picture{
    width: 50px;
    border-radius: 50%;
}


.logout-button{
    margin-left: auto;
    margin-right: 20px;    
    color: var(--red-vivid);
}

</style>