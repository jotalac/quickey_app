<script setup lang="ts">
import {ref, onMounted, nextTick } from 'vue'
import {useRouter, useRoute} from 'vue-router'
import { Icon } from '@iconify/vue'

//images
import logo from '@/assets/images/icons/main-logo.svg'
import soonImagePoster from '@/assets/images/landing_page/soon-poster.webp'
import productImage1 from '@/assets/images/landing_page/product_1.webp'
import productImage2 from '@/assets/images/landing_page/product_2.webp'
import productImage3 from '@/assets/images/landing_page/product_3.webp'
import productImage4 from '@/assets/images/landing_page/product_4.webp'
import productImage5 from '@/assets/images/landing_page/product_5.webp'
import productImage6 from '@/assets/images/landing_page/product_6.webp'
import productImage7 from '@/assets/images/landing_page/product_7.webp'
import rotateImage from '@/assets/images/landing_page/rotate.webp'

import image1 from '@/assets/images/landing_page/1.webp'
import image2 from '@/assets/images/landing_page/2.webp'
import image3 from '@/assets/images/landing_page/3.webp'
import image4 from '@/assets/images/landing_page/4.webp'
import image5 from '@/assets/images/landing_page/5.webp'
import image6 from '@/assets/images/landing_page/6.webp'
import image7 from '@/assets/images/landing_page/7.webp'

//videos
import knobVideo from '@/assets/videos/knob_about.mp4'
import buttonVideo from '@/assets/videos/button_horizontal.mp4'
import aiVideo from '@/assets/videos/ai_binding.webm'

import discordImage from '@/assets/images/landing_page/discord.webp'
import ideaImage from '@/assets/images/landing_page/idea.webp'
import photoshopImage from '@/assets/images/landing_page/photoshop.webp'
import premiereImage from '@/assets/images/landing_page/premiere.webp'
import spotifyImage from '@/assets/images/landing_page/spotify.webp'
import resolveImage from '@/assets/images/landing_page/resolve.webp'
import vscodeImage from '@/assets/images/landing_page/vscode.webp'
import blenderImage from '@/assets/images/landing_page/blender.webp'
//components
import BlockInfo from '@/components/about/BlockInfo.vue'
import ScrollText from '@/components/about/ScrollText.vue'
import { Dialog } from 'primevue'
import SendEmailDialog from '@/components/about/SendEmailDialog.vue'
import FaqSection from '@/components/about/FaqSection.vue'
import TextType from '@/components/vue_bits/TextType.vue'
import ShinyText from '@/components/vue_bits/ShinyText.vue'

const imagesCarousel = [
  productImage1,
  productImage2,
  image3,
  image4,
  productImage5,
  image6,
  image7,
]

const appCarousel = [
  discordImage,
  ideaImage,
  photoshopImage,
  premiereImage,
  spotifyImage,
  resolveImage,
  vscodeImage,
  blenderImage
]

const featuresBlocks = [
  {
    "icon": "material-symbols:keyboard",
    "header": "27 programmable keys",
    "text": "Macropad has 27 progammable keys across 3 pages of 9 keys (9 x 3)."
  },
  {
    "icon": "solar:volume-knob-bold",
    "header": "Knob",
    "text": "Use the knob to adjust volume, scroll through timelines, control media, and many more."
  },
  {
    "icon": "material-symbols:layers-rounded",
    "header": "Multi-key",
    "text": "Bind multiple actions on one button click, automatize your actions"
  },
  {
    "icon": "streamline-plump:web",
    "header": "Application",
    "text": "Web aplication for simple binding and multi action creation."
  },
  {
    "icon": "material-symbols:save",
    "header": "Save presets",
    "text": "Save presets of your bindings in the application for fast access. Share it with to the community."
  },
  {
    "icon": "solar:pallete-2-bold",
    "header": "Customizable",
    "text": "3D print your enclosure with custom colors. Add your own keycaps, switches and knob"
  },
]

const dialogVisible = ref(false)

const openEmailDialog = () => {
  dialogVisible.value = true
}

const router = useRouter()
const goToApp = () => {
  router.push('/app')
}

const carouselResponsiveOption = ref([
    {
        breakpoint: '1350px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '900px',
        numVisible: 1,
        numScroll: 1
    },
]);

const tableProducts = [
  {
    feature: "Connector",
    specification: "USB-C"
  },
  {
    feature: "Compatibility",
    specification: "Mac, Windows (primary), Linux, Android"
  },
  {
    feature: "Keyboard",
    specification: "27 keys (9*3), 1 knob (rotary encoder)"
  },
  {
    feature: "Body",
    specification: "3D printed (PETG)",
  },
  {
    feature: "Controller",
    specification: "RP2040 zero, with on device storage",
  },
  {
    feature: "Key binding",
    specification: "Custom web application",
  },
  {
    feature: "Key switches",
    specification: "Mechanical (tactile/clicky/linear)",
  },
  {
    feature: "Key caps",
    specification: "Durable ABS/PBT",
  },
]

//for faq route when we need to scroll to it
const route = useRoute()
onMounted(async () => {
  // Wait for component to fully render
  await nextTick()
  
  // Check for hash and scroll after component is mounted
  if (route.hash) {
    // Add a small delay to ensure all components are rendered
    setTimeout(() => {
      const element = document.querySelector(route.hash)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 200) // Adjust delay as needed
  }
})

</script>

<template>
  <Dialog />

  <div class="about">

    <Image :src="logo" class="logo-top" width="80" alt="quickey-logo"/>
    <h1 class="main-header">Quickey Macropad</h1>

    <!-- <p class="catch-phrase">Simplify your workflow. Works everywhere. No downloads needed.</p> -->
    <!-- <RotatingText
      :texts="['one', 'two', 'three']"
    /> -->

    <TextType 
      :text="[
        'Boosts productivity',
        'No software required',
        'Works on any device',
        'Streamline your workflow',
        'Speed up your coding',
        'Ideal for gaming',
        'Made for creators',
        'One tap control',
        'Portable and powerful',
        'Plug-and-play simplicity',
        'Customize everything',
        'Get it now'
      ]"
      :typingSpeed="90"
      :pauseDuration="1500"
      :showCursor="true"
      cursorCharacter="|"
      class="text-type"
    />
    
    <div class="main-button-cont">
      <Button
        outlined
        rounded
        class="notify-button"
        @click="openEmailDialog"
      >
        <i class="pi pi-info-circle"></i>
        <ShinyText text="I am interested" :disabled="false" :speed="3"/>
      </Button>
      <SendEmailDialog v-model:visible="dialogVisible"/>
    </div>

    <!-- first content block -->
    <div class="block-content-cont">
      <div class="block-text-cont">
        <p class="block-paragraph">
          <span class="text-highlighted">Keys that makes you work efficiently.</span>
          Every Quickey is fully programmable to do what you need — whether it’s a single command or a complex macro. One small device, <b>27</b> actions.
        </p>
      </div>
      <Image class="image-block" :src="soonImagePoster" alt="showcase-image"/>
    </div>


    <!-- second content block -->
    <div class="block-content-cont second-block-cont" v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }">
      <Image class="image-block" :src="rotateImage" alt="showcase-image"/>
      <div class="block-text-cont">
        <p class="block-paragraph">
          <span class="text-highlighted">A knob with range</span>
          Scroll through timelines, control volume, or change tracks. Push the knob to trigger a mute volume, or assign it to do something custom.
        </p>
      </div>
    </div>


    <ScrollText text="Quickey - 27 keys - Knob - Multi-key - Web application - Save presets - Community presets - Customizable - "/>

    <div class="app-button-cont">
      <Button 
      label="Go to app"
      icon="pi pi-sign-in"
      outlined
      rounded
      class="app-button"
      @click="goToApp"
      size="big"
      /> 
      
      <span> - try the application beta version </span>

    </div>

    
    <!-- supported app carousel -->
    <p class="apps-text" >Works seamlessly with... and others</p>
    <div class="apps-display-cont">
      <Image v-for="image in appCarousel" v-bind:key="image" :src="image" alt="supported-app-image" class="img-app" v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"/>
    </div>

    <!-- videos showcase -->
     <div class="videos-cont">
       <video
          autoplay
          muted
          loop
          class="video-display"
          v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
       >
         <source :src="knobVideo" type="video/mp4">
       </video>

       <video
          autoplay
          muted
          loop
          class="video-display"
          v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }" 
       >
         <source :src="buttonVideo" type="video/mp4">
       </video>

     </div>

    <div class="block-features-cont">
      <!-- <div v-for="item in featuresBlocks"> -->
        <BlockInfo v-for="item in featuresBlocks" :key="item.header" :icon="item.icon" :header="item.header" :text="item.text"/>
    </div>

    <div class="ai-cont">
      <p class="ai-header"><Icon icon="mingcute:ai-fill" width="40" height="40"  style="color: var(--blue-vivid)" />AI-powered macro sequences</p>
      <p class="ai-description">Create sequences of actions by prompting AI, you don’t need to know the steps. Simply tell AI what you’d like to do, and it creates the macro</p>
       <video
          autoplay
          muted
          loop
          class="ai-video-display"
       >
         <source :src="aiVideo" type="video/mp4">
       </video>
    </div>


    <!-- self made quote -->
    <div class="quote-cont" v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }">
      <span class="text-bigger">Not corporate. Just crafted.</span>
      <p class="text-quote">
        I didn’t set out to build a product — just something that made my own setup better. Crafted by only me.
      </p>
    </div>
    
    <!-- image carusel -->
    <Carousel 
      :value="imagesCarousel" 
      circular 
      :autoplay-interval="2500"
      :num-visible="3"
      :num-scroll="1"
      class="image-carousel"
      v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"

      :responsive-options="carouselResponsiveOption"
    >
      <template #item="{data}">
        <div class="carousel-item">
          <Image :src="data" class="carousel-image" alt="image-build"/>
        </div>
      </template>
    </Carousel>

    
    <div class="support-cont">
      <p>Since I’m building this project by myself in my free time, your support means a lot to me.</p>
      <a href='https://ko-fi.com/R6R71KF055' target='_blank'>
        <img height='50' style='border:0px;height:50px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' />
      </a>
    </div>


    <DataTable :value="tableProducts">
      <Column field="feature" header="" class="feature-column" />
      <Column field="specification" header="" class="specification-column"/>
    </DataTable>

    <FaqSection id="faq"/>

    <ScrollTop/>
  </div>
</template>

<style scoped>
.about{
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: start;
  width: 100vw;
  margin-top: 80px;
  margin-bottom: 100px;
  
}

.item-big{
  width: 250px;
  height: 2050px;
  background-color: red;
  flex-shrink: 0;
}


.item-smaller{
  width: 250px;
  height: 300px;
  background-color: green;
  flex-shrink: 0;
  margin-top: 200px;
}

/* override global styles for this page */
:global(#app:has(.about)) {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  align-items: flex-start !important;
}

.main-header{
  font-size: 80px;
  width: 500px;
  text-align: center;
  line-height: 1em;
}

.catch-phrase{
  color: var(--gray-bright);
  font-size: var(--bigger-text);
  width: 500px;
  text-align: center;
  margin-top: 40px;

}

.main-button-cont{
  margin-top: 20px;
}

.notify-button{
  color: var(--green-bright);
  margin-right: 20px;
  animation: slowGlowGreen 3s ease-in-out infinite alternate;
}

.app-button-cont{
  justify-content: center;
  margin-left: 40px;
  margin-top: 30px;
  width: 100%;
  max-width: 1500px;
}

.app-button{
  color: var(--blue-vivid);
  /* margin-right: auto; */
}



.text-highlighted{
  color: var(--primary-0);
  display: block;
  font-weight: bold;
}

.block-content-cont{
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1500px;
  margin-top: 70px;
  padding: 0 40px;
}

.block-text-cont{
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 50px;
}


.block-paragraph{
  width: 300px;
  font-size: var(--bigger-text);
  color: var(--gray-bright);
}

:deep(.image-block img){
  border-radius: var(--border-rad-main) !important;
  border: 1px solid var(--gray-main);
  max-width: 600px;
  aspect-ratio: 1;
  margin-left: auto;
}

.quote-cont{
  width: 100%;
  max-width: 1500px;
  margin-top: 40px;
  padding: 0 40px;
}

.text-bigger{
  font-size: var(--big-title-text);
  color: var(--primary-0);
  text-align: left;
  font-weight: bold;
}

.text-quote{
  /* font-size: var(--bigger-text); */
  width: 70%;
  color: var(--gray-bright);
}

/* carousel styles */
.image-carousel{
  width: 100%;
  max-width: 1500px;
  margin-top: 30px;
}

.carousel-item{
  display: flex;
  justify-content: center;
}

:deep(.carousel-image img) {
  width: 100%;
  max-width: 400px;
  height: 500px;
  object-fit: cover;
  border-radius: var(--border-rad-main);
  border: 1px solid var(--gray-main);
  transition: transform 0.3s ease;
}

.support-cont{
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin-top: 30px;
  font-weight: bold;
  max-width: 1500px;
  width: 100%;
  font-size: var(--bigger-text);
  text-align: center;
  padding: 10px;
}

/* :deep(.carousel-image-app img){
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--border-rad-main);
  border: none;
  transition: transform 0.3s ease;
} */

/* .carousel-item{
  width: 25%;
} */

.block-features-cont{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1500px;
  padding: 0 40px;
  margin-top: 50px;
}

.ai-cont{
  display: flex;
  flex-direction: column;
  max-width: 1500px;
  width: 100%;
  margin-top: 30px;
  padding: 0 40px;
  align-items: center;
}

.ai-header{
  font-size: var(--big-title-text);
  font-weight: bold;
  margin-right: auto;
  display: flex;
  align-items: center;
}

.ai-description{
  width: 70%;
  color: var(--gray-bright);
  margin-right: auto;
}

.ai-video-display {
  width: 1000px;
  border-radius: var(--border-rad-main);
  border: 1px solid var(--gray-main);
  margin-top: 30px;
}


.apps-text{
  font-weight: bold;
  font-size: var(--big-title-text);
  margin-top: 20px;
  text-align: center;
}

.apps-display-cont{
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1500px;
  padding: 0 40px;
  margin-top: 40px;
}

:deep(.img-app img){
  width: 80px;
  height: 80px;
  margin: 10px;
  filter: saturate(0) brightness(1.6);
}


:deep(.p-datatable-table){
  margin-top: 30px;
  border-radius: var(--border-rad-main);
}

:deep(.feature-column){
  color: var(--gray-bright);

}

:deep(.specification-column){
  text-align: end;
}

.videos-cont{
  display: flex;
  flex-wrap: wrap;
  max-width: 1500px;
  width: 100%;
  align-items: center;
  justify-content: space-evenly;
  margin-top: 20px;
  padding: 0 20px;
}

.video-display{
  width: 500px;
  border-radius: var(--border-rad-main);
  border: 1px solid var(--gray-main);
  margin: 10px 10px;
}

.text-type{
  font-size: var(--bigger-text);
  margin-top: 20px;
  font-weight: bold;
  background-color: var(--primary-600);
  border-radius: var(--border-rad-main);
  padding: 5px 15px;
}



/* ============ scroll test ============== */




/* =================== ANIMATIONS =========================== */
.animate-fadein {
  animation: customFadeIn 0.5s ease-in-out;
}

.animate-fadeout {
  animation: customFadeOut 1s ease-in-out;
}

@keyframes customFadeIn {
  from {
    opacity: 0;
    transform: translate(50px);
  }
  to {
    opacity: 1;
    transform: translate(0) scale(1);

  }
}

@keyframes customFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.5);
  }
}

@keyframes slowGlowGreen {
  0% {
    box-shadow: 0 0 10px rgba(3, 145, 46, 0.336);
  }
  100% {
    box-shadow: 
      0 0 20px rgba(2, 163, 43, 0.4),
      0 0 30px rgba(3, 126, 13, 0.2);
  }
}



/* ============================= responsibility ============================ */
@media (max-width: 1200px) {
  :deep(.image-block img) {
    width: 500px
  }
}

@media (max-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }

  .ai-video-display{
    width: 100%;
  }
}


@media (max-width: 900px) {
  .block-content-cont{
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  /* make the image visible firtst */
  .second-block-cont .image-block {
    order: 2;
  }
  .second-block-cont .block-text-cont {
    order: 1;
  }



  :deep(.image-block img) {
    width: 90%;
    margin: 0;
    margin-top: 20px;
  }

  .image-block{
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  .block-text-cont{
    width: 100%;
  }

  .block-paragraph{
    width: 70%;
  }

  :deep(.img-app img) {
    width: 50px;
    height: 50px;
  }

  .apps-text{
    font-size: var(--bigger-text);
    padding: 0 20px;
  }

}


@media (max-width: 800px) {
  /* dont display go to app when on this screen size you cannot go to the app */
  .app-button-cont{
    display: none;
  }
}

@media (max-width: 620px) {
  .text-bigger{
    font-size: var(--bigger-text);
  }

  .text-quote{
    width: 90%;
    font-size: var(--normal-text);
  }

  .block-paragraph{
    font-size: var(--normal-text);
  }

  .video-display{
    width: 90%;
  }

  .ai-header{
    font-size: var(--bigger-text);
  }

  .ai-description{
    width: 100%;
  }
}

@media (max-width: 500px) {
  .main-header{
    font-size: var(--big-title-text);
  }

  .catch-phrase{
    font-size: var(--normal-text);
    width: 90%;
  }

  :deep(.p-datatable-table){
    font-size: var(--smaller-text) !important;
  }

  .text-type{
    font-size: var(--normal-text);
  }
}

</style>
