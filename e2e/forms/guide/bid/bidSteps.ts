import { BidPage } from './BidPage';

export const openBidDialog = () => {
    const bidPage = new BidPage();

    bidPage.openBidDialog();
};

export const step1 = () => {
    const bidPage = new BidPage();

    bidPage.checkDialogStep1();
    bidPage.checkFormStep1();
};

export const step2 = () => {
    const bidPage = new BidPage();

    bidPage.checkDialogStep2();
    bidPage.checkFormStep2();
};

export const step3 = () => {
    const bidPage = new BidPage();

    bidPage.checkDialogStep3();
    bidPage.checkFormStep3();
};

export const startBid = () => {
    const bidPage = new BidPage();

    bidPage.checkStartBid();
};

export const next = () => {
    const bidPage = new BidPage();

    bidPage.clickNextButton();
}

export const skip = () => {
    const bidPage = new BidPage();

    bidPage.clickSkipButton();
}

export const back = () => {
    const bidPage = new BidPage();

    bidPage.clickBackButton();
}
