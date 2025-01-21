import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        fontFamily: {
            sans: [...defaultTheme.fontFamily.sans],
            serif: [...defaultTheme.fontFamily.serif],
            mono: ['"Iosevka Extended"', ...defaultTheme.fontFamily.mono],
        },
        extend: {
            fontSize: {
                ms: "0.9375rem",
            },
        },
    },

    plugins: [],
} satisfies Config;
