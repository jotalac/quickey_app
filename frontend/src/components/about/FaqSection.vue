<script setup lang="ts"></script>

<template>

<div class="faq-cont">
    <h2>FAQ</h2>
    <Accordion >
    <AccordionPanel value="0">
        <AccordionHeader>How can i set the keys function?</AccordionHeader>
        <AccordionContent>
            <p>
            On the website quickey.jotalac.pro you can set the binding for all your 27 keys and knob
            </p>
        </AccordionContent>
    </AccordionPanel>

    <AccordionPanel value="1">
        <AccordionHeader>Do I need to install any software?</AccordionHeader>
        <AccordionContent>
            <p>
            No, everything is acessible from browser and you dont need to install anything.
            </p>
        </AccordionContent>
        </AccordionPanel>

    <AccordionPanel value="2">
        <AccordionHeader>Do i need to setup anything before i can use the macropad?</AccordionHeader>
        <AccordionContent>
            <p>
            No, if you get the assembled version, everything will be ready and you will only need to plug it to your device.
            </p>
        </AccordionContent>
    </AccordionPanel>

    <AccordionPanel value="3">
        <AccordionHeader>My browser shows me error: WebSerialAPI error.</AccordionHeader>
        <AccordionContent>
            <p>
            Quickey macropad communicates with the browser through WebSerialAPI.
            This API is currently availibe only in chromium based browsers (Google Chrome, Opera, Brave, Microsoft Edge...)
            </p>
        </AccordionContent>
    </AccordionPanel>

    <AccordionPanel value="4">
        <AccordionHeader>In which softwares can I use it?</AccordionHeader>
        <AccordionContent>
            <p>
            Device sees the macropad as keyboard input device, so any program that supports keyboard inputs will work with it?
            </p>
        </AccordionContent>
    </AccordionPanel>

    <AccordionPanel value="5">
        <AccordionHeader>What is the purpouse of the macropad?</AccordionHeader>
        <AccordionContent>
            <p>
            You can assign custom shortcuts using the web application, allowing you to control your software more efficiently. <br>
            It's especially useful for creatives and developers who want to speed up their workflow. <br>
            In addition to standard shortcuts, you can configure actions for media control—such as adjusting volume or skipping tracks—and even create longer, automated sequences, like opening ChatGPT in your browser and typing a predefined question.
            </p>
        </AccordionContent>
    </AccordionPanel>

    <AccordionPanel value="6">
        <AccordionHeader>Is the cable included?</AccordionHeader>
        <AccordionContent>
            <p>
            No as of now, cable is not included. You can use any usb-c cable that connects to your device.
            </p>
        </AccordionContent>
    </AccordionPanel>

    <AccordionPanel value="7">
        <AccordionHeader>Is my keymap saved on the device?</AccordionHeader>
        <AccordionContent>
            <p>
            Yes, the keymap is stored directly on the macropad. Once configured, it works on any compatible system without needing to reconnect to the website.
            </p>
        </AccordionContent>
    </AccordionPanel>


    <AccordionPanel value="8">
        <AccordionHeader>Can I share my keybindings with others?</AccordionHeader>
        <AccordionContent>
            <p>
            Yes, the feature of sharing your keybindings with others will be availibe in the quickey.jotalac.pro app.
            </p>
        </AccordionContent>
    </AccordionPanel>

    <AccordionPanel value="9">
        <AccordionHeader>Will there be any future updates?</AccordionHeader>
        <AccordionContent>
            <p>
            Yes, everything is still in developmnet and with current hardware you will get the new features with simple firmware updates.
            </p>
        </AccordionContent>
    </AccordionPanel>

    

    
    </Accordion>
</div>

</template>

<style scoped>
.faq-cont {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 700px;
    margin-top: 50px;
}

.faq-cont h2{
    font-size: var(--big-title-text);
}

:deep(.p-accordion) {
    width: 100%
}

p{
    color: var(--gray-bright);
}

@media (max-width: 700px) {
    .faq-cont{
        width: 100%;
        padding: 0 20px;
    }
}


</style>