/// <reference types="cypress" />

interface Discrepancy {
    marketId: string;
    error: string;
}

function chunkString(str: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < str.length) {
        chunks.push(str.slice(i, i + maxLength));
        i += maxLength;
    }
    return chunks;
}

const commonHeaders = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
    origin: 'https://unich.com',
    priority: 'u=1, i',
    referer: 'https://unich.com/',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
};

const marketsHeaders = {
    ...commonHeaders,
    'x-signature': 'cd14199c14a3a425d979649efbb757e0f2bfb1ae2eba16f860398fc647651b45',
    'x-timestamp': Math.floor(Date.now() / 1000).toString() // Lấy timestamp hiện tại
};

const tradeLatestHeaders = {
    ...commonHeaders,
    'x-signature': 'd865a8773e682085aad492d1c308f47c17c900b5b4df82e77d4c29f1c82a4b4f',
    'x-timestamp': Math.floor(Date.now() / 1000).toString() // Lấy timestamp hiện tại
};

const orderbookHeaders = {
    ...commonHeaders,
    'x-signature': 'bf5602b2f6abcb45547b9fd3c6dfa030b3dd47d61b959cc58ba00b33ce94bfc3',
    'x-timestamp': Math.floor(Date.now() / 1000).toString() // Lấy timestamp hiện tại
};

// Định nghĩa interface cho response của API orderbook
interface OrderbookResponse {
    data: {
        asks: { price: string }[];
        bids: { price: string }[];
    };
    signal: number;
    status_code: number;
    timestamp: number;
    message?: string | string[];
    error?: string;
    statusCode?: number;
}

describe('Compare Orderbook with Latest Trade', () => {
    let totalMarket = 0;
    const discrepancies: Discrepancy[] = [];
    const warnings: Discrepancy[] = [];

    it('should compare last price and best price between API and DOM', () => {
        cy.viewport('macbook-16');
        cy.visit('https://unich.com/en/otc');
        cy.wait(5000);

        cy.request({
            method: 'GET',
            url: 'https://api.unich.com/trading/order/v1/markets?limit=200',
            headers: marketsHeaders
        })
            .then((response) => {
                const marketData = response.body.data;
                const marketIds: string[] = marketData.map((m: any) => m.market_id);
                totalMarket = marketIds.length;
            })
            .then(() => {
                cy.wait(5000);
            })
            .then(() => {
                cy.request({
                    method: 'GET',
                    url: 'https://api.unich.com/trading/order/v1/markets?limit=200',
                    headers: marketsHeaders
                }).then((resp) => {
                    const marketData = resp.body.data;
                    const marketIds: string[] = marketData.map((m: any) => m.market_id);

                    cy.wrap(marketIds).each((marketId: string) => {
                        cy.log(`Đang xử lý market_id: ${marketId}`);
                        cy.visit(`https://unich.com/en/otc?market_id=${marketId}`);

                        // Chờ trang load
                        cy.wait(30000);

                        let apiLastPrice: string | null = null;

                        // Lấy dữ liệu từ API trade/latest
                        cy.request({
                            method: 'GET',
                            url: `https://api.unich.com/trading/order/v1/trade/latest?market_id=${marketId}`,
                            headers: tradeLatestHeaders,
                            failOnStatusCode: false
                        }).then((tradeResp) => {
                            if (tradeResp.status !== 200) {
                                warnings.push({
                                    marketId,
                                    error: `API trade/latest trả về lỗi ${tradeResp.status}: ${tradeResp.body.message || 'Unknown error'}`
                                });
                                return;
                            }

                            const tradeData = tradeResp.body.data;
                            apiLastPrice = tradeData && tradeData.length > 0 ? tradeData[0].price : null;
                            if (!apiLastPrice) {
                                warnings.push({
                                    marketId,
                                    error: 'Không có dữ liệu từ API trade/latest'
                                });
                                return;
                            }

                            // Lấy dữ liệu từ API orderbook
                            cy.request({
                                method: 'GET',
                                url: `https://api.unich.com/trading/order/orderbook/v1?market_id=${marketId}&precision=0.0001`,
                                headers: orderbookHeaders,
                                failOnStatusCode: false
                            }).then((orderbookResp) => {
                                if (orderbookResp.status !== 200) {
                                    warnings.push({
                                        marketId,
                                        error: `API orderbook trả về lỗi ${orderbookResp.status}: ${orderbookResp.body.message || 'Unknown error'}`
                                    });
                                    return;
                                }

                                const orderbookData = orderbookResp.body as OrderbookResponse;
                                const hasAsks = orderbookData.data.asks.length > 0;
                                const hasBids = orderbookData.data.bids.length > 0;

                                if (!hasAsks && !hasBids) {
                                    warnings.push({
                                        marketId,
                                        error: 'API orderbook trả về asks và bids rỗng, bỏ qua kiểm tra UI'
                                    });
                                    return;
                                }

                                // Kiểm tra sự tồn tại của orderbook-table trên UI
                                cy.get('body').then(($body) => {
                                    if ($body.find('div.orderbook-table').length === 0) {
                                        warnings.push({
                                            marketId,
                                            error: 'Phần tử orderbook-table không hiển thị trên UI, bỏ qua kiểm tra'
                                        });
                                        return;
                                    }

                                    cy.get('div.orderbook-table', { timeout: 5000 }).should('be.visible').then(() => {
                                        cy.get('div.flex.h-11.items-center.gap-3.px-2')
                                            .first()
                                            .then(($lastPriceContainer) => {
                                                if (!apiLastPrice) return;

                                                // Lấy giá trị last price chính xác từ span.text-caption.text-neutral-f6
                                                const $lastPriceTextEl = $lastPriceContainer.find('span.text-caption.text-neutral-f6');
                                                if (!$lastPriceTextEl || !$lastPriceTextEl.length) {
                                                    discrepancies.push({
                                                        marketId,
                                                        error: 'Không tìm thấy last price trên DOM (span.text-caption.text-neutral-f6)'
                                                    });
                                                    return;
                                                }

                                                const displayedLastPriceText = $lastPriceTextEl.text().trim().replace('$', '');
                                                const displayedLastPrice = parseFloat(displayedLastPriceText);
                                                const apiLastPriceNum = parseFloat(apiLastPrice);

                                                // Làm tròn đồng bộ để so sánh
                                                const displayedRounded = Number(displayedLastPrice.toFixed(5));
                                                const apiRounded = Number(apiLastPriceNum.toFixed(5));
                                                if (displayedRounded !== apiRounded) {
                                                    discrepancies.push({
                                                        marketId,
                                                        error: `Displayed last price (${displayedRounded}) khác API last price (${apiRounded})`
                                                    });
                                                }

                                                // Xác định màu của last price
                                                const $colorEl = $lastPriceContainer.find('span[class*="text-support-green-"], span[class*="text-support-pink-"]').first();
                                                if (!$colorEl || !$colorEl.length) {
                                                    discrepancies.push({
                                                        marketId,
                                                        error: `Không tìm thấy phần tử xác định màu của last price (class chứa text-support-green- hoặc text-support-pink-)`
                                                    });
                                                    return;
                                                }

                                                const colorClass = $colorEl.attr('class') || '';
                                                cy.log(`Market ${marketId}: Class của phần tử màu last price: ${colorClass}`);

                                                const isGreen = colorClass.includes('text-support-green-');
                                                const isPink = colorClass.includes('text-support-pink-');

                                                // Kiểm tra best price dựa trên màu và dữ liệu API
                                                if (isGreen) {
                                                    if (hasBids) {
                                                        cy.get('div.orderbook-table').then(($table) => {
                                                            const $bestBuyEl = $table.find('div[class*="text-support-green-"]').first();
                                                            if ($bestBuyEl.length === 0) {
                                                                discrepancies.push({
                                                                    marketId,
                                                                    error: 'Không tìm thấy best buy price trên DOM dù API có bids'
                                                                });
                                                                return;
                                                            }

                                                            cy.wrap($bestBuyEl)
                                                                .invoke('text')
                                                                .then((displayedBestBuyText) => {
                                                                    const displayedBestBuy = parseFloat(displayedBestBuyText.trim());
                                                                    if (!displayedBestBuy) {
                                                                        discrepancies.push({
                                                                            marketId,
                                                                            error: 'Không tìm thấy best buy price trên DOM dù API có bids'
                                                                        });
                                                                    } else if (displayedBestBuy > apiLastPriceNum) {
                                                                        discrepancies.push({
                                                                            marketId,
                                                                            error: `Best price buy (${displayedBestBuy}) > last price (${apiLastPriceNum}) khi last price màu xanh`
                                                                        });
                                                                    }
                                                                });
                                                        });
                                                    } else {
                                                        cy.log(`Market ${marketId}: Last price màu xanh nhưng không có bids, bỏ qua kiểm tra best buy price.`);
                                                    }
                                                } else if (isPink) {
                                                    if (hasAsks) {
                                                        cy.get('div.orderbook-table').then(($table) => {
                                                            const $bestSellEl = $table.find('div[class*="text-support-pink-"]').first();
                                                            if ($bestSellEl.length === 0) {
                                                                discrepancies.push({
                                                                    marketId,
                                                                    error: 'Không tìm thấy best sell price trên DOM dù API có asks'
                                                                });
                                                                return;
                                                            }

                                                            cy.wrap($bestSellEl)
                                                                .invoke('text')
                                                                .then((displayedBestSellText) => {
                                                                    const displayedBestSell = parseFloat(displayedBestSellText.trim());
                                                                    if (!displayedBestSell) {
                                                                        discrepancies.push({
                                                                            marketId,
                                                                            error: 'Không tìm thấy best sell price trên DOM dù API có asks'
                                                                        });
                                                                    } else if (displayedBestSell < apiLastPriceNum) {
                                                                        discrepancies.push({
                                                                            marketId,
                                                                            error: `Best price sell (${displayedBestSell}) < last price (${apiLastPriceNum}) khi last price màu hồng`
                                                                        });
                                                                    }
                                                                });
                                                        });
                                                    } else {
                                                        cy.log(`Market ${marketId}: Last price màu hồng nhưng không có asks, bỏ qua kiểm tra best sell price.`);
                                                    }
                                                } else {
                                                    discrepancies.push({
                                                        marketId,
                                                        error: `Không xác định được màu của last price (class: ${colorClass})`
                                                    });
                                                }
                                            });
                                    });
                                });
                            });
                        });
                    });
                });
            })
            .then(() => {
                const errorCount = discrepancies.length;
                const uniqueWarningMarketCount = Array.from(new Set(warnings.map((w) => w.marketId))).length;

                if (errorCount === 0 && uniqueWarningMarketCount === 0) {
                    cy.log('Không có lỗi nào, không có cảnh báo nào ở tất cả các market.');
                    return;
                }

                let msg = `Kết quả test OB: Đã xử lý ${totalMarket} market, có ${errorCount} market có lỗi.\n`;

                if (uniqueWarningMarketCount > 0) {
                    msg += `\n--- WARNING (không tính là lỗi): ${uniqueWarningMarketCount} market ---\n`;
                    warnings.forEach((w) => {
                        msg += `Market ${w.marketId}: ${w.error}\n----------------------------------------------------\n`;
                    });
                }

                if (errorCount > 0) {
                    msg += `\n--- LỖI: ${errorCount} market ---\n`;
                    discrepancies.forEach((d) => {
                        msg += `Market ${d.marketId}: ${d.error}\n----------------------------------------------------\n`;
                    });
                }

                const chunks = chunkString(msg, 1900);
                cy.wrap(chunks)
                    .each((chunk, idx, arr) => {
                        cy.task('discordNotify', `Part ${idx + 1}/${arr.length}:\n${chunk}`);
                        cy.wait(2000);
                    })
                    .then(() => {
                        if (errorCount > 0) {
                            throw new Error(msg);
                        } else {
                            cy.log('Chỉ có warning, không fail test.');
                        }
                    });
            });
    });
});