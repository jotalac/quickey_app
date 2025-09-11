import { computed, onMounted } from 'vue'
import type { ButtonState, ButtonBindHome, KnobBindHome } from '@/types/buttonBindHome'
import { useButtonBindStore } from '@/stores/buttonBindStore'
import { useKeyCapture } from '@/composables/useKeyCapture'

export const useButtons = () => {
    const store = useButtonBindStore()
    const { startCapturing, stopCapturing} = useKeyCapture()

    // Computed values (derived state)
    const currentPageButtons = computed(() => {
        const startIndex = (store.currentPage - 1) * store.buttonsPerPage
        const endIndex = startIndex + store.buttonsPerPage
        return store.allButtons.slice(startIndex, endIndex)
    })

    //initialize buttons on startup
    const initButtons = () => {
        const buttons: ButtonBindHome[] = []
        // Fix: Start from 1, not 0
        for (let i = 1; i <= store.totalPages * store.buttonsPerPage; i++) {
            buttons.push({
                id: i,
                text: store.getButtonText('notBinded'),
                state: "notBinded" as ButtonState,
                value: []
            })
        }
        store.setButtons(buttons)
    }

    const resetKnob = () => {
        if (store.showKnob) {
            const knob: KnobBindHome = {state: "notBinded", values: {left: '', right: '', button: ''}}
            store.setKnob(knob)
        }
    }

    const getButtonValue = (buttonId: number) => {
        return store.allButtons.find(button => button.id === buttonId)
    }


    //page navigation
    const changePage = (pageNumber: number) => {        
        store.setCurrentPage(pageNumber)
    }

    
    const bindButtonValue = (buttonId: number, text: string, value: string[]) => {
        store.updateButton(buttonId, {
            state: 'binded',
            text: text,
            value: value
        })
    }

    const listeningButton = (buttonId: number) => {
        //diable listening on all other buttons
        stopListeningAll()
        store.updateButton(buttonId, {
            state: 'listening'
        })

        startCapturing(buttonId)
    }

    const stopListeningAll = () => {
        //stop key capturing
        stopCapturing()

        store.allButtons.forEach(btn => {
            if (btn.state === 'listening') {
                store.updateButton(btn.id, {state: 'notBinded', value: []})
            }
        })
    }

    //reset one button
    const resetButton = (buttonId: number) => {


        store.updateButton(buttonId, {
            state: 'notBinded',
            value: []
        })
    }


    const pasteCopied = (buttonTo: number) => {
        store.pasteCopiedValues(buttonTo)
    } 

    const changePageTabClick = (e: KeyboardEvent) => {
        // console.log(e.code);

        
        if (e.code === "Tab") {
            e.stopPropagation()
            
            store.incrementPage()
        }
    }

    onMounted(() => {
        document.addEventListener('keydown', changePageTabClick)
    })

    return {
        allButtons: computed(() => store.allButtons),
        currentPage: computed(() => store.currentPage),
        totalPages: computed(() => store.totalPages),
        showKnob: computed(() => store.showKnob),
        knobElement: computed(() => store.knobElement),
        currentPageButtons,
        copiedValues: computed({
            get: () => store.copiedValues,
            set: (val) => store.copiedValues = val
        }),
        currentBindingName: computed({
            get: () => store.currentBindingName,
            set: (val) => store.currentBindingName = val
        }),

        
        initButtons,
        changePage,
        bindButtonValue,
        listeningButton,
        resetKnob,
        resetButton,
        getButtonValue,
        pasteCopied
        // resetButton
    }
}