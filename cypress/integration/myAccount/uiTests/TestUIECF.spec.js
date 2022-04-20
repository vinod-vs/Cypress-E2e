/// <reference types="cypress" />

import TestFilter from "../../../support/TestFilter";

TestFilter(["B2C", "UI", "P0"], () => {
    describe("[UI] Personal details are editable in myAccounts page", () => {
      beforeEach(() => {
        cy.clearCookies({ domain: null });
        cy.clearLocalStorage({ domain: null });
        Cypress.Cookies.preserveOnce("w-rctx");

      });
      
      it("ECF test", () => {
        cy.ntlm(['wowuatecf.gss.woolworths.com.au'],'skalita1@woolworths.com.au','Dhunu0512')

        cy.visit('https://wowuatfbww.gss.woolworths.com.au/site/1129', {
          auth: {
            username: 'skalita1@woolworths.com.au',
            password: 'Dhunu0512'
          },
        })
      })
    })
  })