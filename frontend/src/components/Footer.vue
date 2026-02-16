<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<template>
    <footer>
        <div id="icons-links">
            <a href="mailto:jotalac@jotalac.dev?subject=[Quick key - question]">
                <Icon icon="mdi:envelope" class="icon-footer"/>
                <spn class="icon-text">Contact</spn>
            </a>
            <a href="https://ko-fi.com/quickey" target="_blank">
                <!-- <i class="fa-solid fa-circle-dollar-to-slot"></i> -->
                <Icon icon="mingcute:pig-money-fill" class="icon-footer"/>
                <spn class="icon-text">Support</spn>
            </a>
            <a href="https://instagram.com/quickey.pro/" target="_blank">
                <Icon icon="mdi:instagram" class="icon-footer"/>
                <spn class="icon-text">Instagram</spn>
            </a>
            <!-- <a href="https://github.com/JouSee11/QUICK_KEY_controller/" target="_blank">
                <Icon icon="line-md:github" class="icon-footer"/>
                <spn class="icon-text">GitHub</spn>
            </a> -->
            <a href="https://www.linkedin.com/in/josef-tala%C4%8D-827241260/" target="_blank">
                <Icon icon="mdi:linkedin" class="icon-footer"/>
                <spn class="icon-text">LinkedIn</spn>
            </a>

            <RouterLink to="/privacy-policy" style="margin: 0;">
                <a href="" target="_blank">
                    <Icon icon="basil:document-outline" class="icon-footer"/>
                    <spn class="icon-text">Privacy Policy</spn>
                </a>
            </RouterLink>
        </div>
        <p>Created by Josef Talač</p>
    </footer>
</template>

<style scoped>

footer{
    display: flex;
    width: 100vw;
    height: 50px;
    position: fixed;
    bottom: 0;
    padding: 0.5em;
    justify-content: space-around;
    align-items: center;
    background-color: transparent;
    background: linear-gradient(to top, var(--primary-1000), transparent);
    z-index: 10;
}

footer a{
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    font-size: var(--normal-text);
    color: var(--blue-dark);
    transition: all 0.1s ease-in-out;
    margin-left: 50px;
    transition: color 0.2s ease-in-out;
}

footer a:hover, 
footer p:hover{
    color: var(--primary-0);
    text-shadow: 0 0 15px var(--primary-0-shadow);
}

#icons-links{
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
}

footer p{
    color: var(--blue-dark);
}

footer #icons-links a .icon {
    padding: 10px;
}

.icon-footer {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}

@media (max-width: 1000px) {
    .icon-text{
        font-size: 0em;
    }

    footer p{
        font-size: 0;
    }    
}
</style>