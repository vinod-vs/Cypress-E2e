/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from "../../../../fixtures/everydayMarket/shoppers.json";
import rewardsDetails from "../../../../fixtures/everydayMarket/rewards.json";
import TestFilter from "../../../../support/TestFilter";
import "../../../../support/login/api/commands/login";
import "../../../../support/search/api/commands/search";
import "../../../../support/fulfilment/api/commands/fulfilment";
import "../../../../support/sideCart/api/commands/clearTrolley";
import "../../../../support/invoices/api/commands/commands";
import "../../../../support/refunds/api/commands/commands";
import "../../../../support/sideCart/api/commands/addItemsToTrolley";
import "../../../../support/checkout/api/commands/navigateToCheckout";
import "../../../../support/checkout/api/commands/confirmOrder";
import "../../../../support/payment/api/commands/creditcard";
import "../../../../support/payment/api/commands/digitalPayment";
import "../../../../support/giftCardService/api/commands/giftCardService";
import "../../../../support/rewards/api/commands/rewards";
import "../../../../support/everydayMarket/api/commands/orderApi";
import "../../../../support/everydayMarket/api/commands/marketplacer";
import "../../../../support/everydayMarket/api/commands/utility";
import tests from "../../../../fixtures/everydayMarket/apiTests.json";
import * as lib from "../../../../support/everydayMarket/api/commands/commonHelpers";

TestFilter(["EDM", "API"], () => {
  describe("[API] RP-5432 - EM| Gifting | Verify Gifting details on Checkout, Order Confirmation page and on MarketPlacer", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });

    it("[API] RP-5432 - EM| Gifting | Verify Gifting details on Checkout, Order Confirmation page and on MarketPlacer", () => {
      let response = cy.generateANewGiftCard(123);
    //   cy.log(JSON.stringify(response));
    });
  });
});
