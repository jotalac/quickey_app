<script setup lang="ts">
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import {ref} from 'vue'


interface Props {
    keybinding: KeybindingDataSave,
    mode?: 'normal' | 'hot' | 'discover'
}

const props = defineProps<Props>()

const currentPage = ref(1)
// const totalPages = 3
const isPageChanging = ref(false)


const getCurrentPageButtons = () => {
    const returnData = props.keybinding.keyBinding.filter(entry => {
        const firstIndex = 9 * (currentPage.value - 1) + 1
        const lastIndex = firstIndex + 8
        if (Number(entry.id) >= firstIndex && Number(entry.id) <= lastIndex) return true
    })

    return returnData
}

const handlePageChange = (pageNumber: number) => {
    if (pageNumber === currentPage.value) return 

    isPageChanging.value = true

    currentPage.value = pageNumber

    setTimeout(() => {
        isPageChanging.value = false
    }, 200)
    return
}

const convertDataFormat = (dateUnformated: string) => {
    return new Date(dateUnformated).toLocaleDateString()
} 

const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
        case 'general': return 'pi pi-circle-fill'
        case 'gaming': return 'pi pi-trophy'
        case 'media': return 'pi pi-play-circle'
        case 'creative': return 'pi pi-palette'
        case 'programming': return 'pi pi-code'
        case 'productivity': return 'pi pi-briefcase'
    }
}

</script>



<template>
    <div class="save-block-link">
        <div class="save-cont" :class="props.mode === 'hot' ? 'hot' : ''">
            <!-- hovering areas  -->
            <div 
                v-for="sectionNumber in 3"
                :key="sectionNumber"
                class="hover-section"
                :class="'hover-page-' + sectionNumber"
                @mouseenter="handlePageChange(sectionNumber)">
            </div>

            <!-- keys display-->
            <div class="save-keys-cont active" :class="{'page-transition': isPageChanging}">
                <!-- 9 buttons page  -->
                <div
                    v-for="button in getCurrentPageButtons()"
                    :key="button.id"
                    class="save-key"
                    :class="{
                        // 'save-key-binded': !button.isEmpty,
                        'save-key-binded': button.value && button.value.length > 0,
                        'hot': props.mode === 'hot'
                    }"
                ></div>
            </div>

            <!-- page indicator -->            
            <div class="page-num-display">
                <div
                    v-for="pageNumber in 3"
                    :key="pageNumber"
                    class="page-indicator"
                    :class="{'active': pageNumber === currentPage}"
                />
            </div>

            <!-- public/private state show -->
            <i
                class="save-public-state"
                :class="props.keybinding.public ? 'pi pi-globe' : 'pi pi-lock'"
            ></i>

            <!-- category show -->
            <i :class="getCategoryIcon(props.keybinding.category)" class="category-icon"/>

            <!-- likes section -->
            <div class="save-likes-cont">
                <i
                    class="save-likes-ico"
                    :class="props.keybinding.isLiked ? 'icon-liked pi pi-heart-fill' : 'icon-not-liked pi pi-heart'"
                ></i>    
                <p class="save-likes-num">{{ props.keybinding.likeCount}}</p>
            </div>

            <!-- bottom stats -->
            <div class="save-stats-bottom">
                <p class="save-name">{{ props.keybinding.name }}</p>
                <p class="save-date">{{ convertDataFormat(props.keybinding.createdAt) }}</p>
                
                <div class="save-username-ico-cont">
                    <p class="save-username">{{ props.keybinding.username }}</p>
                    <i class="pi pi-user"></i>
                </div>
            </div>



        </div>
    </div>

</template>

<style scoped>
.save-block-link {
    text-decoration: none;
    position: relative;
    cursor: pointer;
    z-index: 1;
}

.save-cont {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 350px;
    height: 200px;
    background-color: var(--primary-800);
    padding: 20px;
    border-radius: var(--border-rad-main);
    border: 1px var(--gray-dark) solid;
    margin: 15px;
    color: var(--primary-0);
    /* transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out; */
    transition: border 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.save-cont.hot{
    background: linear-gradient(-20deg, rgb(160, 9, 9), rgb(219, 147, 14));
    box-shadow: 0 0 30px rgb(141, 92, 27);
    border: 1px solid rgb(192, 135, 29);
}

.save-keys-cont {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 10px;
    transition: all 0.3s ease-in-out;
}
.save-keys-cont.page-transition {
    animation: scale 0.2s ease-in-out, flicker 0.2s ease-in-out;
}

@keyframes flicker {
    0% { filter: brightness(1); }
    50% { filter: brightness(0.9); }
    100% { filter: brightness(1); }
}
@keyframes scale {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}


.save-key {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    transition: all 0.2s ease;
    background-color: var(--blue-dark);
}

.save-key-binded {
    background-color: var(--blue-sky-bright);
    box-shadow: 0 0 10px rgba(3, 87, 115, 0.37);
    /* background-color: var(--green-bright); */
    /* box-shadow: 0 0 10px rgba(0, 128, 28, 0.37); */
}

.save-key-binded.hot{
    background-color: rgb(247, 210, 142);
    box-shadow: 0 0 10px rgba(168, 146, 20)
}

.save-key-empty {
    background-color: var(--blue-dark);
}

/* Knob section styles */
.knob-section {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.knob-container {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 5px;
}

.knob-element {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.knob-element.center {
    width: 20px;
    height: 20px;
}

.knob-label {
    font-size: var(--smaller-text);
    color: var(--gray-main);
    margin: 0;
}

.page-num-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 40px;
    margin-top: 15px;
    margin-bottom: 0;
    font-size: var(--small-text);
    color: var(--gray-main);
}

.page-indicator{
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: var(--gray-dark);
}

.page-indicator.active{
    background-color: var(--gray-main);
}

.save-name {
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
}

.save-stats-bottom {
    position: relative;
    margin-top: 5px;
    width: 100%;
}

.save-date {
    font-size: var(--smaller-text);
    margin: 0;
    color: var(--gray-main);
}

.save-username-ico-cont {
    display: flex;
    position: absolute;
    bottom: 0;
    right: 0;
    color: var(--gray-main);
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease-in-out;
}

.save-username {
    margin: 0;
    margin-right: 10px;
    font-size: var(--smaller-text);
}

.save-public-state {
    position: absolute;
    left: 20px;
    top: 20px;
    color: var(--gray-main);
}

.category-icon{
    position: absolute;
    left: 20px;
    top: 50px;
    color: var(--gray-main);
}

.save-likes-cont {
    display: flex;
    align-items: center;
    position: absolute;
    right: 20px;
    top: 20px;
    color: var(--gray-main);
    cursor: pointer;
    transition: color 0.2s ease;
}



.save-likes-num {
    margin: 0;
    margin-left: 5px;
}

.hover-section {
    display: block;
    position: absolute;
    width: 33.3%;
    height: 100%;
    z-index: 3;
}

.hover-page-1 {
    top: 0;
    left: 0;
}

.hover-page-2 {
    top: 0;
    left: 33.3%;
}

.hover-page-3 {
    top: 0;
    left: 66.6%;
}

.save-cont:hover {
    /* box-shadow: 5px 5px 0 var(--green-dark); */
    transform: scale(1.01);
    border: 1px var(--gray-main) solid;
}

.save-cont:hover .save-username-ico-cont {
    color: var(--primary-0);
}

.icon-liked {
    color: var(--red-dark);
}

.icon-not-liked{
    color: var(--gray-main);
}

</style>