// cypress/e2e/api-monitor.spec.ts
describe("API Monitoring", () => {
    it("checks API response and notifies Discord on error or success", () => {
      // Intercept request đến API cần theo dõi
      cy.intercept('GET', 'https://api-dev.unich.com/trading/order/v1/markets?limit=200', (req) => {
        req.continue((res) => {
          if (res.statusCode >= 500) {
            // Gọi task để gửi thông báo Discord nếu có lỗi (status >= 500)
            cy.task("discordNotify", `API Error: Received status ${res.statusCode} for ${req.url}`);
          }
        });
      }).as("apiMonitor");
  
      // Gọi API bằng cy.request (failOnStatusCode: false để không dừng test khi gặp lỗi)
      cy.request({
        method: 'GET',
        url: 'https://api-dev.unich.com/trading/order/v1/markets?limit=200',
        failOnStatusCode: false,
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
          'cache-control': 'no-cache',
          'origin': 'https://dev.unich.com',
          'pragma': 'no-cache',
          'priority': 'u=1, i',
          'referer': 'https://dev.unich.com/',
          'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
          'x-signature': '0673798bce1001b9274c3634c295e39ad4444f54c824fc2b4ffd6e985f261958',
          'x-timestamp': '1741248601'
        }
      }).then((response) => {
        expect(response.status).to.be.lessThan(500);
        // Nếu API chạy bình thường (status < 500), gửi thông báo lên Discord =))
        if (response.status < 500) {
          cy.task("discordNotify", `API Running Normally: Received status ${response.status} for https://api-dev.unich.com/trading/order/v1/markets?limit=200`);
        }
      });
    });
  });
  