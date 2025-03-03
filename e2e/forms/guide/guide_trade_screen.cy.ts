import * as tradeSteps from './trade/tradeSteps';
import * as bidSteps from './bid/bidSteps';
import * as cashoutSteps from './cashout/cashoutSteps';

describe('Flow kiểm tra "How to trade?" Dialogs', () => {
    beforeEach(() => {
        // Thiết lập viewport xLarge (min-width: 1280px)
        cy.viewport(1280, 800);

        // Truy cập trang mà không cần kết nối ví
        cy.visit('/?market_id=3041995665901');
    });

    it('Kiểm tra flow từ Step 1 đến Step 4', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.next();
        tradeSteps.step3();
        tradeSteps.next();
        tradeSteps.step4();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 1', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.skip();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 2', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.skip();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 3', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.next();
        tradeSteps.step3();
        tradeSteps.skip();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 4', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.next();
        tradeSteps.step3();
        tradeSteps.next();
        tradeSteps.step4();
        tradeSteps.skip();
    });

    it('Kiểm tra việc quay lại Step 1 từ Step 2', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.back();
        tradeSteps.step1();
    });

    it('Kiểm tra việc quay lại Step 2 từ Step 3', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.next();
        tradeSteps.step3();
        tradeSteps.back();
        tradeSteps.step2();
    });

    it('Kiểm tra việc quay lại Step 3 từ Step 4', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.next();
        tradeSteps.step3();
        tradeSteps.next();
        tradeSteps.step4();
        tradeSteps.back();
        tradeSteps.step3();
    });

    it('Kiểm tra việc ẩn dialog khi chọn start trading ở Step 4', () => {
        tradeSteps.openTradeDialog();
        tradeSteps.step1();
        tradeSteps.next();
        tradeSteps.step2();
        tradeSteps.next();
        tradeSteps.step3();
        tradeSteps.next();
        tradeSteps.step4();
        tradeSteps.startTrading();
    });
});

describe('Flow kiểm tra "How to bid?" Dialogs', () => {
    beforeEach(() => {
        // Thiết lập viewport xLarge (min-width: 1280px)
        cy.viewport(1280, 800);

        // Truy cập trang mà không cần kết nối ví
        cy.visit('/?market_id=3041995665901');
    });

    it('Kiểm tra flow từ Step 1 đến Step 3', () => {
        bidSteps.openBidDialog();
        bidSteps.step1();
        bidSteps.next();
        bidSteps.step2();
        bidSteps.next();
        bidSteps.step3();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 1', () => {
        bidSteps.openBidDialog();
        bidSteps.step1();
        bidSteps.skip();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 2', () => {
        bidSteps.openBidDialog();
        bidSteps.step1();
        bidSteps.next();
        bidSteps.step2();
        bidSteps.skip();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 3', () => {
        bidSteps.openBidDialog();
        bidSteps.step1();
        bidSteps.next();
        bidSteps.step2();
        bidSteps.next();
        bidSteps.step3();
        bidSteps.skip();
    });

    it('Kiểm tra việc quay lại Step 1 từ Step 2', () => {
        bidSteps.openBidDialog();
        bidSteps.step1();
        bidSteps.next();
        bidSteps.step2();
        bidSteps.back();
        bidSteps.step1();
    });

    it('Kiểm tra việc quay lại Step 2 từ Step 3', () => {
        bidSteps.openBidDialog();
        bidSteps.step1();
        bidSteps.next();
        bidSteps.step2();
        bidSteps.next();
        bidSteps.step3();
        bidSteps.back();
        bidSteps.step2();
    });

    it('Kiểm tra việc ẩn dialog khi chọn start bid ở Step 3', () => {
        bidSteps.openBidDialog();
        bidSteps.step1();
        bidSteps.next();
        bidSteps.step2();
        bidSteps.next();
        bidSteps.step3();
        bidSteps.startBid();
    });
});

describe('Flow kiểm tra "How to cash out?" Dialogs', () => {
    beforeEach(() => {
        // Thiết lập viewport xLarge (min-width: 1280px)
        cy.viewport(1280, 800);

        // Truy cập trang mà không cần kết nối ví
        cy.visit('/?market_id=3041995665901');
    });
    
    it('Kiểm tra flow từ Step 1 đến Step 3', () => {
        cashoutSteps.openCashoutDialog();
        cashoutSteps.step1();
        cashoutSteps.next();
        cashoutSteps.step2();
        cashoutSteps.next();
        cashoutSteps.step3();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 1', () => {
        cashoutSteps.openCashoutDialog();
        cashoutSteps.step1();
        cashoutSteps.skip();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 2', () => {
        cashoutSteps.openCashoutDialog();
        cashoutSteps.step1();
        cashoutSteps.next();
        cashoutSteps.step2();
        cashoutSteps.skip();
    });

    it('Kiểm tra việc ẩn dialog khi skip từ Step 3', () => {
        cashoutSteps.openCashoutDialog();
        cashoutSteps.step1();
        cashoutSteps.next();
        cashoutSteps.step2();
        cashoutSteps.next();
        cashoutSteps.step3();
        cashoutSteps.skip();
    });

    it('Kiểm tra việc quay lại Step 1 từ Step 2', () => {
        cashoutSteps.openCashoutDialog();
        cashoutSteps.step1();
        cashoutSteps.next();
        cashoutSteps.step2();
        cashoutSteps.back();
        cashoutSteps.step1();
    });

    it('Kiểm tra việc quay lại Step 2 từ Step 3', () => {
        cashoutSteps.openCashoutDialog();
        cashoutSteps.step1();
        cashoutSteps.next();
        cashoutSteps.step2();
        cashoutSteps.next();
        cashoutSteps.step3();
        cashoutSteps.back();
        cashoutSteps.step2();
    });

    it('Kiểm tra việc ẩn dialog khi chọn start cash out ở Step 3', () => {
        cashoutSteps.openCashoutDialog();
        cashoutSteps.step1();
        cashoutSteps.next();
        cashoutSteps.step2();
        cashoutSteps.next();
        cashoutSteps.step3();
        cashoutSteps.startCashout();
    });
});
