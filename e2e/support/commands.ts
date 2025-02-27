/// <reference types="cypress" />

declare global {
    namespace Cypress {
      interface Chainable<Subject = any> {
        /**
         * Giả lập ví Phantom trên window.solana
         */
        mockPhantomWallet(): Chainable<Subject>;
      }
    }
  }
  
  Cypress.Commands.add('mockPhantomWallet', () => {
    cy.window().then((win) => {
      win.solana = {
        isPhantom: true,
        connect: () => Promise.resolve({ publicKey: 'FakePublicKey_123456' }),
        signTransaction: (tx: any) =>
          Promise.resolve({ ...tx, signature: 'FakeSignature_ABCDEF' }),
        signAndSendTransaction: (tx: any) =>
          Promise.resolve({ signature: 'FakeSignature_ABCDEF' }),
      };
    });
  });
  
  export {};
  