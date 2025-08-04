<script setup lang="ts">
import { AuthService } from '@/api/auth/auth_service';
import { userKeybindingApi } from '@/api/keybinding/keybinding_user';
import { useConstantsStore } from '@/stores/constantsStore';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, TransitionGroup, watch } from 'vue';
import KeybindingSave from '@/components/profile/KeybindingSave.vue';
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import KeybindingSaveProfileDialog from '@/components/modals/keybindingSaveProfile/KeybindingSaveProfileDialog.vue';
import { useEditSaveDialog } from '@/composables/useKeybindingProfileEditDialog';

//search and filter values
const searchValues = ref('')
const filterLiked = ref(false)
const selectedCategories = ref([])
const sortBy = ref('date_desc')
const filterPublic = ref('all')

//pagination
const currentPage = ref(1)
const pageSize = ref(15)
const totalRecords = ref(0)

const user = AuthService.getUser()

const constantsStore = useConstantsStore()
const {keybindingCategories} = storeToRefs(constantsStore)

const sortOptions = ref([
    {label: 'Newest', value: 'date_desc'},
    {label: 'Oldest', value: 'date_asc'},
    {label: 'Most liked', value: 'most_liked'},
    {label: 'Name (A-Z)', value: 'name_asc'},
    {label: 'Name (Z-A)', value: 'name_desc'}
])

const publicOptions = ref(['all', 'public', 'private'])


const resetFilters = () => {
    filterLiked.value = false
    selectedCategories.value = []
    sortBy.value = 'date_desc'
    filterPublic.value = 'all'
}

//pagination
const onPageChange = (event: {page: number, rows: number}) => {
    currentPage.value = event.page + 1
    pageSize.value = event.rows
    filterValueChanged() 
}


// ========= displaying binding data =====================
const displayData = ref<KeybindingDataSave[]>([])
const dataLoading = ref(false)

const updateDisplayData = async () => {
    displayData.value = []
    const response = await userKeybindingApi.getKeybindingUser(
        searchValues.value,
        selectedCategories.value,
        sortBy.value,
        filterPublic.value,
        filterLiked.value,
        currentPage.value,
        pageSize.value
    )

    displayData.value = response.data
    totalRecords.value = response.count
    console.log(totalRecords.value)
}

const filterValueChanged = async () => {
    dataLoading.value = true

    await updateDisplayData()
    
    dataLoading.value = false
}

watch([filterLiked, selectedCategories, sortBy, filterPublic], ()=> {
    filterValueChanged()
})

//debounce for seaching 
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchValues, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        filterValueChanged()
    }, 500)  
})

onBeforeMount(() => {
    filterValueChanged()
})


// ========== edit save dialog =====================
const {showDialog} = useEditSaveDialog()
const currentDialogData = ref<KeybindingDataSave | null>(null)

const showEditSaveDialog = (currentData: KeybindingDataSave) => {
    currentDialogData.value = currentData
    showDialog()
}


</script>

<template>
    <div class="dashboard-container">
        <!-- title -->
        <div class="dashboard-header">
            <span class="header-title">My saves</span>
            <span class="header-name"><i class="pi pi-user"/>{{ user?.username }}</span>
        </div>
        
        <!-- seach bar  -->
        <div class="search-wrapper">
            <i class="pi pi-search search-icon"></i>
            <InputText
                v-model="searchValues"
                class="search-input"
                placeholder="Search binding saves..."    
            />
        </div>

        <!-- search filters -->
        <Toolbar class="filter-toolbar">
            <template #end>
                <Button 
                    label="Reset filters"
                    variant="text"
                    size="small"
                    @click="resetFilters"
                />                 
    
            </template>

            <template #start>
                <MultiSelect
                    v-model="selectedCategories"
                    :options="keybindingCategories"
                    :max-selected-labels="2"
                    size="small"
                    placeholder="Filter categories"
                    class="category-select"
                />

                <Select
                    v-model="sortBy"
                    :options="sortOptions"
                    option-label="label"
                    option-value="value"
                    size="small"
                    placeholder="Sort by"
                    class="sort-select"
                />

                <SelectButton 
                    v-model="filterPublic"
                    :options="publicOptions"
                    size="small"
                    class="public-select"
                />

                <Button
                    :label="filterLiked ? 'Liked' : 'All'"
                    @click="filterLiked = !filterLiked" 
                    :class="['filter-liked-button', { 'active-button': filterLiked }]"
                    size="small"
                    :icon="filterLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"
                    variant="text"
                />

            </template>


        </Toolbar>

        <!-- disaply binding data -->
        <div class="keybinding-display-cont">
            <!-- display the loading cont -->
            <Skeleton v-for="skeleton in 8" v-if="dataLoading" :key="skeleton" width="350px" height="200px" class="skeleton-loading"/>
            <p v-else-if="displayData.length === 0" class="no-saves-text">No saves availible</p>

            <!-- actual blocks of saves -->
            <TransitionGroup
                v-else
                name="save-appear"
                tag="div"
                class="saves-container"
                appear
            >
                <KeybindingSaveProfileDialog :keybiding-data="currentDialogData" v-on:dialog-hide="filterValueChanged"/>
                <KeybindingSave 
                    v-for="(bindingSave, index) in displayData" 
                    :key="bindingSave._id"
                    :keybinding="bindingSave"
                    :style="{animationDelay: `${index * 30}ms`}"
                    class="save-item"
                    @click="showEditSaveDialog(bindingSave)"
                />
            </TransitionGroup>
            
            <Paginator 
                v-if="totalRecords > 5" 
                :rows="pageSize" :totalRecords="totalRecords" 
                :rows-per-page-options="[5, 15, 30]" 
                :first="(currentPage - 1) * pageSize"
                @page="onPageChange"
                class="paginator"
                >
            </Paginator>
        </div>


    </div>
</template>

<style scoped>
.dashboard-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 10px 30px;
}

/* header contents */
.dashboard-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px;
}

.header-title{
    font-size: var(--bigger-text);
    font-weight: bold;
    color: var(--gray-bright);
}

.header-title i{
    margin-right: 10px;
}

.header-name{
    font-size: var(--smaller-text);
    color: var(--gray-bright);
}
.header-name i{
    margin-right: 10px;
}


/* search icon */
.search-wrapper {
    position: relative;
    width: 100%;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary-600);
    z-index: 1;
}

.search-input{
    width: 100%;
    padding-left: 2.5rem;
}

/* filter values */
.filter-toolbar{
    width: 100%;
    background-color: transparent;
    padding: 5px 0px;
    margin-top: 10px;
    border: none;
    /* box-shadow: 0 10px 15px rgba(0, 0, 0, 0.135); */
    z-index: 2;
}

.filter-liked-button{
    color: var(--primary-0);
    width: 80px;
    height: 31px;
}

/* .filter-liked-button.active-button{
    color: var(--red-dark);
} */

.category-select{
    width: 200px;
    margin-right: 10px;
}

.sort-select{
    width: 150px;
    margin-right: 10px;
}

.public-select{
    height: 31px;
    margin-right: 10px;
}

/* display cont of all bidings */
.keybinding-display-cont{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 30px;
    padding-bottom: 50px;
    width: 100%;
    /* height: 100%; */
    overflow: auto;
}

/* Saves container */
.saves-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
}

/* Vue transition animations */
.save-appear-enter-active {
    animation: popIn 0.2s ease-out forwards;
    animation-delay: var(--animation-delay, 0ms);
}

.save-appear-leave-active {
    transition: all 0.2s ease-in;
}

.save-appear-leave-to {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
}

/* Pop-in keyframe animation */
@keyframes popIn {
    0% {
        opacity: 0;
        transform: scale(0.8) translateY(30px);
    }
    50% {
        opacity: 0.8;
        transform: scale(1.05) translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* empty binding state */
.skeleton-loading{
    margin: 15px;
}

.no-saves-text{
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: var(--big-title-text);
    font-weight: bold;
    color: var(--gray-main);
    transform: translate(-50%, 50%);
}

.paginator{
    margin-top: 40px;
}


</style>