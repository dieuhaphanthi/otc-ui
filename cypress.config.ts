// cypress.config.ts

import { defineConfig } from 'cypress';
import axios from 'axios';
import { config } from 'dotenv';

// Load .env
config();

export default defineConfig({
    e2e: {
        baseUrl: 'https://unich.com/en/otc', // URL cơ sở
        specPattern: 'e2e/**/*.{spec,cy}.{js,ts}', // Đường dẫn tới file test
        supportFile: 'e2e/support/e2e.ts', // File support, nếu có
        setupNodeEvents(on, config) {
            // In ra để kiểm tra biến môi trường
            console.log('DISCORD_WEBHOOK_URL =', process.env.DISCORD_WEBHOOK_URL);

            on('task', {
                // Task gửi notify Discord
                discordNotify(message: string) {
                    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
                    if (!webhookUrl) {
                        console.error('Missing Discord webhook URL');
                        return null;
                    }
                    // Gửi POST request lên webhook Discord
                    return axios
                        .post(webhookUrl, { content: message })
                        .then((res) => {
                            // In ra log để xác nhận Discord trả về status code
                            console.log('Discord response status:', res.status);
                            console.log('Discord response data:', res.data);
                            return null;
                        })
                        .catch((err: any) => {
                            console.error('Discord notification failed:', err.message);
                            return null;
                        });
                },
            });
            return config;
        },
    },
});
