/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />
import gifCardAuthorizeRequest from "../../../../fixtures/giftCardService/authorize.json";
import generateGiftCardRequest from "../../../../fixtures/giftCardService/generateGiftcard.json";

const dateAtClient = new Date(Date.now()).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).split(",")[0]

Cypress.Commands.add("authorizeGiftingService", () => {
  cy.api({
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "DateAtClient": dateAtClient,
    },
    body: gifCardAuthorizeRequest,
    url: Cypress.env("giftCardServiceEndpoint") + "/authorize",
  }).then((response: any) => {
    expect(response.status).to.eq(200);
    expect(response.body.ResponseMessage).to.eq("Transaction successful.");
    expect(response.body.ResponseCode).to.eq(0);
    expect(response.body.Result).to.be.true;
    return response.body;
  });
});

Cypress.Commands.add("generateANewGiftCard", (giftCardAmount) => {
  cy.authorizeGiftingService().as("giftingServiceAuthToken");
  cy.get("@giftingServiceAuthToken").then((giftingServiceAuthToken: any) => {
    generateGiftCardRequest.Cards[0].Amount = giftCardAmount;

    cy.api({
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "DateAtClient": dateAtClient,
        TransactionId: Number(Math.floor(Math.random() * 100000)),
      },
      auth: {
        bearer: giftingServiceAuthToken.AuthToken,
      },
      body: generateGiftCardRequest,
      url: Cypress.env("giftCardServiceEndpoint") + "/gc/transactions",
    }).then((response: any) => {
      expect(response.status).to.eq(200);
      expect(response.body.ResponseMessage).to.eq("Transaction successful.");
      expect(response.body.ResponseCode).to.eq(0);
      return response.body;
    });
  });
});
