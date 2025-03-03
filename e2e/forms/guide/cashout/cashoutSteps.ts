import { CashoutPage } from './CashoutPage';

export const openCashoutDialog = () => {
    const cashoutPage = new CashoutPage();

    cashoutPage.openCashoutDialog();
};

export const step1 = () => {
    const cashoutPage = new CashoutPage();

    cashoutPage.checkDialogStep1();
    cashoutPage.checkFormStep1();
};

export const step2 = () => {
    const cashoutPage = new CashoutPage();

    cashoutPage.checkDialogStep2();
    cashoutPage.checkFormStep2();
};

export const step3 = () => {
    const cashoutPage = new CashoutPage();

    cashoutPage.checkDialogStep3();
    cashoutPage.checkFormStep3();
};

export const startCashout = () => {
    const cashoutPage = new CashoutPage();

    cashoutPage.checkStartCashout();
};

export const next = () => {
    const tradePage = new CashoutPage();

    tradePage.clickNextButton();
}

export const skip = () => {
    const tradePage = new CashoutPage();

    tradePage.clickSkipButton();
}

export const back = () => {
    const tradePage = new CashoutPage();

    tradePage.clickBackButton();
}
