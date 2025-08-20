import { definePreset } from '@primeuix/themes'
import Aura from "@primeuix/themes/aura"
import { colorScheme } from '@primeuix/themes/aura/autocomplete'

const CustomTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: 'rgb(245, 246, 250)',
            100: '#D4DDF7',
            200: '#293988',
            300: '#15137A',
            400: 'rgb(25, 32, 97)',
            500: 'rgb(44, 51, 82)',
            600: 'rgb(44, 51, 82)',
            700: 'rgb(27, 30, 43)',
            800: 'rgb(27, 30, 43)',
            900: 'rgb(11, 13, 20)',
            950: 'rgb(11, 13, 20)'
        },
        green: {
            50: 'rgb(35, 219, 19)',
            100: 'rgb(50, 153, 19)',
            "vivid": 'rgb(71, 229, 71)',
            "bright": 'rgb(29, 163, 83)',
            "dark": 'rgb(79, 98, 79)',
        },
        colorScheme: {
            dark: {
                primary: {
                    color: '{primary.50}',
                    contrastColor: '{primary.50}',
                    hoverColor: '{primary.50}',
                    activeColor: '{primary.50}'
                },
                secondary: {
                    color: '{primary.50}',
                    contrastColor: '{green.dark}',
                    hoverColor: '{green.bright}',
                    activeColor: '{green.vivid}'
                },
                surface: {
                    0: 'rgb(245, 246, 250)',
                    50: '#D4DDF7',
                    100: '#293988',
                    200: '#15137A',
                    300: 'rgba(122, 124, 145, 1)',
                    400: 'rgba(124, 130, 164, 1)',
                    500: 'rgb(44, 51, 82)',
                    600: 'rgb(27, 30, 43)',
                    700: 'rgb(27, 30, 43)',
                    800: 'rgb(11, 13, 20)',
                    900: 'rgb(11, 13, 20)',
                    950: 'rgb(11, 13, 20)'
                }
            }
        }
    }
})

export default CustomTheme