<script setup lang="ts">
import { passwrodChnageApi } from '@/api/profile/password_change_api';
import { useAuth } from '@/composables/useAuth';
import { useConfirm, useToast } from 'primevue';
import { useRouter } from 'vue-router';

const router = useRouter()
const {logout} = useAuth()

const confirm = useConfirm()
const toast = useToast()

const confirmChangePassword = () => {
    confirm.require({
        header: "Password change",
        message: "Do want to change your password? Password change link will be send to your email.",
        icon: "pi pi-user-edit",
        rejectProps: {
            label: "Cancel",
            outlined: true
        },
        acceptProps: {
            label: "Yes",
            outlined: true,
            severity: "warn"
        },
        accept: async () => {
            const response = await passwrodChnageApi.requestPasswordChange()

            if (response.status === "success") {
                toast.add({summary: "Link send to email", detail: "Password change link is in your email adress", severity: "success", life: 2000})
            } else {
                toast.add({summary: "Error", detail: response.msg, severity: "error", life: 2000})
            }

            
        },

    })
}

// const logoutUser = async () => {
//     await logout()
//     router.push('/login')
// }

</script>

<template>
    <div class="profile-settings-cont">
        <h1>Profile settings <i class="pi pi-cog"/></h1>
        <ConfirmDialog :style="{'width': '500px'}"/>

        <div class="menu-cont">
            <div class="menu-row">
                <p>Change password <i class="pi pi-lock"/></p>
                <Button label="Change" outlined size="small" severity="warn" @click="confirmChangePassword"/>
            </div>

            <div class="menu-row">
                <p>Delete account <i class="pi pi-user-minus"/></p>
                <Button label="Delete" outlined size="small" severity="warn"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-settings-cont{
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    padding: 20px;
    gap: 20px;
}

.menu-cont{
    display: flex;
    flex-direction: column;
    background-color: var(--primary-1000);
    width: 500px;
    border-radius: var(--border-rad-main);
    border: 1px solid var(--gray-dark);
    padding: 20px 15px;
    gap: 20px;
}

.menu-row{
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
}

.menu-row p {
    font-weight: bold;
}

h1 i{
    font-size: 0.8em;
}

:deep(.p-confirmdialog){
    max-width: 500px !important;
    width: 500px;
}


</style>