<script setup lang="ts">
import { discoverKeybindingApi } from '@/api/keybinding/keybinding_discover';
import KeybindingSaveProfileDialog from '@/components/modals/keybindingSaveProfile/KeybindingSaveProfileDialog.vue';
import { useEditSaveDialog } from '@/composables/dialogVisibility/useKeybindingProfileEditDialog';
import { useAuth } from '@/composables/useAuth';
import { useConstantsStore } from '@/stores/constantsStore';
import type { KeybindingDataSave } from '@/types/keybindingSaveTypes';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue';
import {onMounted, ref, watch} from 'vue'

const {currentUser} = useAuth()
const toast = useToast()

//variables
const searchValues = ref('')
const selectedCategories = ref([])
const sortBy = ref('date_desc')
const dataLoading = ref(true)

//pagination
const currentPage = ref(1)
const pageSize = ref(15)
const totalRecords = ref(0)

const constantsStore = useConstantsStore()
const {keybindingCategories} = storeToRefs(constantsStore)

const sortOptions = ref([
    {label: 'Newest', value: 'date_desc'},
    {label: 'Oldest', value: 'date_asc'},
    {label: 'Most liked', value: 'most_liked'},
    {label: 'Name (A-Z)', value: 'name_asc'},
    {label: 'Name (Z-A)', value: 'name_desc'}
])

const resetFilters = () => {
    selectedCategories.value = []
    sortBy.value = 'date_desc'
}

const displayData = ref<KeybindingDataSave[]>([])
const hotDisplayData = ref<KeybindingDataSave[]>([])

//pagination
const onPageChange = (event: {page: number, rows: number}) => {
    currentPage.value = event.page + 1
    pageSize.value = event.rows
    filterValueChanged() 
}

// ========= displaying binding data =====================
const filterValueChanged = async () => {
    dataLoading.value = true

    await updateDisplayData()
    
    dataLoading.value = false
}

const updateDisplayData = async () => {
  displayData.value = []
  
  const response = await discoverKeybindingApi.getKeybindingDiscover(
    currentUser.value?.id || '',
    searchValues.value,
    selectedCategories.value,
    sortBy.value,
    currentPage.value,
    pageSize.value
  )

  console.log(response)

  displayData.value = response.data
  totalRecords.value = response.count
}

const getHotKeybindings = async () =>{
  hotDisplayData.value = []

  const response = await discoverKeybindingApi.getHotKeybindings(3, currentUser.value?.id)
  console.log(response)
  hotDisplayData.value = response.data
}

onMounted(async () => {
  await filterValueChanged()
  await getHotKeybindings()
})

watch([selectedCategories, sortBy], ()=> {
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

//dialog showing 
// const {showDialog} = useKeybindingDiscoverDialog()
const {showDialog} = useEditSaveDialog()
const currentDataDialog = ref<KeybindingDataSave | null>(null)

const showSaveDialog = (currentData: KeybindingDataSave) => {
  if (!currentUser.value) { //only logged users can view the content
    toast.add({severity: "info", summary: "Please log-in", detail: "Only logged-in in users can view the shared saves", life: 3000})
    return
  }
  currentDataDialog.value = currentData
  showDialog()
}

const handleItemLiked = (isLiked: boolean, saveId: string, likeCount: number) => {
  //update in the display area
  const index = displayData.value.findIndex(item => item._id === saveId)
  if (index !== -1) {
    displayData.value[index].isLiked = isLiked
    displayData.value[index].likeCount = likeCount
  }
  
  //update in the hot binding area
  const index_hot = hotDisplayData.value.findIndex(item => item._id === saveId)
  if (index_hot !== -1) {
    hotDisplayData.value[index].isLiked = isLiked
    hotDisplayData.value[index].likeCount = likeCount
  }
  
}

</script>

<template>
  <div class="discover-wrapper">
    <h1 class="main-title">
      <Icon icon="mdi:compass" class="hero-icon" />
      Discover
    </h1>
    <DecryptedText
      class="main-description"
      :speed="15"
      text="Explore and download community-created macropad configurations."
      animate-on="view"
      :sequential="true"
    />

   <div v-if="hotDisplayData.length > 0" class="hot-cont">
      <div class="hot-header">
        <Icon icon="mdi:fire" class="hot-icon" />
        <span class="hot-title">Hot Right Now</span>
      </div>
      <div class="hot-saves-cont">
          <KeybindingSave
            v-for="(bindingSave, index) in hotDisplayData" 
            :key="bindingSave._id"
            :keybinding="bindingSave"
            :style="{animationDelay: `${index * 100}ms`}"
            mode="hot"
            class="hot-save-item"
            @click="showSaveDialog(bindingSave)"
          />
      </div>
    </div>

    <div class="search-filters-cont">
      <!-- seach bar  -->
      <div class="search-wrapper">
        <i class="pi pi-search search-icon"></i>
        <InputText
            v-model="searchValues"
            class="search-input"
            placeholder="Search binding saves..."
            size="large"
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

          </template>


      </Toolbar>
    </div>

    <div class="saves-display-cont">
      <div v-if="dataLoading" class="skeleton-div">
        <Skeleton v-for="skeleton in 8" :key="skeleton" width="350px" height="200px" class="skeleton-loading"/>
      </div>
      <p v-else-if="displayData.length === 0" class="no-saves-text">No saves availible</p>

      <TransitionGroup
          v-else
          name="save-appear"
          tag="div"
          class="saves-container"
          appear
      >  
        <!-- <KeybindingSaveDiscover
          :keybiding-data="currentDataDialog"
          @like-change="handleItemLiked"
        /> -->
        <KeybindingSaveProfileDialog
          :keybiding-data="currentDataDialog"
          :editable="false"
          @like-change="handleItemLiked"
        />
        <KeybindingSave
          v-for="(bindingSave, index) in displayData" 
          :key="bindingSave._id"
          :keybinding="bindingSave"
          :style="{animationDelay: `${index * 20}ms`}"
          class="save-item"
          @click="showSaveDialog(bindingSave)"
        />
      </TransitionGroup>

      <Paginator 
        v-if="totalRecords > 5" 
        :rows="pageSize" :totalRecords="totalRecords" 
        :rows-per-page-options="[5, 15, 30]" 
        :first="(currentPage - 1) * pageSize"
        class="paginator"
        @page="onPageChange"
      >
      </Paginator>
    </div>


    
    <!-- <div class="high" :style="{height: '1000px', width:'50px',backgroundColor: 'black'}"></div> -->
  </div>
</template>

<style scoped>
/* override global styles for this page */
:global(#app:has(.discover-wrapper)) {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  align-items: flex-start !important;
}

.discover-wrapper{
  max-width: 2000px;
  width: 100%;
  overflow-y: auto;
  display: flex;
  padding: 80px 10px;
  align-items: center;
  justify-content: start;
  flex-direction: column;
}

.main-title{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 4em;
  color: var(--primary-50);
  text-align: center;
}

.main-description{
  font-size: var(--bigger-text);
  max-width: 900px;
  text-align: center;
  color: var(--gray-bright);
}

.hot-cont{
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin-top: 40px;
  padding: 20px 15px;
  background: linear-gradient(145deg, rgba(121, 34, 10, 0.671), rgba(63, 38, 0, 0.904));
  border: 1px solid rgba(255, 87, 34, 0.15);
  border-radius: var(--border-rad-bigger);
  position: relative;
  overflow: hidden;
}

.hot-cont::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff5722, #ff9800, #ff5722);
  background-size: 200% 100%;
}



.hot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.hot-icon {
  font-size: 1.8rem;
  color: #ff5722;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(255, 87, 34, 0.3));
  }
  50% { 
    transform: scale(1.3);
    filter: drop-shadow(0 0 12px rgba(255, 87, 34, 0.5));
  }
}

.hot-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: rgb(219, 164, 14);
  letter-spacing: 0.5px;
}

.hot-saves-cont {
  display: flex;
  gap: 15px;
  width: 100%;
}



.search-filters-cont{
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  align-items: center;
  margin-top: 50px;
  background-color: var(--primary-800);
  border-radius: var(--border-rad-main);
  border: 1px solid var(--gray-dark);
  padding: 20px;
}

/* search icon */
.search-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
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

.category-select{
    width: 200px;
    margin-right: 10px;
}

.sort-select{
    width: 150px;
    margin-right: 10px;
}

.saves-display-cont{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 30px;
    max-width: 2000px;
    width: 100%;
    position: relative;
    min-height: 200px;
    backdrop-filter: blur(5px);
    /* background: var(--blue-dark); */
    backdrop-filter: blur(5px);
    border-radius: var(--border-rad-main);
    border: 1px solid var(--gray-dark);
    padding: 30px 10px;
}

/* Saves container */
.saves-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
}

.skeleton-loading{
    margin: 15px;
}

.no-saves-text{
    position: absolute;
    left: 50%;
    top: 30%;
    font-size: var(--big-title-text);
    font-weight: bold;
    color: var(--gray-main);
    transform: translate(-50%, 50%);
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

.paginator{
    margin-top: 40px;
}

</style>