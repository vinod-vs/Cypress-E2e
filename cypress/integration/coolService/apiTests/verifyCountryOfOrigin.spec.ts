/// <reference types="cypress" />

import coolServiceData from "../../../fixtures/coolService/coolServiceData.json";
import coolServiceResponse from "../../../fixtures/coolService/coolServiceResponseFields.json";
import TestFilter from "../../../support/TestFilter";
import "../../../support/coolService/api/commands/getCountryOfOrigin";

TestFilter(["API", "B2C", "P1"], () => {
  describe("[API] Get Country Of Origin of the product", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });
    it("Verify the CountryOfOrgin", () => {
      cy.getCountryOfOrigin(coolServiceData).then((response: any) => {
        expect(response).to.have.property("Country", "Australia");
      });

      it("Verify the keys from Cool Service response ", () => {
        cy.getCountryOfOrigin(coolServiceData).then((response: any) => {
          expect(response.body).to.includes.keys(coolServiceResponse.coolServiceResponseFields)
        });
      });
    });
  });
});
