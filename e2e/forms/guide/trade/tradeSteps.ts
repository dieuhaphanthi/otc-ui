import { TradePage } from './TradePage';

export const openTradeDialog = () => {
    const tradePage = new TradePage();

    tradePage.openTradeDialog();
};

export const step1 = () => {
    const tradePage = new TradePage();

    tradePage.checkDialogStep1();
    tradePage.checkFormStep1();
};

export const step2 = () => {
    const tradePage = new TradePage();

    tradePage.checkDialogStep2();
    tradePage.checkFormStep2();
};

export const step3 = () => {
    const tradePage = new TradePage();

    tradePage.checkDialogStep3();
    tradePage.checkFormStep3();
};

export const step4 = () => {
    const tradePage = new TradePage();

    tradePage.checkDialogStep4();
    tradePage.checkFormStep4();
};

export const startTrading = () => {
    const tradePage = new TradePage();

    tradePage.checkStartTrading();
};

export const next = () => {
    const tradePage = new TradePage();

    tradePage.clickNextButton();
}

export const skip = () => {
    const tradePage = new TradePage();

    tradePage.clickSkipButton();
}

export const back = () => {
    const tradePage = new TradePage();

    tradePage.clickBackButton();
}
