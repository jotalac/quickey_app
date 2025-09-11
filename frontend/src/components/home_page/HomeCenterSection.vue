<script setup lang="ts">
import ButtonBox from "@/components/home_page/ButtonBox.vue"
import RoundPageButton from "@/components/home_page/RoundPageButton.vue"
import {onMounted, toRaw} from "vue"
import {useButtons} from "@/composables/useButtonsBindingHome"
import { Button } from "primevue"
import { Icon } from '@iconify/vue'
import {ref, computed} from 'vue'
import HomeKnob from "@/components/home_page/HomeKnob.vue"
import { useDeviceStore } from "@/stores/deviceStore"
import { storeToRefs } from "pinia"
import type { ButtonBindHome } from "@/types/buttonBindHome"
import MultiBindingDialog from "@/components/modals/multiBinding/MultiBindingDialog.vue"
import { useMultiBindingDialogStore } from "@/stores/multiBindingDialogStore"
import KnobBindingDialog from "@/components/modals/knobBinding/KnobBindingDialog.vue"
import { useKnobDialogStore } from "@/stores/knobDialogStore"
import { useDeviceActions } from "@/composables/useButtonActions"
import { useAiKeybindingDialog } from "@/composables/dialogVisibility/useAiKeybindingDialog"
import { useAuth } from "@/composables/useAuth"
import { useKeybindingSaveEdit } from "@/composables/useKeybindingSavePreview"

const {importData} = useDeviceActions()
//use the composable functoins
const {
    allButtons,
    currentPage,
    currentPageButtons,
    initButtons,
    copiedValues,
    changePage,
    listeningButton,
    totalPages,
    showKnob,
    knobElement,
    resetButton,
    pasteCopied,
    getButtonValue,
    currentBindingName
    
} = useButtons()

const deviceStore = useDeviceStore()
const {
    isConnected,
    connectionStatus,
    deviceInfo
} = storeToRefs(deviceStore)
const {
    connect,
    disconnect,
    sendToDevice,
    getFirmwareInfo
} = deviceStore

const multiBindingDialogStore = useMultiBindingDialogStore()

const {showDialog} = useAiKeybindingDialog()
const {isLoggedIn} = useAuth()

const {convertValueForTooltip, getButtonState} = useKeybindingSaveEdit()

// init buttons when componets are visible
onMounted(() => {
    if (allButtons.value.length === 0) {
        initButtons()
    }
    // initKnob()
})



const handleBindButton = (buttonId: number) => {
    //start listening on the button
    listeningButton(buttonId)
}

const handleResetButton = (buttonId: number) => {
    resetButton(buttonId)
}

const toggleConnect = async () => {
    console.log(isConnected.value);
    
    
    if (!isConnected.value) {
        await connect()        
        await getFirmwareInfo()
        await importData()

    } else {
        await disconnect()
    }

}


const saveDataToDevice = async () => {
    if (!isConnected.value) return //dont send if the device is not connected

    //convert data form the buttons to specified structure
    const dataToSend: Record<string, string[]> = {}
    dataToSend["bindingName"] = [currentBindingName.value]

    //add buttons
    allButtons.value.forEach((btn: ButtonBindHome) => {
        // Convert reactive array to plain array using toRaw or spread operator
        dataToSend[String(btn.id)] = toRaw(btn.value)
    })

    //add knob data
    dataToSend['knob'] = [knobElement.value.values.left, knobElement.value.values.right, knobElement.value.values.button] 

    await sendToDevice(dataToSend)
}

//context menu actions
const contextMenu = ref()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeButtonContext = ref<any>(null)


const menuItems = computed(() => [
    {
        label: 'Multi-key',
        icon: 'pi pi-pencil',
        command: () => {
            multiBindingDialogStore.openDialog(activeButtonContext.value)
        }
    },
    {
        label: 'AI generate',
        icon: 'pi pi-asterisk',
        disabled: !isLoggedIn.value,
        command: () => {
            showDialog(activeButtonContext.value)
        }
    },
    { 
        label: 'Delete',
        icon: 'pi pi-times',
        command: () => {
            handleResetButton(activeButtonContext.value)
        }
    },
    { 
        label: 'Copy',
        icon: 'pi pi-copy',
        disabled: getButtonValue(activeButtonContext.value)?.value.length === 0, //dont copy empty value
        command: () => {
            copiedValues.value = getButtonValue(activeButtonContext.value)?.value || []
            console.log(copiedValues.value)
        }
    },
    { 
        label: 'Paste',
        icon: 'pi pi-arrow-down-right',
        disabled: copiedValues.value === null,
        command: () => {
            pasteCopied(activeButtonContext.value)
        }
    },
])

const handleContextMenu = (buttonId: number, event: MouseEvent) => {
    activeButtonContext.value = buttonId
    contextMenu.value.show(event)
}

// === KNOB ===
const knobDialogStore = useKnobDialogStore()


</script>

<template>
    <div id="center-section">

         <MultiBindingDialog/>
         <KnobBindingDialog />
         <AiKeybindingDialog />

        <div id="connection-cont">
            <p class="device-info">{{ deviceInfo.name }} - {{ deviceInfo.firmware }}</p>
            <div class="connection-cont-info">
                <div 
                    id="connection-icon"
                    :class="{
                        'connected': connectionStatus === 'connected',
                        'disconnected': connectionStatus === 'disconnected',
                        'connecting': connectionStatus === 'connecting',
                        'error': connectionStatus === 'error'
                    }"
                />
                <p id="connection-msg">
                    {{
                        connectionStatus === 'connected' ? 'Connected'
                        : connectionStatus === 'disconnected' ? 'Disconnected'
                        : connectionStatus === 'connecting' ? 'Connecting...'
                        : connectionStatus === 'error' ? 'Error'
                        : ''
                    }}
                </p>
                <Button 
                    type="submit" 
                    id="connect-button"
                    rounded
                    variant="outlined"
                    :class="{
                        'connected': connectionStatus === 'connected',
                        'disconnected': connectionStatus === 'disconnected',
                        'connecting': connectionStatus === 'connecting',
                        'error': connectionStatus === 'error'
                    }"
                    @click="toggleConnect"
                >
                    {{isConnected ? 'Disconnect' : 'Connect'}}
                </Button>
            </div>
        </div>
        
        <!-- main buttons display -->
         <Transition name="page-slide" mode="out-in">
            <div id="buttons-container" :data-page="currentPage" :key="currentPage">
                <ButtonBox 
                    v-for="button in currentPageButtons"
                    :key="button.id"
                    :button-id="button.id"
                    :text="button.text"
                    :state="button.state"
                    :active-context-menu="activeButtonContext"
                    @bind-button="handleBindButton"
                    @context-menu="handleContextMenu"
                    v-tooltip.top="{
                        value: convertValueForTooltip(button.value),
                        disabled: getButtonState(button.value) !== 'multiBinding',
                        pt: {
                            text: {
                                class: 'multi-binding-tooltip',
                                // style: 'width: 300px'
                                style: 'width: 300px; background: var(--primary-50); color: var(--primary-1000)'
                                // style: 'width: 300px; background: var(--green-dark);'
                            }
                        }
                    }"
                />

                <HomeKnob 
                    v-if="showKnob && knobElement && currentPage === totalPages + 1"
                    :state="knobElement.state"
                    @open-dialog="knobDialogStore.openDialog"
                />

                <ContextMenu ref="contextMenu" :model="menuItems" @hide="activeButtonContext = null"/>
            </div>
        </Transition>

                    
        <!-- page numbers display -->
        <div id="pages-switch-cont">
            <div class="main-page-buttons">
                <RoundPageButton
                    v-for="page in totalPages"
                    :key="page"
                    :number-display="page"
                    :enabled="true"
                    :data-page="page"
                    :class="{ active: currentPage === page }"
                    @click="changePage(page)"
    
                />
            </div>
            <!-- <Icon icon="mdi:knob" class="icon-knob" />  -->
            <RoundPageButton
                v-if="showKnob"
                :key="'knob'"
                :number-display="'K'"
                :enabled="true"
                :icon="'pi pi-circle-fill'"
                :class="[{ active: currentPage === (totalPages+1)}, 'knob-page-btn']"
                @click="changePage(totalPages+1)"
            />
        
        </div>

        <!-- save button -->
        <Button 
            type="submit" 
            id="submit-button" 
            severity="secondary" 
            :disabled="!isConnected"
            @click="saveDataToDevice"
            >
            <Icon icon="material-symbols:upload" class='icon'/>
            Save to device
        </Button>   

    </div>
</template>

<style scoped>


#buttons-container{
    display: grid;
    height: 510px;
    width: 510px;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    position: relative;
}

/* pages switch */
#pages-switch-cont{
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    justify-content: center; /* Center the page buttons */
    align-items: center;
    width: 400px;
    position: relative; /* Allow absolute positioning for knob */
}

.main-page-buttons {
    display: flex;
    flex-direction: row;
}

.knob-page-btn{
    position: absolute !important;
    right: 0;
}

#submit-button{
    margin-top: 20px;
    color: var(--green-bright);
}
#submit-button .icon{
    color: inherit;
}

#connection-cont{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

.connection-cont-info{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.device-info{
    font-size: var(--small-text);
    color: var(--gray-main);
    margin-bottom: 5px;
    transition: 0.2s color ease-in-out;
}


#connection-icon {
    width: 20px;
    height: 20px;
    background-color: var(--gray-main);
    border-radius: 50%;
    margin-right: 5px;
    animation: blink 1s infinite alternate;
}
#connection-icon.connected{
    background-color: var(--green-vivid);
    box-shadow: 0 0 15px rgba(16, 223, 16, 0.153);
}
#connection-icon.disconnected{
    background-color: var(--red-vivid);
    box-shadow: 0 0 15px rgba(224, 79, 7, 0.742);
}
#connection-icon.connecting{
    background-color: var(--primary-50);
    box-shadow: 0 0 15px rgba(12, 118, 218, 0.742);
}


#connection-msg{
    color: var(--primary-0);
    margin-right: 15px;
    text-transform: uppercase;
    font-size: var(--small-text);
}

.context-menu-active{
    background-color: blue;
}

/* Blinking Animation */
@keyframes blink {
    0% { opacity: 1; }   /* Fully visible */
    100% { opacity: 0.5; } /* Fades out */
}

#connect-button{
    width: 120px;
    height: 25px;
    line-height: 10px;
    padding: 5px 10px;
    font-size: var(--smaller-text);
    outline: none;
    /* border: none;
    background-color: var(--green-dark);
    color: var(--primary-0); */
}

#connect-button.connected{
    color: var(--green-dark);
}
#connect-button.disconnected{
    color: var(--red-dark);
}
#connect-button.connecting{
    color: var(--primary-50);
}
#connect-button.error{
    color: var(--gray-main);
}



/* ============ transition animation between pages ========= */
.page-slide-enter-active,
.page-slide-leave-active {
    transition: all 0.2s ease-in-out;
}

.page-slide-enter-from {
    /* opacity: 0; */
    filter: brightness(1.3);
    /* transform: translateX(50px); */
    /* transform: scale(0.95); */
    
}

.page-slide-leave-to {
    /* opacity: 0; */
    /* transform: translateX(-50px); */
    filter: brightness(1.5);
    /* transform: scale(0.95); */
}

.page-slide-enter-to,
.page-slide-leave-from {
    opacity: 1;
    filter: brightness(1.0);
    /* transform: translateX(0); */
    transform: scale(1.0);
}





</style>