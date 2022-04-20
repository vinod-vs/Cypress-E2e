/// <reference types="cypress" />

import shoppers from "../../../fixtures/myAccount/b2cShoppersBusiness.json";
import TestFilter from "../../../support/TestFilter";
import "../../../support/login/api/commands/login";
import "../../../support/myAccount/api/commands/personalDetailsEdit";
import '../../../support/utilities/ui/utility'
  

let ABN:any
let CompanyName:any

TestFilter(["API", "B2C", "P1"], () => {
    describe("[API] Business details are editable from myAccounts page and email notification should be triggered for the change", () => {
      beforeEach(() => {
        cy.clearCookies({ domain: null });
        cy.clearLocalStorage({ domain: null });
        cy.loginViaApi(shoppers[0]).then((response: any) => {
          expect(response).to.have.property("LoginResult", "Success");
        })
        Cypress.Cookies.preserveOnce("w-rctx");
        Cypress.Cookies.preserveOnce("INGRESSCOOKIE");
        Cypress.Cookies.preserveOnce("w-8484730-uldtvc");
        Cypress.Cookies.preserveOnce("w-loggedin"); 

      });
      it("The user should  be able to pass the ABN number in the request API resulting it should be updated in the response", () => {
        
        ABN = shoppers[1].ABN
        CompanyName = shoppers[1].CompanyName
        cy.editBusinessDetails(shoppers[1]).then((response: any) => {
          expect(response.status).to.eq(200)  
          expect(response.body).to.have.property("ABN", ABN);
          expect(response.body).to.have.property("CompanyName",CompanyName)


        });

      
      })

    })
})