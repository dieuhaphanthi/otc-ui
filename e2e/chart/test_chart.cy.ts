/// <reference types="cypress" />

interface ChartItem {
    time: string; // Dữ liệu từ API chart là epoch dạng chuỗi (ví dụ "1678780200000")
    open: string;
    close: string;
    high: string;
    low: string;
    volume: string;
    index: number;
}

interface ErroneousItem {
    index: number;
    epochTime: number; // thời gian tính bằng ms (để so sánh)
    isoTime: string;   // để log (ví dụ "2025-03-13T23:00:00.000Z")
    open: string;
    close: string;
    high: string;
    low: string;
    volume: string;
    reason: string;
}

/**
 * Hàm chia nhỏ chuỗi để tránh vượt quá 2000 ký tự của Discord.
 * Ở đây dùng maxLength = 1900 để chừa chút dư.
 */
function chunkString(str: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < str.length) {
        chunks.push(str.slice(i, i + maxLength));
        i += maxLength;
    }
    return chunks;
}

/**
 * Hàm parse chuỗi epoch trả về mili-giây.
 * - Nếu số nhỏ hơn 1e12 (ví dụ 10 chữ số) thì coi như epoch tính theo giây → nhân 1000.
 * - Nếu không thì coi như epoch tính theo mili-giây.
 */
function parseEpoch(timeStr: string): number {
    const num = parseFloat(timeStr);
    if (isNaN(num)) {
        return NaN;
    }
    if (num < 1e12) {
        return num * 1000;
    }
    return num;
}

/**
 * Hàm tìm trade có trade_time <= chartTime và gần chartTime nhất (về phía trước).
 * Lưu ý: trade.created_at của API trade/latest có dạng ISO, nên dùng Date.parse(trade.created_at) trả về mili-giây.
 */
function findNearestTradeBefore(trades: any[], chartTime: number): any | null {
    if (!trades || trades.length === 0) return null;

    // Sắp xếp trade theo created_at tăng dần
    const sortedTrades = [...trades].sort(
        (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
    );

    let nearestTrade: any = null;
    let minTimeDiff = Infinity;

    for (const trade of sortedTrades) {
        const tradeTime = Date.parse(trade.created_at);
        // Chỉ xét trade xảy ra trước hoặc đúng chartTime
        if (tradeTime > chartTime) {
            continue;
        }
        const timeDiff = chartTime - tradeTime;
        if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            nearestTrade = trade;
        }
    }

    return nearestTrade;
}

describe('Chart API Test', () => {
    let totalMarket = 0;

    // Map: mỗi market_id → danh sách trade (API trade/latest)
    const latestTradeMap: Record<string, any[]> = {};
    // Map: mỗi market_id → Set trade_id đã được log (để tránh lặp trade_id)
    const loggedTradeIds: Record<string, Set<string>> = {};

    it('should fetch markets and test chart data for each market_id', () => {
        const allErrorMessages: string[] = []; // Mảng chứa thông báo lỗi

        // Bước 0: Truy cập trang OTC
        cy.visit('https://unich.com/en/otc');
        cy.wait(5000);

        // Bước 1: Gọi API lấy danh sách markets
        cy.request({
            method: 'GET',
            url: 'https://api.unich.com/trading/order/v1/markets?limit=200',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
                'cache-control': 'no-cache',
                'origin': 'https://unich.com',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://unich.com/',
                'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'x-signature': '37a45c47e10949214f083956033b960330169c21231ab15f7669350776fb088a',
                'x-timestamp': '1741854131'
            }
        }).then((marketsResponse) => {
            expect(marketsResponse.status).to.eq(200);
            const marketData = marketsResponse.body.data;
            const marketIds: string[] = marketData.map((m: any) => m.market_id);
            totalMarket = marketIds.length;

            cy.wait(5000);

            // Duyệt qua từng market_id
            cy.wrap(marketIds).each((marketId: string) => {
                cy.log(`Processing market_id: ${marketId}`);
                cy.wait(5000);

                // Bước 2: Gọi API trade/latest => tối đa 50 trade (dữ liệu dạng ISO)
                cy.request({
                    method: 'GET',
                    url: `https://api.unich.com/trading/order/v1/trade/latest?market_id=${marketId}`,
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
                        'cache-control': 'no-cache',
                        'origin': 'https://unich.com',
                        'pragma': 'no-cache',
                        'priority': 'u=1, i',
                        'referer': 'https://unich.com/',
                        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"macOS"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-site',
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                        'x-signature': 'bff494e8ab54cdb1dddf21f3b3d35247ad828578438b22fe9f9a8176578e2627',
                        'x-timestamp': '1741854132'
                    }
                }).then((tradeResponse) => {
                    expect(tradeResponse.status).to.eq(200);
                    const tradeData = tradeResponse.body.data;
                    if (!tradeData || tradeData.length === 0) {
                        cy.log(`No trade data found for market_id: ${marketId}`);
                        return;
                    }

                    // Sắp xếp tradeData theo created_at giảm dần
                    tradeData.sort(
                        (a: any, b: any) => Date.parse(b.created_at) - Date.parse(a.created_at)
                    );

                    // Lấy trade có created_at xa nhất và gần nhất
                    const tradeEarliest = tradeData[tradeData.length - 1]; // created_at sớm nhất
                    const tradeLatest = tradeData[0];                      // created_at muộn nhất

                    const earliestTime = Date.parse(tradeEarliest.created_at);
                    const latestTime = Date.parse(tradeLatest.created_at);

                    // Lưu lại trade
                    latestTradeMap[marketId] = tradeData;

                    // Tạo set rỗng ban đầu để đánh dấu trade_id đã log
                    loggedTradeIds[marketId] = new Set();

                    // Bước 3: Gọi API chart (dữ liệu dạng epoch)
                    cy.request({
                        method: 'GET',
                        url: `https://api.unich.com/trading/order/chart?market_id=${marketId}&coin=${tradeData[0].coin}¤cy=${tradeData[0].currency}&interval=30m&from=${earliestTime}&time=${latestTime}`,
                        headers: {
                            'accept': '*/*',
                            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
                            'origin': 'https://unich.com/',
                            'priority': 'u=1, i',
                            'referer': 'https://unich.com/',
                            'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
                            'sec-ch-ua-mobile': '?0',
                            'sec-ch-ua-platform': '"macOS"',
                            'sec-fetch-dest': 'empty',
                            'sec-fetch-mode': 'cors',
                            'sec-fetch-site': 'same-site',
                            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
                        }
                    }).then((chartResponse) => {
                        expect(chartResponse.status).to.eq(200);

                        const chartData = chartResponse.body.data;
                        // Sắp xếp chartData theo time tăng dần (cũ trước, mới sau)
                        chartData.sort(
                            (a: any, b: any) => parseEpoch(a.time) - parseEpoch(b.time)
                        );

                        // Tìm tất cả chart point lỗi
                        const erroneousItems: ErroneousItem[] = [];

                        chartData.forEach((item: ChartItem, index: number) => {
                            const epochTime = parseEpoch(item.time);
                            if (isNaN(epochTime)) {
                                // Nếu thời gian không hợp lệ, bỏ qua
                                return;
                            }

                            // Kiểm tra nếu điểm chart có OHLC giống nhau
                            const isEqualOHLC = (
                                item.open === item.close &&
                                item.close === item.high &&
                                item.high === item.low
                            );

                            const isZeroVolume = (item.volume === '0');

                            // Nếu gặp lỗi (OHLC all equal hoặc volume = 0)
                            if (isEqualOHLC || isZeroVolume) {
                                erroneousItems.push({
                                    index,
                                    epochTime, // dùng để so sánh
                                    isoTime: new Date(epochTime).toISOString(), // để log hiển thị dạng ISO
                                    open: item.open,
                                    close: item.close,
                                    high: item.high,
                                    low: item.low,
                                    volume: item.volume,
                                    reason: isEqualOHLC ? 'OHLC all equal' : 'Volume = 0'
                                });
                            }
                        });

                        // Duyệt qua từng chart point lỗi để tìm trade gần nhất (trade_time <= chartTime)
                        const tradeToChartMap: Record<string, {
                            chartItem: ErroneousItem;
                            trade: any;
                        }> = {};

                        erroneousItems.forEach((chartItem) => {
                            const matchingTrade = findNearestTradeBefore(latestTradeMap[marketId], chartItem.epochTime);
                            if (!matchingTrade) return;

                            const tradeId = matchingTrade.trade_id;
                            if (!loggedTradeIds[marketId].has(tradeId)) {
                                tradeToChartMap[tradeId] = {
                                    chartItem,
                                    trade: matchingTrade
                                };
                                loggedTradeIds[marketId].add(tradeId);
                            }
                        });

                        // Tạo thông báo lỗi từ tradeToChartMap
                        if (Object.keys(tradeToChartMap).length > 0) {
                            let msg = `\nMarket ${marketId} có ${Object.keys(tradeToChartMap).length} trade liên quan đến dữ liệu lỗi:\n`;
                            Object.values(tradeToChartMap).forEach(({ chartItem, trade }) => {
                                msg += `Trade Info: trade_id=${trade.trade_id}, trade_time=${trade.created_at}, price=${trade.price}, volume=${trade.volume}\n`;
                                msg += `  * Nearest Chart Error: [Index=${chartItem.index}, chartTime=${chartItem.isoTime}] `
                                    + `(open=${chartItem.open}, close=${chartItem.close}, high=${chartItem.high}, low=${chartItem.low}, volume=${chartItem.volume}) `
                                    + `=> reason: ${chartItem.reason}\n`;
                            });
                            allErrorMessages.push(msg);
                        }
                    });
                });
            });
        })
        .then(() => {
            if (allErrorMessages.length > 0) {
                const now = new Date();
                const formattedDate = now.toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                let finalMessage = `Kết quả test chart [${formattedDate}]: Đã test được ${totalMarket} market, trong đó ${allErrorMessages.length} market có lỗi:\n`;
                finalMessage += allErrorMessages.join('\n');

                if (finalMessage.length > 1900) {
                    const chunks = chunkString(finalMessage, 1900);
                    return chunks.reduce<Cypress.Chainable<any>>(
                        (prev: Cypress.Chainable<any>, chunk: string, idx: number, arr: string[]) => {
                            return prev.then(() => {
                                return cy.task('discordNotify', `Part ${idx + 1}/${arr.length}:\n${chunk}`)
                                    .then(() => cy.wait(2000));
                            });
                        },
                        cy.wrap(null)
                    )
                    .then(() => {
                        return cy.task('discordNotify', `Kết luận: Đã test được ${totalMarket} market, trong đó ${allErrorMessages.length} market có lỗi.`);
                    })
                    .then(() => {
                        throw new Error(`Đã gửi lỗi thành nhiều phần. Có tất cả ${allErrorMessages.length} market lỗi.`);
                    });

                } else {
                    return cy.task('discordNotify', finalMessage)
                        .then(() => {
                            return cy.task('discordNotify', `Kết luận: Đã test được ${totalMarket} market, trong đó ${allErrorMessages.length} market có lỗi.`);
                        })
                        .then(() => {
                            throw new Error(finalMessage);
                        });
                }
            } else {
                cy.log('Không tìm thấy lỗi ở bất kỳ market nào.');
            }
        });
    });
});
