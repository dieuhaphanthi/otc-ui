describe('Trade Page - Wallet Connected State & UI Tests', () => {
    // Đảm bảo trạng thái ví được tái sử dụng giữa các test case
    beforeEach(() => {
        // Thiết lập viewport xLarge (min-width: 1280px)
        cy.viewport(1280, 800);
        // Truy cập trang mà không cần kết nối ví
        cy.visit('/?market_id=3041995665901');
    });

    // Kiểm tra xem ví đã được kết nối chưa
    // it('Kiểm tra trạng thái ví đã connect', () => {
    //   // Kiểm tra xem địa chỉ ví có hiển thị đúng trong UI không
    //   cy.contains('2Nqozfmag5GxoPS3Wc9JvRnixgLDBcgmcaMrR8soqrGn').should('be.visible');

    //   // Kiểm tra rằng nút 'Buy' đã được kích hoạt (do đã kết nối ví)
    //   cy.get('button').contains('Buy').should('not.be.disabled');
    // });

    // Kiểm tra các thuộc tính CSS của UI
    it('Kiểm tra tab list và các tab', () => {
        // Tab list phải có role="tablist" và aria-orientation="horizontal"
        cy.get('[role="tablist"]')
            .should('exist')
            .and('have.attr', 'aria-orientation', 'horizontal');

        // Kiểm tra tab "Trade" (active)
        cy.contains('[role="tab"]', 'Trade')
            .should('be.visible')
            // Ví dụ: kiểm tra màu nền của tab active (giá trị mẫu, thay đổi theo design)
            .and('have.css', 'background-color', 'rgb(245, 245, 245)')
            // Kiểm tra font-size và font-weight (giá trị mẫu)
            .and('have.css', 'font-size', '16px')
            .and('have.css', 'font-weight', '700');

        // Kiểm tra tab "Bid" (inactive)
        cy.contains('[role="tab"]', 'Bid')
            .should('be.visible')
            .and('have.attr', 'aria-selected', 'false');

        // Kiểm tra tab "Cashout" (inactive) và có badge "New"
        cy.contains('[role="tab"]', 'Cashout')
            .should('be.visible')
            .and('have.attr', 'aria-selected', 'false')
            .within(() => {
                cy.get('div')
                    .should('contain.text', 'New')
                    // Kiểm tra màu của badge (ví dụ)
                    .and('have.css', 'background-color', 'rgb(255, 230, 230)');
            });
    });

    it('Kiểm tra nhóm nút "Buy" / "Sell"', () => {
        cy.get('#trade-buy-sell-group-button')
            .should('exist')
            .and('be.visible')
            .and('have.css', 'display', 'inline-flex')
            .within(() => {
                // Nút "Buy"
                cy.contains('button', 'Buy')
                    .should('be.visible')
                    // Kiểm tra màu nền, ví dụ: bg-support-green-40 (mẫu giá trị)
                    .and('have.css', 'background-color', 'rgb(0, 128, 0)')
                    .and('have.css', 'border-radius', '128px');
                // Nút "Sell"
                cy.contains('button', 'Sell')
                    .should('be.visible')
                    .and('have.css', 'color', 'rgb(102, 102, 102)'); // ví dụ giá trị của text-neutral-f2
            });
    });

    it('Kiểm tra phần Price', () => {
        cy.get('#trade-price-input').within(() => {
            // Label "Price" (thẻ span) có màu text-neutral-f2
            cy.contains('span', 'Price')
                .should('be.visible')
                .and('have.css', 'color', 'rgb(102, 102, 102)');
            // Input Price: kiểm tra placeholder, chiều cao, padding, border
            cy.get('input[placeholder="0"]')
                .should('be.visible')
                .and('have.css', 'height', '32px') // ví dụ
                .and('have.css', 'padding', '0px 12px')
                .and('have.css', 'border-style', 'solid');
            // Kiểm tra icon USDC (alt="USDC icon")
            cy.get('img[alt="USDC icon"]')
                .should('be.visible')
                .and('have.css', 'width').and('match', /[0-9]+px/); // chỉ kiểm tra tồn tại kích thước
        });
    });

    it('Kiểm tra phần Amount & Collateral', () => {
        cy.get('#trade-amount-and-collateral-input').within(() => {
            // Label "Amount" ở thẻ p với class text-neutral-f2
            cy.contains('p', 'Amount')
                .should('be.visible')
                .and('have.css', 'color', 'rgb(102, 102, 102)');
            // Input Amount (input[placeholder="0"] đầu tiên)
            cy.get('input[placeholder="0"]').first()
                .should('be.visible')
                .and('have.css', 'height', '32px');
            // Kiểm tra label "Collateral" hiển thị dưới dạng thẻ span với border-dashed
            cy.contains('span', 'Collateral')
                .should('be.visible')
                .and('have.css', 'border-style', 'dashed');
            // Input Collateral (input[placeholder="0"] thứ hai)
            cy.get('input[placeholder="0"]').eq(1)
                .should('be.visible')
                .and('have.css', 'height', '32px');
            // Kiểm tra icon USDC bên Collateral
            cy.get('img[alt="USDC icon"]')
                .should('be.visible');
        });
    });

    it('Kiểm tra slider điều chỉnh %', () => {
        cy.get('#trade-amount-and-collateral-input').within(() => {
            // Slider container: span với thuộc tính dir="ltr" và data-orientation="horizontal"
            cy.get('span[dir="ltr"][data-orientation="horizontal"]')
                .should('be.visible')
                .and('have.attr', 'stepcontent'); // kiểm tra có thuộc tính stepcontent
            // Slider track: span với class "relative h-1 grow rounded-full bg-neutral-40"
            cy.get('span.relative.h-1.grow.rounded-full.bg-neutral-40')
                .should('be.visible')
                .and('have.css', 'background-color', 'rgb(220, 220, 220)'); // ví dụ
            // Slider thumb: 5 phần tử với class chứa "z-10", "size-3", "cursor-pointer"
            cy.get('div.z-10.size-3.cursor-pointer')
                .should('have.length', 5);
            // Kiểm tra text "0%" và "100%" tồn tại
            cy.contains('p', '0%').should('be.visible');
            cy.contains('p', '100%').should('be.visible');
        });
    });

    it('Kiểm tra Order Summary section (Available & Max buy)', () => {
        // Ở section này, ta chỉ kiểm tra thuộc tính, không giá trị cụ thể
        cy.get('.flex.flex-col.gap-1').within(() => {
            // Label "Available" với class text-neutral-f2
            cy.contains('p', 'Available')
                .should('be.visible')
                .and('have.css', 'color').and('match', /rgb\(.+\)/);
            // Label "Max buy" với class text-neutral-f2
            cy.contains('p', 'Max buy')
                .should('be.visible')
                .and('have.css', 'color').and('match', /rgb\(.+\)/);
            // Kiểm tra các phần tử giá trị (với class text-neutral-f1) tồn tại
            cy.get('p.text-neutral-f1').should('exist');
        });
    });

    it('Kiểm tra nút "Buy" trong khu vực giao dịch', () => {
        cy.get('#trade-connect-wallet button')
            .should('exist')
            .and('be.visible')
            // Kiểm tra thuộc tính disabled (nút Buy ban đầu bị disable)
            .and('be.disabled')
            // Kiểm tra các thuộc tính CSS ví dụ: background-color, font-size, border
            .and('have.css', 'background-color', 'rgb(0, 128, 0)') // giá trị mẫu
            .and('have.css', 'font-size', '18px');
    });

    it('Kiểm tra nút "How to trade?"', () => {
        cy.contains('button', 'How to trade?')
            .should('exist')
            .and('be.visible')
            // Kiểm tra vị trí absolute
            .and('have.css', 'position', 'absolute')
            // Kiểm tra các thuộc tính về màu nền, font-size, v.v.
            .and('have.css', 'background-color', 'rgb(240, 240, 240)')
            .and('have.css', 'font-size', '16px');
    });
});
