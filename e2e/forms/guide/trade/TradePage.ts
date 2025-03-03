export class TradePage {
    // Mở dialog "How to trade?"
    openTradeDialog() {
        cy.contains('button', 'How to trade?').click();
    }

    // Kiểm tra sự xuất hiện của dialog step 1
    checkDialogStep1() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'First, to get started, choose type of order, buy or sell');
    }

    // Kiểm tra phần tử form tương ứng step 1
    checkFormStep1() {
        // Kiểm tra button Buy và Sell có thể click
        cy.get('#trade-buy-sell-group-button button').contains('Buy').should('not.be.disabled');
        cy.get('#trade-buy-sell-group-button button').contains('Sell').should('not.be.disabled');
    }

    // Kiểm tra sự xuất hiện của dialog step 2
    checkDialogStep2() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Second, enter the price at which you want to buy or sell');
    }

    // Kiểm tra phần tử form tương ứng step 2
    checkFormStep2() {
        // Kiểm tra label và input cho Price là fillable
        cy.get('#trade-price-input input').should('be.visible').and('not.be.disabled');
    }

    // Kiểm tra sự xuất hiện của dialog step 3
    checkDialogStep3() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Set the amount you want to buy or sell. Importantly, you need to transfer collateral equal to 50% of the volume.');
    }

    // Kiểm tra phần tử form tương ứng step 3
    checkFormStep3() {
        // Kiểm tra label và input cho Amount và Collateral là fillable
        cy.get('#trade-amount-and-collateral-input input').first().should('be.visible').and('not.be.disabled');
        cy.get('#trade-amount-and-collateral-input input').eq(1).should('be.visible').and('not.be.disabled');

        // Kiểm tra progress bar ở trạng thái disabled
        cy.get('span[aria-disabled="true"]').should('be.visible');
    }

    // Kiểm tra sự xuất hiện của dialog step 4
    checkDialogStep4() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Connect to the correct network and make sure you have enough collateral to place the order');
    }

    // Kiểm tra phần tử form tương ứng step 4
    checkFormStep4() {
        // Kiểm tra button Connect wallet có thể click
        cy.get('#trade-connect-wallet button').should('not.be.disabled');
    }

    // Kiểm tra việc click vào button Start trading trong Step 4, dialog sẽ ẩn
    checkStartTrading() {
        cy.get('button').contains('Start trading').click();
        cy.get('div[aria-modal="true"]').should('not.exist');
    }

    // Nhấn nút Next để tiếp tục qua các step
    clickNextButton() {
        cy.contains('button', 'Next').click();
    }

    // Nhấn nút Skip để ẩn dialog
    clickSkipButton() {
        cy.contains('a', 'Skip').click();
        cy.get('div[aria-modal="true"]').should('not.exist');
    }

    // Nhấn nút Back để quay lại step trước đó
    clickBackButton() {
        cy.get('button[aria-label="Back"]').click();
    }
}
