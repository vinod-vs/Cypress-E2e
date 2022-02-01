import { TwoFactorAuthPage } from "cypress/support/login/ui/pageObjects/TwoStepAuthPage";
import { OrderManagementMenu } from "cypress/support/siteManagement/ui/commands/OrderManagementMenu";
import { onOrderManagement } from "../../../../support/siteManagement/ui/pageObjects/OrderManagement";

Cypress.Commands.add("validateOrderDetailsOnSM", (isMarketOnly) => {
  cy.get("@finalProjection").then((finalProjection) => {
    // Verify common details for woth WOW & EDM orders
    //Verify order reference
    onOrderManagement
      .getOrderReference()
      .parent()
      .invoke("text")
      .should("contain", finalProjection.orderReference);

    //Verify Order Payment Details
    //TODO

    if (isMarketOnly === false) {
      //Verify WOW order details
      //TODO verify wow item details
      onOrderManagement.getWOWTab().click();
      cy.wait(Cypress.config("tenSecondWait")); //Required for page to load. Else element verifications will fail
      onOrderManagement
        .getWOWTabOrderId()
        .parent()
        .invoke("text")
        .should("contain", finalProjection.orderId);
    }

    //Verify EDM order details
    onOrderManagement.getEDMTab().click();
    cy.wait(Cypress.config("tenSecondWait")); //Required for page to load. Else element verifications will fail

    //Verify common details
    onOrderManagement
      .getEDMTabOrderItemsMainDiv()
      .find(">div")
      .should("have.length", Number(finalProjection.invoices.length + 1));
    onOrderManagement
      .getEDMTabOrderDeliveryFee()
      .parent()
      .invoke("text")
      .should("contain", finalProjection.shippingAmount);

    //Verify individual seller details
    onOrderManagement
      .getEDMTabOrderItemsMainDiv()
      .find(">div")
      .then(($li) => {
        finalProjection.invoices.forEach(function (invoice, i) {
          let sellerDetailsLocator =
            onOrderManagement.getEDMTabSellerDetailsCommonDivString();

          cy.get($li[i])
            .find(onOrderManagement.getEDMTabSellerDetailsCommonDivString())
            .as("sellerDetailsAliasLocator");
          cy.log(invoice.legacyIdFormatted);
          cy.log(JSON.stringify(invoice.seller));
          cy.log(JSON.stringify(invoice.lineItems));

          //Verify seller name
          cy.get($li[i])
            .find(onOrderManagement.getEDMTabSellerNameString())
            .invoke("text")
            .should("contain", invoice.seller.sellerName);
          //Verify InvoiceID
          cy.get("@sellerDetailsAliasLocator")
            .find(
              onOrderManagement.getEDMTabCommonOrderItemsBySellerOrderIdString()
            )
            .parent()
            .invoke("text")
            .should("contain", invoice.legacyIdFormatted);
          //Verify invoice status
          cy.get("@sellerDetailsAliasLocator")
            .find(
              onOrderManagement.getEDMTabCommonOrderItemsBySellerOrderStatusString()
            )
            .parent()
            .invoke("text")
            .should("contain", invoice.wowStatus);
          //Verify invoice total
          cy.get("@sellerDetailsAliasLocator")
            .find(
              onOrderManagement.getEDMTabCommonOrderItemsBySellerSubtotalString()
            )
            .parent()
            .invoke("text")
            .should("contain", invoice.invoiceTotal);
          //Tracking links verifications
          invoice.shipments.forEach(function (shipment, j) {
            cy.log(shipment.trackingLink);
            cy.log(shipment.trackingNumber);

            cy.get("@sellerDetailsAliasLocator")
              .find("div#order-refund-tracking-links-display a")
              .then(($a) => {
                cy.get($a[j]).should(
                  "have.attr",
                  "href",
                  shipment.trackingLink
                );
                cy.get($a[j]).should("contain", shipment.trackingNumber);
              });
          });
          //Item details in the table
          invoice.lineItems.forEach(function (item, j) {
            cy.log(item.stockCode);
            cy.get($li[i])
              .find(sellerDetailsLocator)
              .find("table")
              .find(onOrderManagement.getCommonItemsTableTRString())
              .as("sellerDetailsTableAliasLocator");
            cy.get("@sellerDetailsTableAliasLocator")
              .find(onOrderManagement.getCommonItemsTableStockcodeString())
              .invoke("text")
              .should("contain", item.stockCode);
            cy.get("@sellerDetailsTableAliasLocator")
              .find(onOrderManagement.getCommonItemsTableQuantityString())
              .invoke("text")
              .should("contain", item.quantity);
            cy.get("@sellerDetailsTableAliasLocator")
              .find(
                onOrderManagement.getCommonItemsTablePriceBeforeDiscountString()
              )
              .invoke("text")
              .should("contain", item.salePrice);
            cy.get("@sellerDetailsTableAliasLocator")
              .find(onOrderManagement.getCommonItemsTableItemTotalString())
              .invoke("text")
              .should("contain", item.totalAmount);
          });
        });
      });

    //Verify the last div which is the shipping
    onOrderManagement
      .getEDMTabOrderItemsMainDiv()
      .find(">div")
      .last()
      .as("shippingDetailsAliasLocator");
    cy.get("@shippingDetailsAliasLocator")
      .find("table")
      .find(onOrderManagement.getCommonItemsTableTRString())
      .as("shippingDetailsTableAliasLocator");
    cy.get("@shippingDetailsAliasLocator")
      .invoke("text")
      .should("contain", "Shipping");
    cy.get("@shippingDetailsTableAliasLocator")
      .find("td")
      .invoke("text")
      .should("contain", "Shipping fee");
    cy.get("@shippingDetailsTableAliasLocator")
      .find(onOrderManagement.getCommonItemsTableQuantityString())
      .invoke("text")
      .should("contain", "1");
    cy.get("@shippingDetailsTableAliasLocator")
      .find(onOrderManagement.getCommonItemsTableUnitPriceString())
      .invoke("text")
      .should("contain", finalProjection.shippingAmount);
    cy.get("@shippingDetailsTableAliasLocator")
      .find(onOrderManagement.getCommonItemsTableItemTotalString())
      .invoke("text")
      .should("contain", finalProjection.shippingAmount);
  });
});

Cypress.Commands.add("verifySelfServiceReturnOnSM", (returnType) => {
  //Verify the refund/return details against each return in the projection
  cy.get("@finalProjection").then((finalProjection) => {
    finalProjection.invoices.forEach(function (invoice: any, i: any) {
      invoice.returns.forEach(function (returns: any, j: any) {
        returns.returnItems.forEach(function (returnItems: any, k: any) {
          returnItems.lineItems.forEach(function (lineItems: any, l: any) {
            //Verify the returnType
            onOrderManagement
              .getRefundDetailsForStockcode(lineItems.stockCode)
              .as("stockcodeRefundCommonLocator");
            cy.get("@stockcodeRefundCommonLocator")
              .find("span")
              .invoke("text")
              .should("contain", returnType);
            //Verify the return reason
            cy.get("@stockcodeRefundCommonLocator")
              .find("span")
              .invoke("text")
              .should("contain", lineItems.reason);
            //Verify the return comment
            cy.get("@stockcodeRefundCommonLocator")
              .find("span")
              .invoke("text")
              .should("contain", lineItems.notes);
            //Verify the Return tracking ID
            cy.get("@stockcodeRefundCommonLocator")
              .find("span a[href*='" + lineItems.trackingId + "']")
              .invoke("text")
              .should("contain", invoice.legacyIdFormatted);
            cy.get("@stockcodeRefundCommonLocator")
              .find("span a[href*='" + lineItems.trackingId + "']")
              .then(($a) => {
                cy.get($a).should("have.attr", "href");
              });
            //Verify refund total
            onOrderManagement
              .getRefundDetailsTDForStockcode(lineItems.stockCode)
              .as("stockcodeRefundCommonTDLocator");
            cy.get("@stockcodeRefundCommonTDLocator")
              .find(onOrderManagement.getCommonItemsTableItemTotalString())
              .invoke("text")
              .should("contain", returns.refundAmount);
            //Verify refund unit price
            cy.get("@stockcodeRefundCommonTDLocator")
              .find(onOrderManagement.getCommonItemsTableUnitPriceString())
              .invoke("text")
              .should("contain", lineItems.amount);
            //Verify refund quantity
            cy.get("@stockcodeRefundCommonTDLocator")
              .find(onOrderManagement.getCommonItemsTableReturnQuantityString())
              .invoke("text")
              .should("contain", lineItems.quantity);
          });
        });
      });
    });
  });
});

Cypress.Commands.add("performReIssueOnWowOrderOnSM", (isMarketOnly) => {
  cy.get("@finalProjection").then((finalProjection) => {
  // Verify common details for woth WOW & EDM orders
  // Verify OrderReference Number on the Order Management SM UI
  if (isMarketOnly === false) {
  onOrderManagement.getOrderReference().parent().invoke("text").should("contain", finalProjection.orderReference);
  // Click on "Woolworths Order" Tab
  onOrderManagement.getWOWTab().click();
  cy.wait(Cypress.config("tenSecondWait")); //Required for page to load. Else element verifications will fail
  // Verify Wow 'OrderID' Under the "Woolworths Order" Tab
  onOrderManagement.getWOWTabOrderId().parent().invoke("text").should("contain", finalProjection.orderId);
  //Verify Wow 'OrderStatus' is 'Dispatched' Under the "Woolworths Order" Tab
  onOrderManagement.getWOWTabOrderStatus().parent().invoke("text").should("contain", 'Dispatched');
  } //  if (isMarketOnly === false) - ENDS


  });
});
