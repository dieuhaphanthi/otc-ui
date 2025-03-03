export class BidPage {
    // Mở dialog "How to bid?"
    openBidDialog() {
        cy.contains('button', 'Bid').click();
        cy.contains('button', 'How to bid?').click();
    }

    // Kiểm tra sự xuất hiện của dialog step 1
    checkDialogStep1() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Your bid offer will be matched with open buy or sell orders depending on which side you select.');
    }

    // Kiểm tra phần tử form tương ứng step 1
    checkFormStep1() {
        // Kiểm tra button Buy và Sell có thể click
        cy.get('#bid-buy-sell-group-button button').contains('Buy').should('not.be.disabled');
        cy.get('#bid-buy-sell-group-button button').contains('Sell').should('not.be.disabled');
    }

    // Kiểm tra sự xuất hiện của dialog step 2
    checkDialogStep2() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Your bid offer will have more chances of being matched if:');

        // Kiểm tra nội dung trong ul (các điều kiện của bid)
        cy.get('ul').should('contain.text', 'You set a price lower than the recommended price for buy order');
        cy.get('ul').should('contain.text', 'You set a price higher than the recommended price for sell order');
    
    }

    // Kiểm tra phần tử form tương ứng step 2
    checkFormStep2() {
        // Kiểm tra label và input cho Bid price là fillable
        cy.get('#bid-price-input input').should('be.visible').and('not.be.disabled');
    }

    // Kiểm tra sự xuất hiện của dialog step 3
    checkDialogStep3() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Set amount you want to bid and confirm the collateral before hitting the “Bid”');
    }

    // Kiểm tra phần tử form tương ứng step 3
    checkFormStep3() {
        // Kiểm tra label và input cho Amount và Collateral là fillable
        cy.get('#bid-amount-collateral-input input').first().should('be.visible').and('not.be.disabled');
        cy.get('#bid-amount-collateral-input input').eq(1).should('be.visible').and('not.be.disabled');

        // Kiểm tra progress bar ở trạng thái disabled
        cy.get('span[aria-disabled="true"]').should('be.visible');
    }

    // Kiểm tra việc click vào button Start bid trong Step 3, dialog sẽ ẩn
    checkStartBid() {
        cy.get('button').contains('Start bid').click();
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
