describe('Flow kiểm tra "How to trade?" Dialogs', () => {
    beforeEach(() => {
      // Thiết lập viewport xLarge (min-width: 1280px)
      cy.viewport(1280, 800);
  
      // Truy cập trang mà không cần kết nối ví
      cy.visit('/?market_id=3041995665901');
    });
  
    it('Kiểm tra flow từ Step 1 đến Step 4', () => {
      // Bước 1: Click vào button "How to trade?" để mở dialog Step 1
      cy.contains('button', 'How to trade?').click();
  
      // Kiểm tra dialog Step 1 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
  
      // Thêm thời gian chờ để modal có thể cập nhật nội dung
      cy.wait(1000); // Chờ lâu hơn để phần tử được load hoàn toàn
  
      // Kiểm tra nội dung trong dialog Step 1
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'First, to get started, choose type of order, buy or sell');
  
      // Kiểm tra button Buy và Sell có thể click
      cy.get('#trade-buy-sell-group-button button').contains('Buy').should('not.be.disabled');
      cy.get('#trade-buy-sell-group-button button').contains('Sell').should('not.be.disabled');
  
      // Bước 1.2: Click vào button Skip trong Step 1, dialog sẽ ẩn
      cy.contains('a', 'Skip').click();
      cy.get('div[aria-modal="true"]').should('not.exist');
  
      // Bước 2: Click lại vào button "How to trade?" để mở dialog Step 1
      cy.contains('button', 'How to trade?').click();
  
      // Kiểm tra dialog Step 1 hiển thị lại
      cy.get('div[aria-modal="true"]').should('be.visible');
      
      // Kiểm tra nội dung trong dialog Step 1
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'First, to get started, choose type of order, buy or sell');
      
      // Bước 1.3: Click vào button Next trong Step 1 để mở dialog Step 2
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 2 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Second, enter the price at which you want to buy or sell');
  
      // Kiểm tra label và input cho Price là fillable
      cy.get('#trade-price-input input').should('be.visible').and('not.be.disabled');
  
      // Bước 2.2: Click vào button Skip trong Step 2, dialog sẽ ẩn
      cy.contains('a', 'Skip').click();
      cy.get('div[aria-modal="true"]').should('not.exist');
  
      // Bước 3: Click lại vào button "How to trade?" để mở dialog Step 1
      cy.contains('button', 'How to trade?').click();
  
      // Kiểm tra dialog Step 1 hiển thị lại
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'First, to get started, choose type of order, buy or sell');
      
      // Bước 3.1: Click vào Next trong Step 1 để mở dialog Step 2
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 2 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Second, enter the price at which you want to buy or sell');
  
      // Bước 3.2: Click vào Next trong Step 2 để mở dialog Step 3
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 3 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Set the amount you want to buy or sell. Importantly, you need to transfer collateral equal to 50% of the volume.');
  
      // Kiểm tra label và input cho Amount và Collateral là fillable
      cy.get('#trade-amount-and-collateral-input input').first().should('be.visible').and('not.be.disabled');
      cy.get('#trade-amount-and-collateral-input input').eq(1).should('be.visible').and('not.be.disabled');
  
      // Kiểm tra progress bar ở trạng thái disabled
      cy.get('span[aria-disabled="true"]').should('be.visible');
  
      // Bước 3.3: Click vào Next trong Step 3 để mở dialog Step 4
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 4 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Connect to the correct network and make sure you have enough collateral to place the order');
  
      // Kiểm tra button Connect wallet có thể click
      cy.get('#trade-connect-wallet button').should('not.be.disabled');

      // Bước 4.2: Click vào button Skip trong Step 4, dialog sẽ ẩn
      cy.contains('a', 'Skip').click();
      cy.get('div[aria-modal="true"]').should('not.exist');

      // Bước 2: Click lại vào button "How to trade?" để mở dialog Step 1
      cy.contains('button', 'How to trade?').click();
  
      // Kiểm tra dialog Step 1 hiển thị lại
      cy.get('div[aria-modal="true"]').should('be.visible');
      
      // Kiểm tra nội dung trong dialog Step 1
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'First, to get started, choose type of order, buy or sell');
      
      // Bước 1.3: Click vào button Next trong Step 1 để mở dialog Step 2
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 2 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Second, enter the price at which you want to buy or sell');
  
      // Kiểm tra label và input cho Price là fillable
      cy.get('#trade-price-input input').should('be.visible').and('not.be.disabled');
  
      // Bước 2.2: Click vào button Skip trong Step 2, dialog sẽ ẩn
      cy.contains('a', 'Skip').click();
      cy.get('div[aria-modal="true"]').should('not.exist');
  
      // Bước 3: Click lại vào button "How to trade?" để mở dialog Step 1
      cy.contains('button', 'How to trade?').click();
  
      // Kiểm tra dialog Step 1 hiển thị lại
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'First, to get started, choose type of order, buy or sell');
      
      // Bước 3.1: Click vào Next trong Step 1 để mở dialog Step 2
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 2 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Second, enter the price at which you want to buy or sell');
  
      // Bước 3.2: Click vào Next trong Step 2 để mở dialog Step 3
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 3 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Set the amount you want to buy or sell. Importantly, you need to transfer collateral equal to 50% of the volume.');
  
      // Kiểm tra label và input cho Amount và Collateral là fillable
      cy.get('#trade-amount-and-collateral-input input').first().should('be.visible').and('not.be.disabled');
      cy.get('#trade-amount-and-collateral-input input').eq(1).should('be.visible').and('not.be.disabled');
  
      // Kiểm tra progress bar ở trạng thái disabled
      cy.get('span[aria-disabled="true"]').should('be.visible');
  
      // Bước 3.3: Click vào Next trong Step 3 để mở dialog Step 4
      cy.contains('button', 'Next').click();
  
      // Kiểm tra dialog Step 4 hiển thị
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Connect to the correct network and make sure you have enough collateral to place the order');
  
      // Bước 4.3: Click vào Return button trong Step 4, quay về Step 3
      cy.get('button[aria-label="Back"]').click();
      cy.get('div[aria-modal="true"]').should('be.visible');
      cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Set the amount you want to buy or sell. Importantly, you need to transfer collateral equal to 50% of the volume.');

      // Bước 3.3: Click vào Next trong Step 3 để mở dialog Step 4
      cy.contains('button', 'Next').click();
  
      // Bước 4.5: Click vào button Start trading trong Step 4, dialog sẽ ẩn
      cy.get('button').contains('Start trading').click();
      cy.get('div[aria-modal="true"]').should('not.exist');
    });
  });
