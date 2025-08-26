<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { profileSettingsApi } from '@/api/profile/profile_settings_api';
import { useToast } from 'primevue';

const route = useRoute()
const toast = useToast()
const router = useRouter()

const isLoading = ref(true)
const validToken = ref<boolean>()
const token = route.query.token as string;
const userEmail = ref()

onBeforeMount(async () => {
    const response = await profileSettingsApi.verifyResetToken(token);
    if (response.status === "success") {
        console.log(response);
        
        if (response.valid) {
            userEmail.value = response.email
            validToken.value = true
        } else {
            validToken.value = false
        }
    } else {
        validToken.value = false
        toast.add({summary: "Error", detail: "Error verifying token!", life: 2000, severity: "error"})
    }

    isLoading.value = false; // Set loading to false when done
});

const resolver = zodResolver(
    z.object({
        password: z.string()
            .min(1, "Passwird is required")
            .min(7, "Minimum 7 characters")
            .max(256, "Maximum 256 characters")
            .regex(/[A-Z]/, "Must contain uppercase letter")
            .regex(/[a-z]/, "Must contain lowercase letter")
            .regex(/[0-9]/, "Must contain number"),
        passwordConfirm: z.string()
            .min(1, "Please confirm your password")
    }).refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords don't match",
        path: ["passwordConfirm"]
    })
)

const onFormSubmit = async ({valid, values, reset}: {valid: boolean, values: any, reset: () => void}) => {
    if (!valid) return

    const response = await profileSettingsApi.changePassword(token, values.password)

    if (response.status === 'success') {
        router.push("/app")
        toast.add({summary: "Password changed", detail: "Password change successfully", life: 2000, severity: "success"})
    } else {
        toast.add({summary: "Error changing password", detail: response.msg, life: 2000, severity: "error"})

    }
    
}
</script>

<template>
    <div class="change-email box-shadow-normal">
        <!-- Loading State -->
        <div v-if="isLoading" class="cont-header loading">
            <h2>Verifying token...</h2>
            <Icon icon="material-symbols:hourglass-empty" class="icon-header loading-icon"/>
        </div>
        <div v-else-if="validToken" class="cont-header">
            <h2>Change password - <strong>{{ userEmail }}</strong></h2>
            <!-- <Icon icon="material-symbols:password" class="icon-header"/> -->
        </div>
        <div v-else class="cont-header invalid">
            <h2>Invalid token</h2>
            <Icon icon="material-symbols:error" class="icon-header"/>
        </div>


        <div class="separator"></div>

        <div class="cont-content">
            <Form v-slot="$form" :resolver="resolver" class="form-element" @submit="onFormSubmit" :validate-on-value-update="true">
                <FormField class="input-container" initial-value="">
                    <Password
                        name="password"
                        placeholder="Passowrd"
                        :class="{'input-incorrect': $form.password?.invalid}"
                        toggleMask
                        :disabled="isLoading || !validToken"
                    />
                    <Icon 
                        v-if="$form.password?.invalid" 
                        icon="material-symbols:error-outline" 
                        class="error-indicator"
                        v-tooltip.right="{
                            value: $form.password.errors?.map(e => '- ' + e.message).join('\n'),
                            escape: false,
                            showDelay: 100,
                            pt: {
                                text: {class: 'error-tooltip-text'}
                            }
                        }"
                    />

                </FormField>

                <Password 
                    name="passwordConfirm"
                    placeholder="Passowrd"
                    class="form-input"
                    :class="{'input-incorrect': $form.passwordConfirm?.invalid}"
                    toggleMask
                    :feedback="false"
                    :disabled="isLoading || !validToken"
                />
    
                <Button 
                    label="Change passowrd" 
                    outlined 
                    type="submit" 
                    icon="pi pi-key" 
                    class="submit-button"
                    :disabled="isLoading || !validToken"    
                />

            </Form>

        </div>
    </div>

</template>

<style scoped>
.change-email{
    background-color: var(--blue-dark);
    border-radius: var(--border-rad-main);
    width: 600px;
    height: 300px;
    padding: 30px 20px;
}

.cont-header{
    display: flex;
    justify-content: center;
    align-items: center;
}

.cont-header.invalid {
    color: var(--red-vivid);
}

.cont-header h2{
    font-size: var(--bigger-text);
    font-weight: normal;
}

.icon-header{
    width: 30px;
    height: 30px;
    margin-left: 10px;
}

.loading-icon{
    animation: spin 2s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.separator{
    align-self: center;
    width: 100%;
    height: 2px;
    background-color: var(--gray-main);
    margin: 20px 0
}

.cont-content{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.input-incorrect{
    outline: 1px solid var(--red-vivid);
    border-radius: var(--border-rad-main);
}

.form-element{
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.input-container{
    position: relative;
}

.error-indicator{
    width: 30px;
    height: 30px;
    color: var(--red-vivid);
    position: absolute;
    right: -50px;
    top: 10%;
}


.submit-button{
    width: 200px;
    margin-top: 10px;
    align-self: center;
}

</style>