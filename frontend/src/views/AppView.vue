<script setup lang="ts">
import ButtonBindingsMain from "@/components/home_page/HomeCenterSection.vue"
import LeftButtonSection from "@/components/home_page/HomeLeftButtonSection.vue"
import RightLogSection from "@/components/home_page/HomeRightLogArea.vue"
import devInfoDialogHome from "@/components/modals/devInfoDialogHome.vue"
import { Icon } from "@iconify/vue"
import { onMounted, ref, watch } from "vue"
import { getOS } from "@/utils"
import { useScreenSize } from "@/composables/useScreenSize"

//chek if the device is supported
const os = getOS()
const { isSupported } = useScreenSize()

const devWarningShow = ref(false)

onMounted(() => {
  if (localStorage.getItem('devDialogShow') !== 'true') {
    devWarningShow.value = true
  }
})

watch(devWarningShow, (isDialogVisible) => {
  //if the dialog closes, set it that it was show
  if (!isDialogVisible) {
    localStorage.setItem('devDialogShow', 'true')
  }
})

</script>

<template>
  <!-- optimize for browser to tell it that the about page is the main one -->
  <link rel="canonical" href="https://quickey.jotalac.pro/about" />

  <UnsupportedScreen v-if="os === 'ios' || os === 'android' || !isSupported" />
  <main v-else>
    <!-- development info dialog -->
    <devInfoDialogHome v-model:visible="devWarningShow"/>

    <!-- info icon -->
    <Icon icon="material-symbols:info-outline" class="info-button" @click="devWarningShow = true"/>

    <div id="content-container">
      <!-- left section with control buttons -->
      <LeftButtonSection :logged-in="true" :device-connected="true"/>
      <!-- center container with button binding -->
      <ButtonBindingsMain id="center-section"/>
      <!-- right section with expandable area -->
       <RightLogSection />
    </div>
  </main>
</template>

<style scoped>

#content-container{
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    grid-template-rows: 1fr;
    width: 100vw;
    max-width: 2000px;
}

#left-section{
    grid-column: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;

}
#center-section{
    grid-column: 2;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;
}
#right-section{
    grid-column: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}



/* info icon */
.info-button{
    position: absolute;
    bottom: 50px;
    right: 50px;
    width: 30px;
    height: 30px;
    margin-top: 20px;
    color: var(--gray-dark);
    cursor: pointer;
    transition: 0.2s color;
}

.info-button:hover{
    color: var(--gray-bright);
}


</style>
