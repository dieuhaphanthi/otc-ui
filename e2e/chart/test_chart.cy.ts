/// <reference types="cypress" />

/**
 ** Hàm chia nhỏ chuỗi để tránh vượt quá 2000 ký tự của Discord.
 ** Ở đây dùng maxLength = 1900 để chừa chút dư.
 */
function chunkString(str: string, maxLength: number) {
    const chunks: string[] = [];
    let i = 0;
    while (i < str.length) {
        chunks.push(str.slice(i, i + maxLength));
        i += maxLength;
    }
    return chunks;
}

describe('Chart API Test', () => {
    // Biến toàn cục để lưu số lượng market được test
    let totalMarket = 0;

    it('should fetch markets and test chart data for each market_id', () => {
        // Mảng chứa message lỗi của tất cả market
        const allErrorMessages: string[] = [];

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
            // Lấy tất cả market_id và lưu số lượng
            const marketIds: string[] = marketData.map((m: any) => m.market_id);
            totalMarket = marketIds.length;

            cy.wait(5000);

            // Duyệt qua từng market_id
            cy.wrap(marketIds).each((marketId) => {
                cy.log(`Processing market_id: ${marketId}`);
                cy.wait(5000);

                // Bước 2: Gọi API trade/latest
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

                    // Lấy giao dịch đầu tiên
                    const firstTrade = tradeData[0];
                    const { created_at, coin, currency } = firstTrade;

                    // Tính from, time
                    const createdAtMs = Date.parse(created_at);
                    const sixPoint25DaysMs = 6.25 * 24 * 60 * 60 * 1000; // 6.25 ngày
                    const from = createdAtMs - sixPoint25DaysMs;
                    const time = createdAtMs;

                    cy.wait(5000);

                    // Bước 3: Gọi API chart (take=300)
                    cy.request({
                        method: 'GET',
                        url: `https://api.unich.com/trading/order/chart?market_id=${marketId}&coin=${coin}&currency=${currency}&interval=30m&from=${from}&time=${time}&take=300`,
                        headers: {
                            'accept': '*/*',
                            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
                            'origin': 'https://unich.com',
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

                        // Mảng chartData
                        const chartData = chartResponse.body.data;

                        // Sắp xếp chartData theo time giảm dần (mới nhất trước)
                        chartData.sort((a: any, b: any) => parseFloat(b.time) - parseFloat(a.time));

                        const limit = Math.min(300, chartData.length);

                        // Mảng chứa các item lỗi
                        const erroneousItems: {
                            index: number;
                            time: string;
                            open: string;
                            close: string;
                            high: string;
                            low: string;
                            volume: string;
                            reason: string;
                        }[] = [];

                        for (let i = 0; i < limit; i++) {
                            const item = chartData[i];

                            // Parse sang number để so sánh chính xác
                            const openVal = parseFloat(item.open);
                            const closeVal = parseFloat(item.close);
                            const highVal = parseFloat(item.high);
                            const lowVal = parseFloat(item.low);
                            const volumeVal = parseFloat(item.volume);

                            // Kiểm tra OHLC all equal (với epsilon)
                            const epsilon = 1e-12;
                            const isEqualOHLC =
                                Math.abs(openVal - closeVal) < epsilon &&
                                Math.abs(closeVal - highVal) < epsilon &&
                                Math.abs(highVal - lowVal) < epsilon;

                            // Kiểm tra volume = 0
                            const isZeroVolume = (volumeVal === 0);

                            if (isEqualOHLC || isZeroVolume) {
                                erroneousItems.push({
                                    index: i,
                                    time: item.time,
                                    open: item.open,
                                    close: item.close,
                                    high: item.high,
                                    low: item.low,
                                    volume: item.volume,
                                    reason: isEqualOHLC ? 'OHLC all equal' : 'Volume = 0'
                                });
                            }
                        }

                        // Nếu có lỗi, gom vào allErrorMessages
                        if (erroneousItems.length > 0) {
                            let msg = `\nMarket ${marketId} có ${erroneousItems.length} điểm dữ liệu lỗi:\n`;
                            erroneousItems.forEach((errItem) => {
                                msg += `- [Index=${errItem.index}, time=${errItem.time}] `
                                    + `(open=${errItem.open}, close=${errItem.close}, high=${errItem.high}, low=${errItem.low}, volume=${errItem.volume}) `
                                    + `=> reason: ${errItem.reason}\n`;
                            });
                            allErrorMessages.push(msg);
                        }
                    });
                });
            });
        })
            .then(() => {
                // Khi đã duyệt xong tất cả market_id
                if (allErrorMessages.length > 0) {
                    // Lấy thời gian hiện tại và định dạng (ngày/tháng/năm, giờ:phút)
                    const now = new Date();
                    const formattedDate = now.toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    // Gộp toàn bộ lỗi thành 1 chuỗi với câu kết luận bao gồm số market đã test và số market có lỗi
                    let finalMessage = `Kết quả test chart [${formattedDate}]: Đã test được ${totalMarket} market, trong đó ${allErrorMessages.length} market có lỗi:\n`;
                    finalMessage += allErrorMessages.join('\n');

                    if (finalMessage.length > 1900) {
                        const chunks = chunkString(finalMessage, 1900);

                        // Gửi từng chunk tuần tự, chờ 2 giây giữa mỗi chunk
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
                                // Sau khi gửi xong hết các chunk, gửi thêm câu kết luận bổ sung
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
