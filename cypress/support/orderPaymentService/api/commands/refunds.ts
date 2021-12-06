/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />
import "../../../utilities/api/apiUtilities";

Cypress.Commands.add("getAllRefundsByOrderId", (traderOrderId) => {
  let endpoint = String(Cypress.env("orderPaymentServiceRefundsEndPoint"));
  endpoint = endpoint.replace("TRADER_ORDER_ID", traderOrderId);
  cy.api({
    method: "GET",
    url: endpoint,
  }).then((response: any) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

Cypress.Commands.add("getAllRefundPaymentsByRefundId", (refundId) => {
  let endpoint = String(
    Cypress.env("orderPaymentServiceRefundPaymentsEndpoint")
  );
  endpoint = endpoint.replace("REFUND_ID", refundId);
  cy.api({
    method: "GET",
    url: endpoint,
  }).then((response: any) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

Cypress.Commands.add(
  "findCCRefundPayment",
  (refundPaymentsDetails, refundAmount) => {
    // Credit card will be refunded as credit card, otherwise store credit
    return cy.wrap(
      refundPaymentsDetails.results.some(
        (result: { type: string; total: number }) =>
          (result.type === "CreditCard" ||
            result.type === "StoreCreditCCFail") &&
          result.total === refundAmount
      )
    );
  }
);

Cypress.Commands.add(
  "findSCRefundPayment",
  (refundPaymentsDetails, refundAmount) => {
    return cy.wrap(
      refundPaymentsDetails.results.some(
        (result: { type: string; total: number }) =>
          result.type === "StoreCredit" && result.total === refundAmount
      )
    );
  }
);

Cypress.Commands.add(
  "getAllRefundPaymentsByRefundIdWithRetry",
  (refundId, retryOptions) => {
    let endpoint = String(
      Cypress.env("orderPaymentServiceRefundPaymentsEndpoint")
    );
    endpoint = endpoint.replace("REFUND_ID", refundId);
    cy.retryRequest(endpoint, {
      method: "GET",
      retries: retryOptions.retries,
      timeout: retryOptions.timeout,
      function: retryOptions.function,
    }).then((response: any) => {
      expect(response.status).to.eq(200);
      return response.body;
    });
  }
);

Cypress.Commands.add(
  "getAllRefundsByOrderIdWithRetry",
  (traderOrderId, retryOptions) => {
    let endpoint = String(Cypress.env("orderPaymentServiceRefundsEndPoint"));
    endpoint = endpoint.replace("TRADER_ORDER_ID", traderOrderId);
    cy.retryRequest(endpoint, {
      method: "GET",
      retries: retryOptions.retries,
      timeout: retryOptions.timeout,
      function: retryOptions.function,
    }).then((response: any) => {
      expect(response.status).to.eq(200);
      return response.body;
    });
  }
);
