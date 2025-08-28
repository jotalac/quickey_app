<script setup lang="ts">
import { Icon } from '@iconify/vue';
import DecryptedText from '../vue_bits/DecryptedText.vue';
import imagePlaceholder from '@/assets/images/profile/profile_placeholder.png'
import cableConnectVideo from '@/assets/videos/cable_connect.webm'
import deviceConnect from '@/assets/videos/device_connect.webm'
import simpleBinding from '@/assets/videos/simple_binding.webm'
import multiBinding from '@/assets/videos/multi_binding.webm'
import saveBinding from '@/assets/videos/save_binding.webm'

const stepsData = [
    {
        number: 1, 
        title: "Connect Your Device",
        description: "Connect the macropad to your device using a USB-C cable. Ensure you're using a data-capable cable, not just a charging cable. If connected correctly lights should start flashing",
        imageSrc: cableConnectVideo,
        tips: ["Use a direct connection to avoid power issues", "Try different USB ports if not detected"]
    },
    {
        number: 2, 
        title: "Connect to Web Application", 
        description: "In the Quickey web app click the connect button to establish communication via Web Serial API. Device cannot be connected anywhere else. (for example Thonny for debuging)",
        imageSrc: deviceConnect,
        tips: ["Only Chromium browsers support Web Serial API (Chrome, Edge, Opera, Brave ...)", "Ensure no other tabs or services are connected to the device"]
    },
    {
        number: 3, 
        title: "Configure Key Bindings",
        description: "Set up custom shortcuts by left-clicking any button on the macropad interface. Press your desired key combination simultaneously to record it. The assigned keys will appear on the button for easy reference.",
        imageSrc: simpleBinding,
        tips: ["Avoid pressing too many keys at once for better reliability", "This method is ideal for common application shortcuts and hotkeys", "For shortcuts that trigger immediate system actions (like Ctrl + Alt + Delete), you'll need to use multi-binding instead (see step 4)"]
    },
    {
        number: 4, 
        title: "Complex multi-binding",
        description: "Create more complex multi-bindings with up to 20 actions. Right click the button on the interace and in the context menu select multi-key. Start dragging in actions.",
        imageSrc: multiBinding,
        tips: ["When pressing the button while using multi-key the device wont't be responsive until the action ends", "This method is ideal for more complex actions", "You can use this method to create shortcuts that are otherwise not possible with standart keybinding", "Use delay node to way until some actions perform (ex. application open)"]
    },
    {
        number: 5, 
        title: "Save binding to device",
        description: "Click 'save to device' button to send the current current binding to device (device must be connected - step 2). If successfull, all LEDs on the device should start flashing",
        imageSrc: saveBinding,
        tips: ["Do not disconnect the device while sending the data to it."]
    },
]
</script>

<template>
    <div class="usage-container">
        <header class="guide-header">
            <h1 class="title">
                Usage Guide
                <Icon icon="mdi:book-open-page-variant" class="title-icon"/>
            </h1>
            <DecryptedText 
                class="page-description" 
                :speed="15"
                text="Discover how to connect your Quickey macropad, set up and customize key bindings, and save your configurations using the Quickey web application."
                animate-on="view"
                :sequential="true"
            />
        </header>

        <div class="steps-grid">
            <article 
                v-for="(step, index) in stepsData" 
                :key="step.number" 
                class="step-card"
                :class="{ 'reverse': index % 2 === 1 }"
                v-animateonscroll="{ enterClass: 'animate-slide-in', leaveClass: 'animate-fade-out' }"
            >
                <div class="step-content">
                    <div class="step-header">
                        <span class="step-number">{{ step.number }}</span>
                        <h2 class="step-title">{{ step.title }}</h2>
                    </div>
                    
                    <p class="step-description">{{ step.description }}</p>
                    
                    <div v-if="step.tips" class="tips-section">
                        <h4 class="tips-title">
                            <Icon icon="mdi:lightbulb-outline" />
                            Tips
                        </h4>
                        <ul class="tips-list">
                            <li v-for="tip in step.tips" :key="tip">{{ tip }}</li>
                        </ul>
                    </div>
                </div>
                
                <div class="step-media">
                    <div class="image-container">
                        <video autoplay muted loop :src="step.imageSrc" :alt="`Step ${step.number} illustration`" class="step-image"/>
                        <div class="image-overlay"></div>
                    </div>
                </div>
            </article>
        </div>

        <footer class="guide-footer">
            <div class="completion-card">
                <Icon icon="mdi:check-circle" class="completion-icon"/>
                <h3>You're All Set!</h3>
                <p>Your Quickey macropad is now configured and ready to boost your productivity.</p>
            </div>
        </footer>

        <Button class="button-go-to" size="large"><RouterLink to="/app">Go to app</RouterLink></Button>
    </div>
</template>

<style scoped>
.usage-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.guide-header {
    text-align: center;
    margin-bottom: 60px;
    padding: 0 20px;
}

.title {
    font-size: 3em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    margin-bottom: 40px;
}

.title-icon {
    font-size: 1em;
    color: var(--primary-300);
    filter: drop-shadow(0 0 10px rgba(66, 153, 225, 0.5));
}

.page-description {
    max-width: 500px;
    font-size: var(--bigger-text);
    line-height: 1.6;
    color: var(--gray-bright);
}

.steps-grid {
    display: flex;
    flex-direction: column;
    gap: 80px;
    width: 100%;
    max-width: 1500px;
    margin-bottom: 80px;
}

.step-card {
    display: flex;
    gap: 50px;
    align-items: center;
    padding: 40px;
    background: linear-gradient(80deg, var(--blue-dark), var(--primary-1000));
    border: 1px solid var(--gray-dark);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* .step-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-400), var(--primary-200));
    opacity: 0;
    transition: opacity 0.3s ease;
} */

.step-card:hover {
    transform: translateY(-5px);
}


.step-card.reverse {
    direction: rtl;
}

.step-card.reverse .step-content {
    direction: ltr;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
}

.step-number {
    width: 60px;
    height: 60px;
    background: var(--primary-600);
    color: var(--primary-0);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(66, 153, 225, 0.082);
}

.step-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
    color: var(--primary-50);
}

.step-description {
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--gray-bright);
    margin-bottom: 40px;
}

.tips-section {
    background: var(--primary-800);
    border: 1px solid var(--gray-dark);
    border-radius: 12px;
    padding: 20px;
}

.tips-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-50);
    margin: 0 0 12px 0;
}

.tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.tips-list li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    font-size: 0.95rem;
    color: var(--gray-bright);
}

.tips-list li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-300);
    font-weight: bold;
}

.step-media {
    display: flex;
    justify-content: center;
}

.image-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    border-radius: var(--border-rad-main);
    overflow: hidden;
}

.step-image {
    height: 500px;
    width: 500px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(30deg, rgba(100, 66, 225, 0.356), transparent, transparent);
    pointer-events: none;
}

.step-card:hover .step-image {
    transform: scale(1.05);
}

.guide-footer {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
}

.completion-card {
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, rgba(31, 94, 57, 0.863), rgba(34, 153, 84, 0.911));
    border: 1px solid rgba(72, 187, 120, 0.2);
    border-radius: 20px;
    max-width: 500px;
}

.completion-icon {
    font-size: 3rem;
    color: var(--green-bright);
    margin-bottom: 15px;
}

.completion-card h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: var(--primary-0);
}

.completion-card p {
    color: var(--gray-bright);
    line-height: 1.6;
}

.button-go-to{
    background-color: var(--green-bright);
    border: 1px solid var(--green-dark);
    box-shadow: 0 0 30px rgba(7, 214, 76, 0.349);
}

.button-go-to a {
    text-decoration: none;
    color: var(--primary-1000);
}

/* Animations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0.95);
    }
}

.animate-slide-in {
    animation: slideIn 0.6s ease-out;
}

.animate-fade-out {
    animation: fadeOut 0.4s ease-in;
}

/* Responsive Design */
@media (max-width: 900px) {
    .step-card {
        flex-direction: column;
        gap: 30px;
        padding: 30px 20px;
    }
    
    .step-card.reverse {
        direction: ltr;
    }
    
    .step-header {
        gap: 15px;
    }
    
    .step-number {
        width: 50px;
        height: 50px;
        font-size: 1.2rem;
    }
    
    .step-title {
        font-size: 1.5rem;
    }
    
    .steps-grid {
        gap: 50px;
    }
}

@media (max-width: 480px) {
    .guide-header {
        margin-bottom: 40px;
    }
    
    .step-card {
        padding: 25px 15px;
    }
    
    .step-description {
        font-size: 1rem;
    }
}
</style>

<!-- <script setup lang="ts">
import { Icon } from '@iconify/vue';
// import ScrambleText from '../vue_bits/ScrambleText.vue';
import DecryptedText from '../vue_bits/DecryptedText.vue';
import imagePlaceholder from '@/assets/images/profile/profile_placeholder.png'
import ScrollReveal from '../vue_bits/ScrollReveal.vue';

const stepsData = [
    {number: 1, description: "Connect the macropad to your device with usb-c cable", imageSrc: imagePlaceholder},
    {number: 2, description: "Connect the macropad to the web app (using Web Serial API, only availible in chromiunm based browsers), by clicking the connect button on the home screen", imageSrc: imagePlaceholder},
    {number: 3, description: "Connect the macropad to your device with usb-c cable", imageSrc: imagePlaceholder},
]
</script>

<template>

    <h1 class="title">Usage guide <Icon icon="mdi:user" class="title-icon"/></h1>
    <DecryptedText 
        class="page-description" 
        :speed="10"
        text="Discover how to connect your Quickey macropad, set up and customize key bindings, and save your configurations using the Quickey web application."
        animate-on="view"
        :sequential="true"
        />

    <div class="steps-container">
        <div v-for="stepData in stepsData" :key="stepData.number" class="step-cont box-shadow-normal" v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }">
            <span class="step-number">{{ stepData.number }}.</span>
                <p class="step-description">{{ stepData.description }}</p>
            <img :src="stepData.imageSrc" class="step-image"/>
        </div>
    </div>


            
</template>

<style scoped>
.title{
    font-size: 3em;
    display: flex;
    align-items: center;
    gap: 10px;
}

.page-description{
    max-width: 800px;
    text-align: center;
    margin-top: 20px;
    font-size: var(--bigger-text);
    color: var(--gray-bright);
}

.steps-container{
    margin-top: 70px;
}

.step-cont{
    background-color: var(--blue-dark);
    padding: 20px 50px;
    border-radius: var(--border-rad-main);
    margin-bottom: 70px;
    border: 1px solid var(--gray-main);

}

.step-image{
    width: 100%;
    height: 500px;          /* keep container height if you want a fixed height */
    object-fit: contain;    /* keep aspect ratio; whole image visible */
    margin-bottom: 20px;
}

.step-number{
    font-size: 3em;
}

.step-description{
    font-size: var(--bigger-text);
    color: var(--gray-bright);
    margin-bottom: 30px;
    max-width: 1000px;
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

.animate-fadein {
  animation: customFadeIn 0.5s ease-in-out;
}

.animate-fadeout {
  animation: customFadeOut 1s ease-in-out;
}


</style> -->