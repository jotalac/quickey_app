import {defineStore } from 'pinia'
import {ref, computed, readonly} from 'vue'
import { useToast } from 'primevue/usetoast'
import { useButtonBindStore } from './buttonBindStore'
import type { KnobBindHome } from '@/types/buttonBindHome'


export const useDeviceStore = defineStore('device', () => {
    // ========================================
    // STATE
    // ========================================
    const isConnected = ref<boolean>(false)
    const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
    const deviceInfo = ref<{
        name: string,
        firmware: string
    }>({name: '', firmware: ''})
    const lastError = ref<string>('')
    const logs = ref<string[]>(["--LOG-- --FOR DEBUG--"])

    //serial communication variables
    const devicePort = ref<any>(null)
    const writer = ref<any>(null)
    const reader = ref<any>(null)
    const serialBuffer = ref<string>('')

    const toast = useToast()

    // ========================================
    // GETTERS
    // ========================================
    const canCommunicateWithDevice = computed(() => 
        isConnected.value && connectionStatus.value === 'connected'
    )

    const statusText = computed(() => {
        const statusMap = {
            connecting: 'Connecting...',
            connected: `Connected`,
            error: `Error: ${lastError.value}`,
            disconnected: `Disconnected`
        }
        return statusMap[connectionStatus.value]
    })

    // ========================================
    // PRIVATE HELPERS FUNCTIONS
    // ========================================
    const checkWebSerialSupport = (): boolean => {
        if (!('serial' in navigator)) {
            if (lastError.value !== "Web serial API is not supported by your browser") {
                toast.add({severity: 'error', summary: 'WebSerialAPI error', detail: 'Your browser does not support serial connection. Please use chromium based browsers to connect to your device.'})
                setError('Web serial API is not supported by your browser')
            }
            return false
        }
        return true
    }

    const setError = (message: string): void => {
        lastError.value = message
        connectionStatus.value = 'error'
        console.error(`[Device Store] ${message}`)
        logs.value.push(`[Device Store] ${message}`)
    }

    const resetState = () : void => {
        isConnected.value = false
        connectionStatus.value = 'disconnected'
        deviceInfo.value = {firmware: '', name: ''}
        lastError.value = ''
        serialBuffer.value = ''
    }

    //function to clean up all resources before disconnect
    const cleanupResources = async (): Promise<void> => {
        try{
            if (writer.value) {
                await writer.value.close()
                writer.value.releaseLock()
                writer.value = null
            }
            if (reader.value) {
                await reader.value.cancel()
                reader.value.releaseLock()
                reader.value = null
            }
            if (devicePort.value) {
                await devicePort.value.close()
                devicePort.value = null
            }
        } catch (error: any) {
            console.log(`Resources cleanup error: ${error}`);
        }
    }

    //start reading the serial data
    const startReadingSerial = async (): Promise<void> => {
        if (!reader.value) return

        try {
            while (isConnected.value && reader.value) {                
                const {value, done} = await reader.value.read()

                if (done) {
                    reader.value.releaseLock()
                    break
                }

                const chunk = new TextDecoder().decode(value)
                serialBuffer.value += chunk

                if (serialBuffer.value.includes('\n')) {
                    // TODO: add it to the log area
                    // console.log(`[Device debug]: ${serialBuffer.value}`);
                    logs.value.push(`[Device debug]: ${serialBuffer.value}`);                    
                    
                    //if we recpgnise the import from the device (printing from the device starts with _import_)
                    if (serialBuffer.value.startsWith('_import_')) {
                        handleImportData(serialBuffer.value)
                    }
                    if (serialBuffer.value.startsWith('_firmware_')){
                        
                        saveFirmwareData(serialBuffer.value)
                    }

                    //reset the serial buffer value after the whole message
                    serialBuffer.value = ''
                }
            }
        } catch (error: any) {
            //show message when user unplugs the device while being connected
            if (error.name === "NetworkError") {
                toast.add({severity: 'warn', summary: 'Disconnected', detail: 'Device was disconnected', life: 2000})
                disconnect();
            } else { //if some other error occurs
                setError(`Reading error ${error.message}`)
            }
        }
    }


    const handleImportData = (data: string): JSON | null => {        
        try {
            const jsonData = JSON.parse(data.substring(8))
            logs.value.push("Imported data:", jsonData);
            
            //get button store and handle the incomming data
            const buttonStore = useButtonBindStore()
            Object.entries(jsonData as Record<string, string[]>).forEach(([buttonId, keyCodes]: [string, string[]]) => {
                if (buttonId === 'bindingName') { //handle importing the save name
                    buttonStore.currentBindingName = keyCodes[0]
                    return
                }
                const buttonIndex = buttonStore.allButtons.findIndex(btn => btn.id === parseInt(buttonId))
            
                if (buttonIndex !== -1) {
                    // Update the button's value
                    // buttonStore.allButtons[buttonIndex].value = keyCodes
                    
                    buttonStore.updateButton(parseInt(buttonId), {value: keyCodes})                        

                    // Update button state and text
                    if (keyCodes[0] === 'multi') {
                        // buttonStore.allButtons[buttonIndex].state = 'multiBinding'
                        buttonStore.updateButton(parseInt(buttonId), {state: 'multiBinding', text: `multi(${keyCodes.length - 1})`})                        
                        // buttonStore.allButtons[buttonIndex].text= 'multi'
                    }
                    else if (keyCodes.length > 0) {
                        buttonStore.updateButton(parseInt(buttonId), {state: 'binded', text: keyCodes.join(' + ')})                        

                        // buttonStore.allButtons[buttonIndex].state = 'binded'
                        // buttonStore.allButtons[buttonIndex].text = keyCodes.join(' + ')                        
                    } else {
                        buttonStore.updateButton(parseInt(buttonId), {state: 'notBinded'})                        

                        // buttonStore.allButtons[buttonIndex].state = 'notBinded'
                        // buttonStore.allButtons[buttonIndex].text = buttonStore.getButtonText('notBinded')
                    }
                }
            })

            //import the knob data
            const knobDataImported = jsonData['knob'] as string[]
            if (knobDataImported.every(data => data === '')) {
                console.log("knob data empty");
            }
            else {
                const knobTemp: KnobBindHome = {state: 'binded', values: {left: knobDataImported[0], right: knobDataImported[1], button: knobDataImported[2]}}
                buttonStore.setKnob(knobTemp)
            }


            logs.value.push("Button bindings updated successfully")

            toast.add({
                severity: 'success', 
                summary: 'Import Success', 
                detail: 'Button bindings imported from device', 
                life: 2000
            })

            return jsonData
        } catch (error) {
            setError('Failed to parse import data')
            return null
        }
    }

    const saveFirmwareData = (data: string): void => {
        try {
            const dataInfo = data.split('_')
            
            deviceInfo.value.name = dataInfo[2]
            deviceInfo.value.firmware = dataInfo[3]


        } catch (error: any) {
            console.log("Failed to process firmware data:" + error.message);
            
        }
    }

    // ========================================
    // PUBLIC ACTIONS
    // ========================================
    const connect = async(): Promise<boolean> => {
        if (!checkWebSerialSupport()) {
            return false
        }

        connectionStatus.value = 'connecting'

        try{
            //request port selection from user
            devicePort.value = await (navigator as any).serial.requestPort()
            await devicePort.value.open({ baudRate: 9600 })
            
            //setup readers/writers
            reader.value = devicePort.value.readable.getReader()
            writer.value = devicePort.value.writable.getWriter()

            //update state
            isConnected.value = true
            connectionStatus.value = 'connected'
            lastError.value = ''


            //start reading from the connected serial
            startReadingSerial()

            console.log("Device connected successfully");
            logs.value.push("Device connected successfully")
            toast.add({severity: 'success', summary: 'Connected', detail: 'Device connected successfully', life: 2000})
            // Wait for a short time to ensure device is ready
            await new Promise(resolve => setTimeout(resolve, 500));
            return true            
        } catch (error: any) {
            console.error(error.name);

            //user doesnt select a device -> we dont want to display error
            if (error.name === 'NotFoundError') {
                logs.value.push("No port selected");
                isConnected.value = false
                connectionStatus.value = 'disconnected'
                lastError.value = ''
                return true
            }
            
            setError(error.message || 'Failed to connnect to device')
            toast.add({severity: 'error', summary: 'Connection error', detail: 'Error: device might be connected to another endpoint.', life: 3000})
            isConnected.value = false
            return false
        }
    }

    const disconnect = async (): Promise<void> => {
        try {
            await cleanupResources()
            resetState()
            logs.value.push("Device disconnected successfully");
        } catch (error: any) {
            setError(`Failed to disconnect: ${error.message}`)
        }
    }

    const sendToDevice = async (data: any): Promise<boolean> => {
        if (!writer.value || !isConnected.value) {
            //action shouldnt be possible to call when device is not connected 
            throw new Error('device not connected') 
        }

        try {
            let dataToSend: string;

            if(typeof data === 'string') {
                dataToSend = data
            } else {
                dataToSend = JSON.stringify(data)
            }
            // const data = JSON.stringify(data)
            const encoder = new TextEncoder()
            await writer.value.write(encoder.encode(dataToSend + '\n'))

            logs.value.push(`Data send: ${dataToSend}`);

            //dont show this toast when importing
            if (data !== 'import data' && data !== 'firmware data') {
                toast.add({severity: 'success', summary: 'Success', detail: 'Data was saved successfully', life: 2000})
            }
            return true
        } catch (error: any) {
            setError(`Failed to send data: ${error.message}`)
            toast.add({severity: 'error', summary: 'Error', detail: 'Error saving data to devie!', life: 2000})

            throw error
        }
    }

    //TODO - probably doesnt work
    const importFromDevice = async (): Promise<any> => {
        if (!canCommunicateWithDevice.value) {
            throw new Error('Cannot import - device not connected')
        }

        try {
            // Send import command to device
            await sendToDevice('import data')
        
            // Return promise that resolves when import data is received
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                reject(new Error('Import timeout'))
                }, 5000)

                // Listen for import data (you might need to implement this differently)
                // This is a simplified version
                setTimeout(() => {
                clearTimeout(timeout)
                resolve({ imported: true })
                }, 1000)
            })
        } catch (error: any) {
            setError(`Import failed: ${error.message}`)
            throw error
        }
    }

    const getFirmwareInfo = async () => {
        if (!canCommunicateWithDevice.value) throw new Error("cannot get firmware data - device not connected")
        try {            
            await sendToDevice('firmware data')
            //wait so that the data gets read correctly
            await new Promise(resolve => setTimeout(resolve, 500))    
        } catch (error: any) {
            setError(`Firmware data get failed ${error.message}`)
        }
    }

    // Handle page unload
    const handlePageUnload = (): void => {
        if (isConnected.value) {
            disconnect()
        }
    }

    // ========================================
    // RETURN API
    // ========================================
    return {
        // State (readonly)
        // isConnected: readonly(isConnected),
        // connectionStatus: readonly(connectionStatus),
        // deviceInfo: readonly(deviceInfo),
        // lastError: readonly(lastError),
        isConnected: computed(() => isConnected.value),
        connectionStatus,
        deviceInfo,
        lastError,
        logs,
        
    
        // Getters
        statusText,
        canCommunicateWithDevice,
        
        // Actions
        connect,
        disconnect,
        sendToDevice,
        importFromDevice,
        handlePageUnload,
        getFirmwareInfo
    
        // For debugging (optional)
        // debug: {
        //     picoPort: readonly(picoPort),
        //     serialBuffer: readonly(serialBuffer)
        // }
    }


})