<script setup lang="ts">
import placeholderImage from '@/assets/images/profile/profile_placeholder.png'
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
      <h2 class="user-name">John Doe</h2>
      <Badge class="user-role-pill">admin</Badge>

      <div class="side-stats">
        <div class="stat">
          <span class="num">38</span>
          <span class="lbl">Bindings</span>
        </div>
        <div class="stat">
          <span class="num">12</span>
          <span class="lbl">Shared</span>
        </div>
        <div class="stat">
          <span class="num">5</span>
          <span class="lbl">Favs</span>
        </div>
      </div>

      <div class="side-actions">
        <Button label="Edit" size="small" outlined icon="pi pi-pencil"/>
        <Button label="Logout" size="small" outlined severity="warn" icon="pi pi-times"/>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <section class="profile-main">
    <div class="section-block">
        <h3 class="section-title">Account</h3>
        <div class="kv-grid">
        <div class="kv">
            <span class="k">Email</span>
            <span class="v">john.doe@example.com</span>
        </div>
        <div class="kv">
            <span class="k">Username</span>
            <span class="v">John Doe</span>
        </div>
        <div class="kv">
            <span class="k">Member Since</span>
            <span class="v">2024-05-10</span>
        </div>
        <div class="kv">
            <span class="k">Plan</span>
            <span class="v plan">Free Tier</span>
        </div>
        <!-- <div class="kv wide">
            <span class="k">Last Login</span>
            <span class="v">2025-08-17 14:23</span>
        </div> -->
        </div>
    </div>

    <div class="section-block">
        <h3 class="section-title">Bio</h3>
        <p class="bio">
        Short bio or note goes here. You can edit this later to describe your workflow, preferences, or anything relevant.
        </p>
    </div>

    <div class="section-block">
        <h3 class="section-title">AI generations (last 24 hours)</h3>
        <span class="ai-gen-remaining">Remaining 5/15</span>
        <ul class="activity-list">
        <li>
            <span class="dot"></span>
            Generate me a sequence for crossing the li...
            <Button class="copy-ai-button" label="copy result" variant="text" size="small" icon="pi pi-copy"/>
            <time>2h ago</time>
        </li>
        <li>
            <span class="dot"></span>
            Generated AI macro sequence for the wind...
            
            <Button class="copy-ai-button" label="copy result" variant="text" size="small" icon="pi pi-copy"/>
            <time>5h ago</time>
        </li>
        <li>
            <span class="dot"></span>
            In vs code select all the dis...

            <Button class="copy-ai-button" label="copy result" variant="text" size="small" icon="pi pi-copy"/>
            <time>Yesterday</time>
        </li>
        </ul>
    </div>

    <div class="section-block">
        <h3 class="section-title">Social media</h3>
        <div class="social-media-cont">
            <i class="pi pi-instagram social-media-icon"/>
            <!-- <a href="https://instagram.com/user" rel="ugc nofollow">Instagram</a> -->
            <i class="pi pi-twitter social-media-icon"/>
            <i class="pi pi-facebook social-media-icon"/>
            <i class="pi pi-reddit social-media-icon"/>
            <i class="pi pi-linkedin social-media-icon"/>
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
    overflow-y: scroll;
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
}

.ai-gen-remaining{
    font-size: var(--smaller-text);
    color: var(--gray-bright);
}
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: var(--smaller-text);
}
.activity-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  padding-left: 5px;
}
.activity-list time {
    font-size: var(--small-text);
    color: var(--gray-bright);
    margin-left: auto;
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