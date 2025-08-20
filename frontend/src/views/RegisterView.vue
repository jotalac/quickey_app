<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { onBeforeMount, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { z } from 'zod';
import { authFormApi } from '@/api/auth/auth_form';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue';
import { AuthService } from '@/api/auth/auth_service';
import { useAuth } from '@/composables/useAuth';
import { GoogleLogin } from 'vue3-google-login';
import { authApi } from '@/api/auth/auth_token';
import { useGoogleLogin } from '@/composables/useGoogleLogin';

const router = useRouter()
const toast = useToast()

const isSubmitting = ref(false)

const serverError = ref({
    username: '',
    email: ''
})

//variables
const resolver = zodResolver(
    z.object({
        username: z.string().trim()
            .min(3, "Minimum 3 characters")
            .max(20, "Maximum 20 characters"),
        email: z.string()
            .email({message: "Email is not valid"}),
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


const checkUsernameBlur = async (username: string): Promise<Boolean> => {
    serverError.value.username = '';
    const usernameAvailible = await authFormApi.checkUsernameAvailible(username.trim())

    if (!usernameAvailible) {
        serverError.value.username = 'Username is already taken'
        return false
    }

    return true
}

const checkEmailBlur = async (email: string): Promise<Boolean> => {
    serverError.value.email = '';
    const emailAvailible = await authFormApi.checkEmailAvailible(email.trim())

    if (!emailAvailible) {
        serverError.value.email = 'Email is already registered'
        return false
    }

    return true
}


const onFormSubmit = async ({valid, values, reset}: {valid: boolean, values: any, reset: () => void}) => {
    if (!valid) return
    //check if usrename and email is not used

    isSubmitting.value = true
    
    if (serverError.value.email || serverError.value.username) {  
        isSubmitting.value = false      
        return
    }

    //send the data to server    
    const registered = await authFormApi.sendRegisterForm(values.username, values.email, values.password, values.passwordConfirm)

    
    if (registered.status === 'success') {
        //navigate to new site
        toast.add({ 
            severity: 'success', 
            summary: 'Registration successfull', 
            detail: 'Check your email to finish registration.', 
            life: 6000 
        });
        //reset input fileds
        router.push("/login")

        serverError.value = {
            username: '',
            email: ''
        };


        // router.push('/registration-ve')
    } else {
        toast.add({ 
            severity: 'error', 
            summary: 'Registration Failed', 
            detail: registered.msg, 
            life: 3000 
        });
    }
    isSubmitting.value = false      
}


// loggins 
const {handleGoogleSuccess, handleGoogleError} = useGoogleLogin()

onBeforeMount(() => {
    if (AuthService.getUser()) router.push("/profile")
})

</script>

<template>
    <div class="form-cont box-shadow-normal">
        <Form v-slot="$form" :resolver="resolver" @submit="onFormSubmit" class="form-element" :validate-on-blur="true" :validate-on-value-update="true">
            <div class="form-header">
                <Icon icon="mdi:user-add" class="icon-header" />
                <span class="header-text">Register</span>
            </div>
            
            <div class="form-inputs">

                <FormField class="input-container" initial-value="">

                    <FloatLabel variant="out">
                        <InputText 
                            id="username" 
                            name="username" 
                            :class="['form-input', { 'input-incorect': serverError.username}]"
                            @blur="(event: Event) => checkUsernameBlur((event.target as HTMLInputElement).value)" 
                            @input="serverError.username=''"/>
                        <label for="username" class="input-label">Username</label>
                    </FloatLabel>
                    <Icon  
                        v-if="$form.username?.invalid || serverError.username" 
                        icon="material-symbols:error-outline" 
                        class="error-indicator"
                        v-tooltip.right="{
                            value: serverError.username || $form.username.errors?.map(e => '- ' + e.message).join('\n'),
                            escape: false,
                            showDelay: 100,
                            pt: {
                                text: {class: 'error-tooltip-text'}
                            }
                        }"
                    />
                    
                </FormField>


                <FormField class="input-container" initial-value="">
                
                    <FloatLabel variant="out">
                        <InputText 
                            type="email" 
                            id="email" 
                            name="email" 
                            :class="['form-input', { 'input-incorect': serverError.email}]"
                            @blur="(event: Event) => checkEmailBlur((event.target as HTMLInputElement).value)" 
                            @input="serverError.email = ''"
                        />
                        <label for="email" class="input-label">Email</label>

                    </FloatLabel>
                    <Icon  
                        v-if="$form.email?.invalid || serverError.email"
                        icon="material-symbols:error-outline" 
                        class="error-indicator"
                        v-tooltip.right="{
                            value: serverError.email || $form.email.errors?.map(e => '- ' + e.message).join('\n'),
                            escape: false,
                            showDelay: 100,
                            pt: {
                                text: {class: 'error-tooltip-text'}
                            }
                        }"
                    />
                </FormField>

                <FormField class="input-container" initial-value="">
                    <FloatLabel variant="out">
                        <Password 
                            id="password"
                            name="password"                
                            class="form-input"
                            :class="{ 'input-incorect': $form.password?.invalid }"
                            toggleMask
                            
                        />
                    
                        <label for="password" class="input-label">Password</label>    
                    </FloatLabel>
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

                <FormField class="input-container" initial-value="">
                    <FloatLabel variant="out">
                        <Password id="password-confirm" name="passwordConfirm" :class="['form-input', { 'input-incorect': $form.passwordConfirm?.invalid }]"  toggleMask :feedback="false"/>
                        <label for="password-confirm" class="input-label">Password confirm</label>
                    </FloatLabel>
                    <Icon 
                        v-if="$form.passwordConfirm?.invalid" 
                        icon="material-symbols:error-outline" 
                        class="error-indicator"
                        v-tooltip.right="{
                            value: $form.passwordConfirm.errors?.map(e => '- ' + e.message).join('\n'),
                            escape: false,
                            showDelay: 100,
                            pt: {
                                root: {class: 'error-tooltip-body'},
                                text: {class: 'error-tooltip-text'}
                            }
                        }"
                    />
                </FormField>
            </div>

            <div class="register-login-cont">
                <span>Already registered? <RouterLink to="login">Log in</RouterLink></span>
                <Button
                    label="Register"
                    icon="pi pi-sign-in"
                    outlined
                    rounded
                    class="log-in-button"
                    type="submit"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                />
            </div>
            
            <div class="sso-buttons">
                <GoogleLogin 
                    :callback="handleGoogleSuccess"
                    :error="handleGoogleError"
                    :buttonConfig="{type: 'normal',theme: 'normal', size: 'medium', text: 'signup_with', shape: 'pill'}"

                />
                    <!-- <button type="button" class="sso-button"><Icon icon="ri:google-fill" class="sso-icon"/></button> -->
                <!-- </GoogleLogin> -->
                <!-- <a @click="handleGoogleLogin"><Icon icon="ri:google-fill" class="sso-icon" /></a> -->
                <!-- <a href="/api/auth/sso/github"><Icon icon="mdi:github" class="sso-icon"/></a> -->
            </div>
        </Form>


    </div>
</template>

<style scoped>
.form-cont{
    width: 600px;
    height: 550px;
    border-radius: var(--border-rad-bigger);
    background-color: var(--blue-dark);
}

.form-element{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 50px;
}

/* ====== header ======== */
.form-header{
    display: flex;
    align-items: center;
    justify-content: left;
    width: 100%;
}

.icon-header{
    width: 70px;
    height: 70px;
    margin-right: 10px;
    color: var(--gray-bright);
}

.header-text{
    font-size: 3em;
    font-weight: bold;
}

/* ======= inputs ========== */
.form-inputs{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* align-items: start; */
    margin-top: 50px;
    width: 100%;
    height: 250px;
}

.input-container{
    position: relative;
}

.error-indicator{
    width: 30px;
    height: 30px;
    color: var(--red-vivid);
    position: absolute;
    right: 0;
    top: 10%;
}

/* .form-input{
    width: 90%;
} */

:deep(.p-inputtext),
.p-password {
    width: 92% !important;
}

:deep(.p-password-input){
    width: 100% !important;
}

:deep(input){
    /* width: 90% !important; */
    background-color: var(--primary-800);
}

.input-incorect{
    outline: 1px solid var(--red-vivid);
    border-radius: var(--border-rad-main);
}


.input-label{
    color: var(--gray-bright);
}


/* ==== buttons ======= */
.register-login-cont{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 30px;
}

.log-in-button{
    /* color: var(--blue-vivid); */
    color: var(--green-bright);
}


/* === sso buttons === */
.sso-buttons{
    margin-top: 10px;
    width: 100%;
}

.sso-icon{
    width: 40px;
    height: 40px;
    margin-right: 20px;
    color: var(--gray-main);
    transition: 0.2s all ease-in-out;
    cursor: pointer;
}

.sso-icon:hover{
    color: var(--primary-0);
}

.sso-button{
    background-color: transparent;
    border: none;
}
</style>