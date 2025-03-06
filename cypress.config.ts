// cypress.config.ts

import { defineConfig } from 'cypress';
import axios from "axios";
import { config } from 'dotenv';
config();

export default defineConfig({
    e2e: {
        baseUrl: 'https://dev.unich.com/en/otc',
        specPattern: "e2e/**/*.{spec,cy}.{js,ts}",
        supportFile: 'e2e/support/e2e.ts',
        setupNodeEvents(on, config) {
            on("task", {
                discordNotify(message: string) {
                    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
                    if (!webhookUrl) {
                        console.error("Missing Discord webhook URL");
                        return null;
                    }
                    return axios
                        .post(webhookUrl, { content: message })
                        .then(() => null)
                        .catch((err: any) => {
                            console.error("Discord notification failed:", err.message);
                            return null;
                        });
                }
            });
            return config;
        },
    },
});
