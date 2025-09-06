<script setup lang="ts">
import { AuthService } from '@/api/auth/auth_service';
import { profileDisplayApi } from '@/api/profile/profile_display_api';
import placeholderImage from '@/assets/images/profile/profile_placeholder.png'
import { useToast } from 'primevue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import CountUp from '../vue_bits/CountUp.vue';
import { aiGenKeybindingApi } from '@/api/ai_generation/ai_gen_keybinding_api';
import { useButtons } from '@/composables/useButtonsBindingHome';
import { useRouter } from 'vue-router';
import { useProfileEditDialog } from '@/composables/dialogVisibility/useProfileEditDialog';
import ProfileEditDialog from '../modals/profile_edit_dialog/ProfileEditDialog.vue';
import { useAuth } from '@/composables/useAuth';

export interface SocialLinks {
  platform: string,
  url: string
}

const toast = useToast()
const router = useRouter()
const {copiedValues} = useButtons()
const {showDialog} = useProfileEditDialog()

//account data display 
const {currentUser} = useAuth()
const userEmail = ref<string | null>()
const createdAt = ref<string | null>()
const bio = ref<string | null>(null)
const profilePicUrl = ref()

const profilePicDisplay = computed(() => {
  if (!profilePicUrl.value) return placeholderImage
  return profilePicUrl.value
})

//keybinding stats refs
const totalKeybindings = ref<number | null>(null)
const sharedKeybindings = ref<number | null>(null)
const likedKeybindings = ref<number | null>(null)

//ai gen data
const aiGenLimit = ref<number | null>(null)
const aiGenRemaining = ref<number | null>(null)
const aiGenAvailibleIn = ref<number | null>(null)
const aiGenHistoryData = ref<{prompt: string, createdAt: string, generatedNodes: string[]}[]>([])

const socialMediaLinks = ref<{icon: string, url: string}[]>([])
const socialLinksProp = ref<SocialLinks[]>([]) 
const handleSocialLink = (socialLinkData: SocialLinks[]) => {
  socialMediaLinks.value = []
  socialLinksProp.value = socialLinkData
  for (const socialLink of socialLinkData) {
    let iconClass = ''
    switch (socialLink.platform) {
      case "instagram": 
        iconClass = 'pi pi-instagram';
        break;
      case "facebook":
        iconClass = 'pi pi-facebook'
        break
      case "reddit":
        iconClass = 'pi pi-reddit'
        break
      case "x":
        iconClass = 'pi pi-twitter'
        break
      case "linkedin":
        iconClass = ' pi pi-linkedin'
        break
      default:
        continue
    }
    if (!socialLink.url) continue 

    socialMediaLinks.value.push({icon: iconClass, url: socialLink.url})
  }
}

const keybindingStats = computed(() => [
  { name: 'bindings', value: totalKeybindings.value, delay: 0},
  { name: 'shared', value: sharedKeybindings.value, delay: 0.3},
  { name: 'liked', value: likedKeybindings.value, delay: 0.6}
])

let canceled = false
onUnmounted(() => {canceled = true})

onMounted(async () => {
  try {
    const [accountDataResult, keybindingDataResult, aiLimitsResult, aiGenHistroyResult] = await Promise.allSettled([
      profileDisplayApi.getAccountData(),
      profileDisplayApi.getProfileBindingStats(),
      aiGenKeybindingApi.getGenerationLimits(),
      profileDisplayApi.getAiGenData()
      
    ]) 

    if (canceled) return //dont handle the data if user left the page

    //handle account general info
    if (accountDataResult.status === "fulfilled") {     
      setAccountData(accountDataResult.value.data) 
    } else { 
      toast.add({severity: "error", summary: "Error getting user data", life: 1500})
    }

    //handle keybinding stats
    if (keybindingDataResult.status === "fulfilled") {
      setKeybindingStats(keybindingDataResult.value.data)
    } else { 
      toast.add({severity: "error", summary: "Error getting keybinding stats", life: 1500})
    }

    //handle ai gen data
    if (aiLimitsResult.status === 'fulfilled' && aiGenHistroyResult.status === 'fulfilled') {
      setAiGenData(aiLimitsResult.value.data, aiGenHistroyResult.value.data)
    } else {
      toast.add({severity: "error", summary: "Error getting ai generation data", life: 1500})
    }
  } catch (error) {
    console.log(error)
    if (!canceled) {
      toast.add({severity: "error", summary: "Error getting data", life: 1500})
    }
  }
})

const setAccountData = (data: {email: string, createdAt: string, bio: string, socialLinks: any, profilePicture: string}) => {
      userEmail.value = data.email
      createdAt.value = data.createdAt.split("T")[0]
      bio.value = data.bio
      profilePicUrl.value = data.profilePicture
      handleSocialLink(data.socialLinks)
}

const setKeybindingStats = (data: any) => {
  totalKeybindings.value = data.totalCount
  sharedKeybindings.value = data.sharedCount
  likedKeybindings.value = data.likedCount
}

const setAiGenData = (dataLimits: any, dataHistory: any) => {
  aiGenLimit.value = dataLimits.dailyLimit
  aiGenRemaining.value = dataLimits.remaining
  aiGenAvailibleIn.value = dataLimits.availibleIn
  
  aiGenHistoryData.value = dataHistory.map((item: any) => {
    const hoursAgo = ((Date.now() - Date.parse(item.createdAt)) / (1000 * 60 * 60)).toFixed(1)
    return {
      ...item,
      createdAt: `${hoursAgo}h ago`
    }
  })  
}

const copyAiGenData = (copiedData: string[]) => {
  copiedValues.value = copiedData
  router.push("/app")

  toast.add({severity: 'info', summary: "Copied", detail: "Copied AI generated output", life: 800})
}

//handle emits form profile edit
const bioUpdated = (newBio: string) => {
  bio.value = newBio
}

const socialLinksUpdated = (links: SocialLinks[]) => {
  handleSocialLink(links)
}

const profilePicUpdated = (newUrl: string) => {
   profilePicUrl.value = newUrl
}

</script>

<template>
  <ProfileEditDialog 
    :username="currentUser?.username || ''" 
    :bio="bio || ''" 
    :social-media-link="socialLinksProp" 
    @bio-updated="bioUpdated" 
    @social-links-updated="socialLinksUpdated"
    @profile-pic-updated="profilePicUpdated"  
  />

  <div class="profile-wrap">
    <!-- LEFT SIDEBAR -->
    <div class="profile-side">
      <Avatar
        :image="profilePicDisplay"
        shape="circle"
        class="avatar"
      />
      <h2 class="user-name">{{currentUser?.username}}</h2>
      <Badge class="user-role-pill">{{currentUser?.role}}</Badge>

      <div class="side-stats">
        <div v-for="statObj in keybindingStats" :key="statObj.name" class="stat">
          <Skeleton v-if="statObj.value === null" width="200px" height="20px"/>
          <CountUp v-else class="num" :to="statObj.value"/>
          <span class="lbl">{{ statObj.name }}</span>
        </div>
      </div>

      <div class="side-actions">
        <Button label="Edit" size="small" text icon="pi pi-pencil" @click="showDialog"/>
        <!-- <Button label="Logout" size="small" outlined severity="warn" icon="pi pi-times"/> -->
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <section class="profile-main">
    <div class="section-block">
        <h3 class="section-title">Account</h3>
        <div class="kv-grid">
          <div class="kv">
              <span class="k">Email</span>
              <Skeleton v-if="!userEmail" width="200px" height="30px" class="skeleton-loading"/>
              <span class="v">{{userEmail}}</span>
          </div>
          <div class="kv">
              <span class="k">Username</span>
              <span class="v">{{currentUser?.username}}</span>
          </div>
          <div class="kv">
              <span class="k">Member Since</span>
              <Skeleton v-if="!createdAt" width="200px" height="30px" class="skeleton-loading"/>
              <span class="v">{{ createdAt }}</span>
          </div>
          <div class="kv">
              <span class="k">Plan</span>
              <span class="v plan">Free Tier</span>
          </div>
        </div>
    </div>

    <div class="section-block">
        <h3 class="section-title">Bio</h3>
        <Skeleton v-if="bio === null" width="90%" height="100px" class="skeleton-loading"/>
        <p class="bio">{{ bio }}</p>
    </div>

    <div class="section-block ai-gen-cont">
        <h3 class="section-title">AI generations (last 24 hours)</h3>

        <div class="ai-gen-info-cont">
          <span>Remaining {{aiGenRemaining}}/{{ aiGenLimit }}</span>
          <span v-if="aiGenRemaining === 0">{{ `Availible in ${aiGenAvailibleIn} minutes` }}</span>

        </div>
        
        <ul v-if="aiGenHistoryData.length !== 0" class="activity-list">

          <li v-for="aiGen in aiGenHistoryData" :key="aiGen.createdAt">
            <span class="dot"></span>
            <span class="prompt truncate-1">{{ aiGen.prompt }}</span>   
              <div class="copy-time-cont">
                <Button 
                  class="copy-ai-button" 
                  label="" variant="text" 
                  icon="pi pi-copy" 
                  v-tooltip="aiGen.generatedNodes.length === 0 ? 'Empty result' : 'Copy result'" 
                  :disabled="aiGen.generatedNodes.length === 0"
                  @click="copyAiGenData(aiGen.generatedNodes)"
                />
                <time>{{aiGen.createdAt}}</time>
              </div>         
          </li>
        </ul>
        <span v-else class="empty-data-msg">No AI generations</span>
    </div>

    <div class="section-block">
        <h3 class="section-title">Social media</h3>
        <div class="social-media-cont">
          <span v-if="socialMediaLinks.length === 0" class="empty-data-msg">No social media links</span>
          <a v-for="socialLink in socialMediaLinks" :key="socialLink.url" :href="socialLink.url" rel="ugc nofollow" target="_blank"><i class="social-media-icon" :class="socialLink.icon"/></a>
        </div>
    </div>
    </section>
  </div>
</template>


<style scoped>
.profile-wrap {
    display: grid;
    grid-template-columns: 250px 1fr;
    height: 100%;
    gap: 20px;
    align-items: start;
    padding: 10px;
    align-items: stretch;
}

@media (max-width: 880px) {
  .profile-wrap {
    grid-template-columns: 1fr;
    padding-bottom: 90px;
  }
  .profile-side {
    flex-direction: row;
    padding: 1rem;
    gap: 1.4rem;
  }
  .side-stats {
    flex-direction: row;
  }
  .side-actions {
    margin-top: 0;
  }
}

.profile-side {
  background: var(--primary-800);
  border: 1px solid var(--gray-dark);
  border-radius: var(--border-rad-main);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: sticky;
  height: 100%;
}

.avatar {
  width: 104px;
  height: 104px;
  align-self: center;
}

.user-name {
  font-weight: bold;
  text-align: center;
}

.user-role-pill {
  align-self: center;
  font-size: var(--small-text);
  font-weight: bold;
  padding: 10px 15px;
  border-radius: var(--border-rad-bigger);
  background: var(--blue-vivid);
}

.side-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
.stat {
  background: var(--blue-dark);
  border: 1px solid var(--gray-dark);
  padding: 10px;
  border-radius: var(--border-rad-main);
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
  min-width: 90px;
}

.stat .num {
  font-weight: bold;
  color: var(--primary-0);
}
.stat .lbl {
  font-size: var(--small-text);
  text-transform: uppercase;
  font-weight: 600;
  color: var(--gray-bright);
}

.side-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}


.profile-main {
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* max-height: 100%; */
  padding-right: 10px;
  overflow-y: scroll;
}

.section-block {
  background: var(--primary-800);
  border: solid 1px var(--gray-dark);
  border-radius: var(--border-rad-main);
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
    font-size: var(--normal-text);
    letter-spacing: .18em;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--gray-bright);
}

.kv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(210px,1fr));
    gap: 10px;
}
.kv {
    background: var(--blue-dark);
    border: 1px solid var(--gray-dark);
    padding: 10px 15px;
    border-radius: var(--border-rad-main);
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-height: 86px;
}

.k {
    font-size: 0.6em;
    letter-spacing: .15em;
    text-transform: uppercase;
    font-weight: bold;
    color: var(--gray-bright);
}
.v {
  font-size: var(--smaller-text);
  font-weight: bolder;
  color: var(--primary-0);
}
.v.plan {
    color: var(--blue-vivid);
}

.bio {
  margin: 0;
  line-height: 1.45;
  font-size: var(--smaller-text);
  max-width: 800px;
  max-height: 500px;
  min-height: 100px;
  white-space: pre-line;
  overflow-y: auto;
}

.ai-gen-info-cont{
  display: flex;
  font-size: var(--smaller-text);
  color: var(--gray-bright);
  gap: 30px;
}

.ai-gen-cont{
  background: linear-gradient(30deg, var(--blue-dark) 0%, var(--blue-vivid) 200%);
  /* flex: 1; */
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: var(--smaller-text);
    max-height: 150px;
    flex: 1;
    overflow-y: scroll;
}
.activity-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  padding-left: 5px;
}

.copy-time-cont{
    display: flex;
    align-items: center;
    margin-left: auto;
    padding: 0 15px;
}
.activity-list time {
    font-size: var(--small-text);
    color: var(--gray-bright);
    text-transform: uppercase;
    width: 70px;
}
.dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg,#2d62ff,#6a4df7);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(109,84,255,0.18);
  flex-shrink: 0;
}
.prompt{
  flex: 1;
  min-width: 0;
}

.truncate-1{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-ai-button{
    padding: 0px 10px;
    margin-right: 10px;
    color: var(--gray-bright);
}

.social-media-cont{
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    gap: 50px;
}

.social-media-icon{
    font-size: var(--big-title-text);
    color: var(--gray-bright);
    transition: 0.2s ease-in-out all;

}
.social-media-icon:hover{
    color: var(--primary-0);
    cursor: pointer;
}

.empty-data-msg{
  color: var(--gray-main);
}
</style>