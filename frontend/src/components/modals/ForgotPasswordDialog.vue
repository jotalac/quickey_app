<script setup lang="ts">
import { authFormApi } from '@/api/auth/auth_form_api';
import { useForgotPasswordDialog } from '@/composables/dialogVisibility/useForgotPasswordDialog';
import { useToast } from 'primevue';
import {ref} from 'vue'

const {isDialogVisible, hideDialog} = useForgotPasswordDialog()
const toast = useToast()

const email = ref("")

const emailValid = ref(false)
const sendingEmailLoading = ref(false)

const checkEmailBlur = async () => {
    const emailAvailible = await authFormApi.checkEmailAvailible(email.value)

    emailValid.value = !emailAvailible

}

const sendPasswordReset = async () => {
    sendingEmailLoading.value = true
    const response = await authFormApi.forgotPassword(email.value)

    if (response.status === "success") {
        toast.add({summary: "Link send to email", detail: "Password change link is in your email adress", severity: "success", life: 4000})
        hideDialog()
        email.value = ''
    } else {
        toast.add({summary: "Error", detail: response.msg, severity: "error", life: 2000})
    }

    sendingEmailLoading.value = false
}

</script>

<template>
    <Dialog
        v-model:visible="isDialogVisible"
        modal
        header="Forgotten password"
        :style="{width: '600px'}"
        @hide="hideDialog"
    >
        <div class="dialog-content">
            <!-- <p>Are you sure you want to delete your account?</p> -->
            <p>Please enter the <span class="highlight-text">email address</span> associated with your account. We will email you a <span class="highlight-text">password reset link</span>.</p>

            <InputText v-model="email" type="email" placeholder="example@email.com" class="input-text" @blur="checkEmailBlur" :class="{'invalid-input': !emailValid}" v-tooltip="!emailValid? 'Email is not registered' : ''"/>
            
            <div class="button-group">
                <Button 
                    label="Confirm" 
                    severity="success"
                    outlined
                    :disabled="!emailValid || sendingEmailLoading"
                    @click="sendPasswordReset"
                    :loading="sendingEmailLoading"
                />
                <Button 
                    label="Cancel" 
                    outlined 
                    @click="hideDialog"
                />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.dialog-content {
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

.dialog-content p {
    line-height: 1.6;
    color: var(--gray-bright);
}

.input-text{
    width: 400px;
}

.highlight-text{
    color: var(--green-bright);
    font-weight: bold;
}

.invalid-input{
    border: 1px solid var(--red-vivid);
}
</style>