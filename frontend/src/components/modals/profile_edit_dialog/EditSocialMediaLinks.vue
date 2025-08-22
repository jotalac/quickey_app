<script setup lang="ts">
import { profileEditApi } from '@/api/profile/profile_edit_api';
import type { SocialLinks } from '@/components/profile/ProfileDisplay.vue';
import { useToast } from 'primevue'
import {ref, computed, watch} from 'vue'

const toast = useToast()

const props = defineProps<{socialMediaLink: SocialLinks[]}>()
const emit = defineEmits<{updated: [newLinks: SocialLinks[]]}>()

const instagramLink = ref('')
const facebookLink = ref('')
const redditLink = ref('')
const xLink = ref('')
const socialLinksValid = ref({
    instagram: true,
    facebook: true, 
    x: true, 
    reddit: true}
)
const allSocialLinksValid = computed(() =>
  Object.values(socialLinksValid.value).every(v => v)
)

const socialLinksEdited = computed(() => {
    return instagramLink.value?.trim() !== props.socialMediaLink.find((item) => item.platform === 'instagram')?.url ||
    facebookLink.value?.trim() !== props.socialMediaLink.find((item) => item.platform === 'facebook')?.url ||
    redditLink.value?.trim() !== props.socialMediaLink.find((item) => item.platform === 'reddit')?.url ||
    xLink.value?.trim() !== props.socialMediaLink.find((item) => item.platform === 'x')?.url
})

const setSocialMediaLinks = (socialLinks: SocialLinks[]) => {
    instagramLink.value = socialLinks.find((item) => item.platform === 'instagram')?.url || ''
    facebookLink.value = socialLinks.find((item) => item.platform === 'facebook')?.url || ''
    redditLink.value = socialLinks.find((item) => item.platform === 'reddit')?.url || ''
    xLink.value = socialLinks.find((item) => item.platform === 'x')?.url  || ''
}

const validateInstagramLink = () => {
    if (!instagramLink.value?.startsWith("https://www.instagram.com/") && instagramLink.value !== '') {
        socialLinksValid.value.instagram = false
    } else {
        socialLinksValid.value.instagram = true
    }
}
const validateFacebookLink = () => {
    console.log()
    if (!facebookLink.value?.startsWith("https://www.facebook.com/") && facebookLink.value !== '') {
        socialLinksValid.value.facebook = false
    } else {
        socialLinksValid.value.facebook = true
    }
}
const validateXLink = () => {
    if (!xLink.value?.startsWith("https://x.com/") && xLink.value !== '') {
        socialLinksValid.value.x = false
    } else {
        socialLinksValid.value.x = true
    }
}
const validateRedditLink = () => {
    if (!redditLink.value?.startsWith("https://www.reddit.com/user/") && redditLink.value !== '') {
        socialLinksValid.value.reddit = false
    } else {
        socialLinksValid.value.reddit = true
    }
}

const saveSocialMediaLinks = async () => {
    validateInstagramLink()
    validateFacebookLink()
    validateRedditLink()
    validateXLink()
    try {
        const response = await profileEditApi.editSocialMediaLinks([
            {platform: 'instagram', url: instagramLink.value || '' }, 
            {platform: 'facebook', url: facebookLink.value || ''}, 
            {platform: 'reddit', url: redditLink.value || ''}, 
            {platform: 'x', url: xLink.value || ''}
        ])

        if (response.status === 'success') {
            emit('updated', response.data)
            toast.add({severity: "success", summary: "Links updated!", life: 700})
        } else {
            toast.add({severity: "error", summary: "Error saving new links", life: 1000})
        }

    } catch (error) {
        console.log(error)
    }
}

watch(
  () => props.socialMediaLink,
  (val) => setSocialMediaLinks(val),
  { immediate: true, deep: false }
)

</script>

<template>
    <div class="social-media-cont">
        <i class="pi pi-instagram social-media-icon"/>
        <InputText 
            v-model="instagramLink" 
            placeholder="https://www.instagram.com/example" 
            class="social-link-input" 
            @blur="validateInstagramLink"
            :class="socialLinksValid.instagram ? '': 'input-invalid'"
            maxlength="200"
        />
    </div>

    <div class="social-media-cont">
        <i class="pi pi-facebook social-media-icon"/>
        <InputText 
            v-model="facebookLink" 
            placeholder="https://www.facebook.com/example" 
            class="social-link-input" 
            maxlength="200"
            @blur="validateFacebookLink"
            :class="socialLinksValid.facebook ? '': 'input-invalid'"                            
        />
    </div>

    <div class="social-media-cont">
        <i class="pi pi-reddit social-media-icon"/>
        <InputText 
            v-model="redditLink" 
            placeholder="https://www.reddit.com/user/example" 
            class="social-link-input" 
            maxlength="200"
            @blur="validateRedditLink"
            :class="socialLinksValid.reddit ? '': 'input-invalid'"                            
        />
    </div>

    <div class="social-media-cont">
        <i class="pi pi-twitter social-media-icon"/>
        <InputText 
            v-model="xLink" 
            placeholder="https://x.com/example" 
            class="social-link-input" 
            maxlength="200"
            @blur="validateXLink"
            :class="socialLinksValid.x ? '': 'input-invalid'"                            
        />
    </div>

    <div class="button-area">
        <Button label="Save" class="button-save" severity="success" icon="pi pi-save" :disabled="!allSocialLinksValid || !socialLinksEdited" @click="saveSocialMediaLinks"/>
        <Button label="Reset" class="button-save" outlined @click="setSocialMediaLinks(props.socialMediaLink)" :disabled="!socialLinksEdited"/>
    </div>

</template>

<style scoped>
.button-area{
    display: flex;
    margin-left: auto;
    gap: 10px;
}
.input-invalid{
    border-color: var(--red-vivid);
}

/* === social media links === */
.social-media-cont{
    display: flex;
    align-items: center;
    gap: 20px;
}

.social-media-icon{
    font-size: 1.7em;
    color: var(--gray-bright);
}

.social-link-input{
    width: 400px;
}</style>