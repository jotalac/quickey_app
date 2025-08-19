<script setup lang="ts">
import { AuthService } from '@/api/auth/auth_service';
import { profileDisplayApi } from '@/api/profile/profile_display_api';
import placeholderImage from '@/assets/images/profile/profile_placeholder.png'
import { useToast } from 'primevue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import CountUp from '../vue_bits/CountUp.vue';

const toast = useToast()

//account data display 
const user = AuthService.getUser()
const userEmail = ref<string | null>()
const createdAt = ref<string | null>()
const bio = ref<string | null>()

//keybinding stats refs
const totalKeybindings = ref<number | null>(null)
const sharedKeybindings = ref<number | null>(null)
const likedKeybindings = ref<number | null>(null)

const socialMediaLinks = ref<{icon: string, url: string}[]>([])
const handleSocialLink = (socialLinkData: {platform: string, url: string}[]) => {
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
    //get user data
    const [accountDataResult, keybindingDataResult] = await Promise.allSettled([
      profileDisplayApi.getAccountData(),
      profileDisplayApi.getProfileBindingStats()
    ]) 

    if (canceled) return //dont handle the data if user left the page

    if (accountDataResult.status === "fulfilled") {      
      userEmail.value = accountDataResult.value.data.email
      createdAt.value = accountDataResult.value.data.createdAt.split("T")[0]
      bio.value = accountDataResult.value.data.bio
      handleSocialLink(accountDataResult.value.data.socialLinks)
    } else { 
      toast.add({severity: "error", summary: "Error getting user data", life: 1500})
    }

    //get keybinding stats
    if (keybindingDataResult.status === "fulfilled") {
      totalKeybindings.value = keybindingDataResult.value.data.totalCount
      sharedKeybindings.value = keybindingDataResult.value.data.sharedCount
      likedKeybindings.value = keybindingDataResult.value.data.likedCount
    } else { 
      toast.add({severity: "error", summary: "Error getting keybinding stats", life: 1500})
    }
    
    
    
  } catch (error) {
    console.log(error)
    if (!canceled) {
      toast.add({severity: "error", summary: "Error getting data", life: 1500})
    }
  }
})

</script>

<template>
  <div class="profile-wrap">
    <!-- LEFT SIDEBAR -->
    <div class="profile-side">
      <Avatar
        :image="placeholderImage"
        shape="circle"
        class="avatar"
      />
      <h2 class="user-name">{{user?.username}}</h2>
      <Badge class="user-role-pill">{{user?.role}}</Badge>

      <div class="side-stats">
        <div v-for="statObj in keybindingStats" :key="statObj.name" class="stat">
          <Skeleton v-if="statObj.value === null" width="200px" height="20px"/>
          <CountUp v-else class="num" :to="statObj.value"/>
          <span class="lbl">{{ statObj.name }}</span>
        </div>
      </div>

      <div class="side-actions">
        <Button label="Edit" size="small" text icon="pi pi-pencil"/>
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
              <span class="v">{{user?.username}}</span>
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
        <Skeleton v-if="!bio" width="90%" height="100px" class="skeleton-loading"/>
        <p class="bio">{{ bio }}</p>
    </div>

    <div class="section-block ai-gen-cont">
        <h3 class="section-title">AI generations (last 24 hours)</h3>
        <span class="ai-gen-remaining">Remaining 5/15</span>
        <ul class="activity-list">
        <li>
            <span class="dot"></span>
            Generate me a sequence for crossing the li...
            <div class="copy-time-cont">
                <Button class="copy-ai-button" label="" variant="text" size="small" icon="pi pi-copy"/>
                <time>2h ago</time>
            </div>
        </li>
        <li>
            <span class="dot"></span>
            Generated AI macro sequence for the wind...
            
            <div class="copy-time-cont">
                <Button class="copy-ai-button" label="" variant="text" size="small" icon="pi pi-copy"/>
                <time>2h ago</time>
            </div>
        </li>
        <li>
            <span class="dot"></span>
            In vs code select all the dis...

            <div class="copy-time-cont">
                <Button class="copy-ai-button" label="" variant="text" size="small" icon="pi pi-copy"/>
                <time>2h ago</time>
            </div>
        </li>
        </ul>
    </div>

    <div class="section-block">
        <h3 class="section-title">Social media</h3>
        <div class="social-media-cont">
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
  letter-spacing: 0.15em;
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
  max-height: 100%;
  padding-right: 10px;
  overflow-y: auto;
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
}

.ai-gen-remaining{
    font-size: var(--smaller-text);
    color: var(--gray-bright);
}
.ai-gen-cont{
  background: linear-gradient(30deg, var(--blue-dark) 0%, var(--blue-vivid) 200%);
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: var(--smaller-text);
    max-height: 200px;
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
}
.dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg,#2d62ff,#6a4df7);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(109,84,255,0.18);
  flex-shrink: 0;
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
</style>