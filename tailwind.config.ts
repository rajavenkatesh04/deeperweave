import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                /* Original gradient (kept for safety) */
                gradient: {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },

                /* Horizontal cinematic gradient (used by navbar + headers) */
                "gradient-x": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0% 50%" },
                },
            },
            animation: {
                /* Existing */
                gradient: "gradient 6s ease infinite",

                /* New – matches `animate-gradient-x` */
                "gradient-x": "gradient-x 8s ease infinite",
            },
        },
    },
    plugins: [],
};

export default config;
