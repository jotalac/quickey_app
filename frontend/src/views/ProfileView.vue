<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import ProfileMenu from '@/components/profile/ProfileMenu.vue'
import ProfileDashboard from '@/components/profile/ProfileDashboard.vue';
import ProfileDisplay from '@/components/profile/ProfileDisplay.vue';
import { AuthService } from '@/api/auth/auth_service';

const router = useRouter()
const activeTab = ref(0)


const handleTabChange = (index: number) => {
    activeTab.value = index
}

onBeforeMount(()=> {
    if (!AuthService.getUser()) router.push("/login")
})

</script>

<template>
    <div class="profile-layout">
        <ProfileMenu class="left-menu" @tab-changed="handleTabChange"/>
        <div class="content-area">
            <ProfileDashboard v-if="activeTab === 0" />
            <ProfileDisplay v-else-if="activeTab === 1"/>

            <div v-else class="placeholded">
                <h1>Not availible yet</h1>
                <i class="pi pi-clock"/>

            </div>
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
    /* width: 100%; */
    height: 100%;
    min-height: 0;
    min-width: 0;
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