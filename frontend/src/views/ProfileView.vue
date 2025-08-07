<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { AuthService } from '@/api/auth/auth_service';
import ProfileMenu from '@/components/profile/ProfileMenu.vue'
import ProfileDashboard from '@/components/profile/ProfileDashboard.vue';

const router = useRouter()
const {logout} = useAuth()
const user = AuthService.getUser()
const activeTab = ref(0)

const logoutUser = () => {
    logout()
    router.push('/login')
}

const handleTabChange = (index: number) => {
    activeTab.value = index
}

// onMounted(() => {
//     user?.username = JSON.parse(localStorage.getItem("user") as string).username 
// })

</script>

<template>
    <div class="profile-layout">
        <ProfileMenu class="left-menu" @tab-changed="handleTabChange"/>
        <div class="content-area">
            <ProfileDashboard v-if="activeTab === 0" />
            
            <div v-else class="placeholded">
                <h1>Not availible yet</h1>
                <i class="pi pi-clock"/>

            </div>
            <!-- <h1 v-else-if="activeTab === 1">Soon</h1>
            <h1 v-else-if="activeTab === 2">Soon</h1>
            <h1 v-else-if="activeTab === 3">Soon</h1> -->
        </div>
    </div>

</template>

<style scoped>
.profile-layout{
    display: flex;
    flex-direction: column;
    position: relative;
    width: 95vw;
    height: 85%;
    background-color: var(--blue-dark);
    border-radius: var(--border-rad-main);
    border: 1px var(--primary-800) solid;
    overflow: hidden;
}

.content-area{
    width: 100%;
    height: 100%;
}

.placeholded{
    display: flex;
    align-items: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 1em;
}

.placeholded i {
    font-size: 2em;
    margin-left: 20px;
}






</style>