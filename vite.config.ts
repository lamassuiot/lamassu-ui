import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import eslint from "vite-plugin-eslint";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), eslint()],
    server: {
        port: 3000
    },
    resolve: {
        alias: {
            assets: path.resolve(__dirname, "src/assets"),
            auths: path.resolve(__dirname, "src/auths"),
            components: path.resolve(__dirname, "src/components"),
            ducks: path.resolve(__dirname, "src/ducks"),
            utils: path.resolve(__dirname, "src/utils"),
            views: path.resolve(__dirname, "src/views")
        }
    }
});
