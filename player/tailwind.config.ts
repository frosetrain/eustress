import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        extend: {
            fontSize: {
                ms: "0.9375rem",
            },
        },
    },

    plugins: [],
} satisfies Config;
