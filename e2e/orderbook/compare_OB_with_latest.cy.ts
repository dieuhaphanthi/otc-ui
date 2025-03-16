/// <reference types="cypress" />

interface Discrepancy {
    marketId: string;
    error: string;
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
  
  // Header mẫu
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
    'x-timestamp': '1741961944'
  };
  
  const tradeLatestHeaders = {
    ...commonHeaders,
    'x-signature': 'd865a8773e682085aad492d1c308f47c17c900b5b4df82e77d4c29f1c82a4b4f',
    'x-timestamp': '1741962897'
  };
  
  const orderbookHeaders = {
    ...commonHeaders,
    'x-signature': 'bf5602b2f6abcb45547b9fd3c6dfa030b3dd47d61b959cc58ba00b33ce94bfc3',
    'x-timestamp': '1741962897'
  };
  
  describe('Compare Orderbook with Latest Trade', () => {
    let totalMarket = 0;
    // Mảng lưu lỗi (đếm là lỗi)
    const discrepancies: Discrepancy[] = [];
    // Mảng lưu cảnh báo (không đếm là lỗi)
    const warnings: Discrepancy[] = [];
  
    it('should compare last price and best price between API and DOM', () => {
      // 1. Viewport & visit
      cy.viewport('macbook-16');
      cy.visit('https://unich.com/en/otc');
      cy.wait(5000);
  
      // 2. Lấy danh sách market
      cy.request({
        method: 'GET',
        url: 'https://api.unich.com/trading/order/v1/markets?limit=200',
        headers: marketsHeaders
      }).then((response) => {
        expect(response.status).to.eq(200);
        const marketData = response.body.data;
        const marketIds: string[] = marketData.map((m: any) => m.market_id);
        totalMarket = marketIds.length;
  
        cy.wrap(marketIds).each((marketId: string) => {
          cy.log(`Đang xử lý market_id: ${marketId}`);
          cy.visit(`https://unich.com/en/otc?market_id=${marketId}`);
          cy.wait(2000);
  
          // 3. API trade/latest
          cy.request({
            method: 'GET',
            url: `https://api.unich.com/trading/order/v1/trade/latest?market_id=${marketId}`,
            headers: tradeLatestHeaders
          }).then((tradeResp) => {
            expect(tradeResp.status).to.eq(200);
            const tradeData = tradeResp.body.data;
            const apiLastPrice = tradeData && tradeData.length > 0 ? tradeData[0].price : null;
            if (!apiLastPrice) {
              // => TH này ta coi là warning
              warnings.push({
                marketId,
                error: 'Không có dữ liệu từ API trade/latest'
              });
              return; // dừng không kiểm tra tiếp
            }
  
            // 4. API orderbook
            cy.request({
              method: 'GET',
              url: `https://api.unich.com/trading/order/orderbook/v1?take=30&precision=0.00000001&market_id=${marketId}`,
              headers: orderbookHeaders
            }).then((obResp) => {
              expect(obResp.status).to.eq(200);
              const obData = obResp.body.data;
              const bestSellPrice = obData?.asks?.[0]?.price || null;
              const bestBuyPrice = obData?.bids?.[0]?.price || null;
  
              if (!bestSellPrice || !bestBuyPrice) {
                // => TH này ta coi là warning
                warnings.push({
                  marketId,
                  error: 'Không có dữ liệu từ API orderbook'
                });
                return;
              }
  
              // 5. Lấy last price trên DOM
              cy.get('div.flex.h-11.items-center.gap-3.px-2')
                .first()
                .then(($lastPriceContainer) => {
                  const $lastPriceEl = $lastPriceContainer.find(
                    'span.text-support-green-40, span.text-support-pink-40'
                  ).first();
  
                  if (!$lastPriceEl || !$lastPriceEl.length) {
                    // => TH này ta coi là lỗi logic
                    discrepancies.push({
                      marketId,
                      error: 'Không tìm thấy last price trên DOM'
                    });
                    return;
                  }
  
                  const displayedLastPriceText = $lastPriceEl.text().trim();
                  const displayedLastPrice = parseFloat(displayedLastPriceText);
                  const apiLastPriceNum = parseFloat(apiLastPrice);
  
                  // So sánh (có thể dùng toFixed(8) nếu muốn, ví dụ):
                  const displayedRounded = Number(displayedLastPrice.toFixed(8));
                  const apiRounded = Number(apiLastPriceNum.toFixed(8));
                  if (displayedRounded !== apiRounded) {
                    discrepancies.push({
                      marketId,
                      error: `Displayed last price (${displayedRounded}) khác API last price (${apiRounded})`
                    });
                  }
  
                  // 9 & 10: Xác định màu
                  const isGreen = $lastPriceEl.hasClass('text-support-green-40');
                  const isPink = $lastPriceEl.hasClass('text-support-pink-40');
  
                  if (isGreen) {
                    // Màu xanh => best price buy <= last price
                    if (parseFloat(bestBuyPrice) > apiLastPriceNum) {
                      discrepancies.push({
                        marketId,
                        error: `Best price buy (${bestBuyPrice}) > last price (${apiLastPrice}) khi last price màu xanh`
                      });
                    }
  
                    cy.get('div.orderbook-table')
                      .find('div[class*="text-support-green-30"]')
                      .first()
                      .invoke('text')
                      .then((displayedBestBuyText) => {
                        const displayedBestBuy = parseFloat(displayedBestBuyText.trim());
                        if (displayedBestBuy !== parseFloat(bestBuyPrice)) {
                          discrepancies.push({
                            marketId,
                            error: `Displayed best price buy (${displayedBestBuyText.trim()}) khác API best price buy (${bestBuyPrice})`
                          });
                        }
                      });
                  } else if (isPink) {
                    // Màu hồng => best price sell >= last price
                    if (parseFloat(bestSellPrice) < apiLastPriceNum) {
                      discrepancies.push({
                        marketId,
                        error: `Best price sell (${bestSellPrice}) < last price (${apiLastPrice}) khi last price màu hồng`
                      });
                    }
  
                    cy.get('div.orderbook-table')
                      .find('div[class*="text-support-pink-30"]')
                      .first()
                      .invoke('text')
                      .then((displayedBestSellText) => {
                        const displayedBestSell = parseFloat(displayedBestSellText.trim());
                        if (displayedBestSell !== parseFloat(bestSellPrice)) {
                          discrepancies.push({
                            marketId,
                            error: `Displayed best price sell (${displayedBestSellText.trim()}) khác API best price sell (${bestSellPrice})`
                          });
                        }
                      });
                  } else {
                    discrepancies.push({
                      marketId,
                      error: 'Không xác định được màu của last price (không phải xanh/hồng)'
                    });
                  }
                });
            });
          });
        });
      })
        .then(() => {
          // Tổng hợp kết quả
          const errorCount = discrepancies.length; // Số lỗi thực sự
          const warningCount = warnings.length;    // Số warning
  
          // Nếu không có lỗi & không có warning
          if (errorCount === 0 && warningCount === 0) {
            cy.log('Không có lỗi nào, không có cảnh báo nào ở tất cả các market.');
            return;
          }
  
          // Tạo message chung
          let msg = `Kết quả test OB: Đã xử lý ${totalMarket} market, có ${errorCount} market có lỗi.\n`;
          
          // Thêm warning (nếu có)
          if (warningCount > 0) {
            msg += `\n--- WARNING (không tính là lỗi) : ${warningCount} market ---\n`;
            warnings.forEach((w) => {
              msg += `Market ${w.marketId}: ${w.error}\n----------------------------------------------------\n`;
            });
          }
  
          // Thêm discrepancies (lỗi) (nếu có)
          if (errorCount > 0) {
            msg += `\n--- LỖI: ${errorCount} market ---\n`;
            discrepancies.forEach((d) => {
              msg += `Market ${d.marketId}: ${d.error}\n----------------------------------------------------\n`;
            });
          }
  
          // Gửi notify
          const chunks = chunkString(msg, 1900);
          cy.wrap(chunks)
            .each((chunk, idx, arr) => {
              cy.task('discordNotify', `Part ${idx + 1}/${arr.length}:\n${chunk}`);
              cy.wait(2000);
            })
            .then(() => {
              // Nếu có lỗi => fail test
              if (errorCount > 0) {
                throw new Error(msg);
              } else {
                // Không có lỗi, chỉ có warning => pass test
                cy.log('Chỉ có warning, không fail test.');
              }
            });
        });
    });
  });
  