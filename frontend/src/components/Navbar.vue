<script setup lang="ts">
import logoBeta from "@/assets/images/icons/logo-beta.svg"
import { ref, onMounted } from "vue"
import { Icon } from '@iconify/vue'
import {RouterLink, useRoute} from 'vue-router'

//get if the user is logged in from the parrent
const props = defineProps<{
    isLoggedIn: boolean
    username?: string
}>()


// const {logout} = useAuth()
//check on which page are we

const route = useRoute();
const isActiveLink = (routePath: String) => {
    return route.path === routePath;
}

const otherItems = ref([
    {
        label: 'App',
        route: '/app'
    },
    {
        label: 'Discover',
        route: '/discover'
    },
    {
        label: 'About',
        route: '/'
    },
    {
        label: 'Other',
        icon: 'pi pi-angle-down',
        items: [
            {label: 'shop', route: '/shop'},
            {label: 'FAQ', route: '/#faq'},
            {label: 'firmware', route: '/firmware'},
            {label: 'guide', route: '/guide'},
        ]
    },
])

</script>

<template>
    <header>
        <nav id="main-nav">
            <RouterLink to="/app"><img :src="logoBeta" alt="logo" id="navigation-logo"></RouterLink>

            <div id="navigation-links">

                 <Menubar :model="otherItems">
                    <template #item="{ item, hasSubmenu }">
                        <RouterLink  
                            v-slot="{ href, navigate }"
                            :to="item.route"
                            custom
                            :class="[isActiveLink(item.route) ? 'activeLink' : 'inactiveLink']"
                        >
                            <a :href="href" @click="navigate">
                                <span class="dropdown-icon">{{ item.label }}</span>
                                <span :class="item.icon" />
                            </a>
                        </RouterLink>
                    </template>
                </Menubar>

            </div>
            
            <Button
                variant="outlined"
                id="login-button-nav"
                >
                <!-- v-tooltip="'Availible soon'" -->
                <RouterLink v-if="isLoggedIn" to="/profile">
                    <Icon icon="iconamoon:profile-fill" class="icon-nav" />
                    {{ username }}
                </RouterLink>
                <RouterLink v-else to="/login">
                    <Icon icon="material-symbols:login-rounded" class="icon-nav"/>
                    Login
                </RouterLink>
            </Button>
        </nav>
    </header>
</template>

<style scoped>
#main-nav{
    position: fixed;
    width: 100vw;
    height: 65px;
    top: 0;
    left: 0;
    padding: 0px 40px 0 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: var(--blue-dark); */
    backdrop-filter: blur(5px) brightness(0.9);
    z-index: 10;
}

#main-nav:hover #navigation-logo{
    filter: grayscale(0) drop-shadow(0 0 20px rgba(17, 48, 121, 0.363));
}


#navigation-logo{
    position: absolute;
    left: 70px;
    top: 8px;

    width: 50px;
    height: 50px;
    cursor: pointer;
    filter: grayscale(1);
    transition: all 0.2s ease-in-out;
}

#navigation-links{
    display: flex;
    align-items: center;
    margin-left: 50px;
}

#navigation-links a {
    text-decoration: none;
    font-size: var(--normal-text);
    text-transform: uppercase;
    color: var(--gray-bright);
    margin-right: 30px;
    transition: all 0.1s ease-in-out;
}

#navigation-links a:hover{
    color: var(--primary-0) !important;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.418);

}

:deep(.p-menubar-item-content:hover){
    background-color: transparent !important;
}

#login-button-nav{
    position: absolute !important;
    color: var(--gray-bright);
    right: 70px;

    /* margin-left: auto; */
}

#login-button-nav a{
    text-decoration: none;
    color: var(--gray-bright);
}
#login-button-nav:hover a{
    text-decoration: none;
    color: var(--primary-1000);
}

.activeLink{
    color: var(--primary-50) !important;
}

:deep(.p-menubar.p-component) {
    background: inherit;
    border: none;
}

:deep(.p-menubar-submenu) {
    padding: 10px;
    margin-top: 10px;
}

:deep(.p-menubar-submenu .p-menubar-item-content){
    margin-bottom: 5px;
}

@media (max-width: 950px) {
    :deep(.p-menubar-root-list) {
        width: 200px !important;
    }
    :deep(.p-menubar-item-content) {
        margin-bottom: 5px;
        margin-left: 10px;
    }
}



@media (max-width: 800px){
    #navigation-logo{
        display: none;
    }

    #navigation-links{
        width: 100%;
    }

}

@media (max-width: 500px) {
    #navigation-links{
        margin-left: 0;
    }

    #main-nav{
        padding: 0 10px;
    }

    #login-button-nav{
        right: 20px;
        width: 100px;
        height: 35px;
    }
}
</style>