// project_bar.cy.ts

describe('OTC Market UI Validation', () => {
  // Mảng lưu trữ lỗi "soft" để báo cáo cuối cùng
  const softErrors: string[] = [];

  // Biến toàn cục để lưu mảng market trả về từ API
  let marketsData: any[] = [];

  before(() => {
    // Thiết lập viewport xLarge (min-width: 1280px)
    cy.viewport(1280, 800);

    // Chặn request API lấy markets
    cy.intercept('GET', 'https://api.unich.com/trading/order/v1/markets?limit=200').as('getMarkets');
    cy.visit('https://unich.com/en/otc');

    // Đợi API trả về và lưu dữ liệu vào biến cục bộ
    cy.wait('@getMarkets').then((interception) => {
      const body = interception.response?.body;
      expect(body).to.be.an('object');
      expect(body.data).to.be.an('array');
      marketsData = body.data;
    });
  });

  it('Validates each market data with soft asserts', () => {
    marketsData.forEach((market) => {
      const marketId = market.market_id;
      const pairState = market.pair_state;

      // Định dạng total_volume (2 chữ số thập phân, định dạng en-US)
      const formattedVolume = parseFloat(market.total_volume)
        .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Định dạng current_price (5 chữ số thập phân)
      const formattedPrice = parseFloat(market.mini_ticker_day.current_price).toFixed(5);

      cy.log(`Validating market ${marketId}`);

      // Truy cập URL market, rồi chờ 5s để UI kịp render
      cy.visit(`https://unich.com/en/otc?market_id=${marketId}`);
      cy.wait(5000);

      // 1) Kiểm tra nhãn "Closed" nếu pair_state = "CLOSED_TRADE"
      if (pairState === 'CLOSED_TRADE') {
        cy.get(
          'div.inline-flex.items-center.rounded-full.border-transparent.transition-colors.' +
          'focus\\:outline-none.focus\\:ring-2.focus\\:ring-ring.focus\\:ring-offset-2.' +
          'bg-neutral-95.text-neutral-5.px-2.py-1.text-bo5'
        ).then(($el) => {
          try {
            expect($el.text()).to.contain('Closed');
          } catch (error) {
            // Lưu lỗi, không throw => test không dừng
            const msg = `Market ${marketId} - Closed check failed: ${String(error)}`;
            cy.log(msg);
            softErrors.push(msg);
          }
        });
      }

      // 2) Kiểm tra Total volume (USDC)
      cy.get('div.sm\\:flex, div.md\\:hidden.sm\\:flex', { timeout: 10000 })
        .contains('p.text-nowrap.text-caption.text-neutral-f2', 'Total volume (USDC)')
        .siblings('div.text-caption.text-neutral-f1')
        .filter(':visible')
        .invoke('text')
        .then((uiVolume) => {
          try {
            expect(uiVolume.trim()).to.eq(formattedVolume);
          } catch (error) {
            const msg = `Market ${marketId} - Volume check failed: ${String(error)}`;
            cy.log(msg);
            softErrors.push(msg);
          }
        });

      // 3) Kiểm tra current_price
      cy.get('p.sm\\:hidden.text-support-pink-50, p.text-support-pink-50', { timeout: 10000 })
        .filter(':visible')
        .invoke('text')
        .then((uiPrice) => {
          try {
            expect(uiPrice.trim()).to.eq(formattedPrice);
          } catch (error) {
            const msg = `Market ${marketId} - Current price check failed: ${String(error)}`;
            cy.log(msg);
            softErrors.push(msg);
          }
        });
    });
  });

  // Cuối cùng, nếu có bất kỳ lỗi nào, quăng lỗi để test fail
  after(() => {
    if (softErrors.length > 0) {
      throw new Error(
        'Found ' + softErrors.length + ' soft assertion error(s):\n' + softErrors.join('\n')
      );
    }
  });
});
