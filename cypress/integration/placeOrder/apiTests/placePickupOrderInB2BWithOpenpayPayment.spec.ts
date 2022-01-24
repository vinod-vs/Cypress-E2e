/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shopper from "../../../fixtures/login/b2bLogin.json";
import addressSearchBody from "../../../fixtures/checkout/addressSearch.json";
import openPayPayment from "../../../fixtures/payment/openPayPayment.json";
import purchaseOrderCode from "../../../fixtures/payment/purchaseOrderCode.json";
import TestFilter from "../../../support/TestFilter";
import { windowType } from "../../../fixtures/checkout/fulfilmentWindowType.js";
import "../../../support/login/api/commands/login";
import "../../../support/search/api/commands/search";
import "../../../support/fulfilment/api/commands/fulfilment";
import "../../../support/sideCart/api/commands/clearTrolley";
import "../../../support/sideCart/api/commands/addItemsToTrolley";
import "../../../support/checkout/api/commands/navigateToCheckout";
import "../../../support/checkout/api/commands/confirmOrder";
import "../../../support/payment/api/commands/creditcard";
import "../../../support/payment/api/commands/digitalPayment";
import "../../../support/payment/api/commands/setPurchaseOrderCode";
import { fulfilmentType } from "../../../fixtures/checkout/fulfilmentType.js";
import storeSearchBody from "../../../fixtures/checkout/b2bStoreSearch.json";
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'

TestFilter(["B2B", "API", "P0"], () => {
  describe("[API] Place a pickup order on Woolworths at Work website using Openpay", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });

    it("Should place a pickup order on Woolworths at Work website using OpenPay as payment option", () => {
      cy.loginViaApi(shopper).then((response: any) => {
        expect(response).to.have.property("LoginResult", "Success");
      });
      cy.searchDeliveryAddress(addressSearchBody).then((response: any) => {
        expect(response.Id).to.not.be.empty;

        expect(response.Id).to.not.be.null;
      });

      cy.searchPickupDTBStores(
        fulfilmentType.PICK_UP,
        storeSearchBody.postCode
      ).then((response: any) => {
        expect(response.AddressId).to.not.be.null;
      });

      cy.getFulfilmentWindowViaApi(windowType.PICK_UP).then((response: any) => {
        expect(response.Id).to.greaterThan(0);
      });

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        expect(response).to.have.property("IsSuccessful", true);
      });

      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property("TrolleyItemCount", 0);

        expect(response).to.have.property("TotalTrolleyItemQuantity", 0);
      });

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley("fish", 30.0);

      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0);

        openPayPayment.openpayAmount = response.Model.Order.BalanceToPay;
      });

      cy.setPurchaseOrderCode(purchaseOrderCode).then((response: any) => {
        expect(response.status).to.eq(200);
      });

      cy.openPayDigitalPay(openPayPayment).then((response: any) => {
        expect(response.TransactionReceipt).to.not.be.null
        expect(response.PlacedOrderId).to.not.be.null
        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })

      cy.confirmOrder(confirmOrderParameter).then((response: any) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)

        cy.log('This is the order id: ' + response.Order.OrderId)
      })

    });
  });
});
