import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "tailwindcss";
import fs from "fs";

export default defineConfig({
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    plugins: [sveltekit(), basicSsl()],
    server: {
        https: {
            key: fs.readFileSync(`${__dirname}/cert/key.pem`),
            cert: fs.readFileSync(`${__dirname}/cert/cert.pem`),
        },
        proxy: {},
    },
});
