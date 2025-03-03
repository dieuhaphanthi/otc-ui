export class CashoutPage {
    // Mở dialog "How to cash out?"
    openCashoutDialog() {
        cy.contains('button', 'Cashout').click();
        cy.contains('button', 'How to cash out?').click();
    }

    // Kiểm tra sự xuất hiện của dialog step 1
    checkDialogStep1() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'To place an cashout order, at first, choose type of order you want to cash out');
    }

    // Kiểm tra phần tử form tương ứng step 1
    checkFormStep1() {
        // Kiểm tra button Buy Order và Sell Order có thể click
        cy.get('#cashout-buy-sell-group-button button').contains('Buy Order').should('not.be.disabled');
        cy.get('#cashout-buy-sell-group-button button').contains('Sell Order').should('not.be.disabled');
    }

    // Kiểm tra sự xuất hiện của dialog step 2
    checkDialogStep2() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Enter the amount of credit you want to cash out');
    }

    // Kiểm tra phần tử form tương ứng step 2
    checkFormStep2() {
        // Kiểm tra label và input cho Bid price là fillable
        cy.get('#cash-out-input-amount input').should('be.visible').and('not.be.disabled');
    }

    // Kiểm tra sự xuất hiện của dialog step 3
    checkDialogStep3() {
        cy.get('div[aria-modal="true"]').should('be.visible');
        cy.get('div[aria-modal="true"]').find('p').should('contain.text', 'Check the amount you will receive after cashout, then click “Cash out” to submit the order');
    }

    // Kiểm tra phần tử form tương ứng step 3
    checkFormStep3() {
        // Kiểm tra hiển thị mục Receive
        cy.get('#cash-out-receive-amount').should('be.visible');
    }

    // Kiểm tra việc click vào button Start cashout trong Step 3, dialog sẽ ẩn
    checkStartCashout() {
        cy.get('button').contains('Start cashout').click();
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
