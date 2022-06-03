import { onCheckoutPage } from '../../../checkout/ui/pageObjects/CheckoutPage'
import { onCheckoutReviewItemsPanel } from '../../../checkout/ui/pageObjects/panels/CheckoutReviewItemsPanel'
import { onFMSWindowSelector } from '../../../fulfilment/ui/pageObjects/FMSWindowSelector'



Cypress.Commands.add('verifyCheckoutPage', () => {
  //click on view cart, expand, go to checkout
  //assumption- atleast one day window is selected and always available for this test
  //first waiting for the below calls and assertions since window section takes time to load and loads dynamically
  onCheckoutPage.getFulfillmentTypeInfo().contains("Delivery to:");

  cy.intercept({
    method: "GET",
    url: Cypress.env("purchaseOrderCode"),
  }).as("getPurchaseOrderCode");
  cy.wait("@getPurchaseOrderCode").should((xhr) => {
    expect(xhr.response, "statusCode").is.not.null;
  });

  onCheckoutPage.getCheckoutDelTimePanel().then((el) => {
    const textBtn = el.contents().text();
    //cy.log(textBtn);
    if (textBtn.includes("Delivery time")) {
      cy.contains("Delivery time").should("be.visible");
      onCheckoutPage.getCheckoutEstDelTimePanel().contains(" Estimated time of delivery: ");
    }
  });

  onCheckoutPage.getCheckoutDelTimePanel().then((body) => {
    const textBtn1 = body.contents().text();
    if (textBtn1.includes("Select a time")) {
      onCheckoutPage.getWowTimeSlot().each(($el) => {
        // cy.log($el.text())
        if (!$el.contents().text().includes("Original price: ")) {
          cy.wrap($el).should('have.not.contain.text', 'Original price: ').click().should("have.attr", "aria-checked", "true");
          cy.get(".panel-actions-button > .shopper-action", { timeout: 5000 })
            .scrollIntoView()
            .contains("Continue")
            .click();
          return false;
        }

      });
    }
  });

  onCheckoutPage.getCheckoutCartAvailableHeading().should(
    "have.text",
    "Coffee & Tea"
  );
  onCheckoutReviewItemsPanel.getAvailableGroceryProductsDetailsList().should("have.length", 2);

  onCheckoutPage.getCheckoutDelFeeSummary().as("deliveryFees1");
  onCheckoutPage.getCheckoutCartLine1Price()
    .invoke("text")
    .as("line1Price");

  onCheckoutPage.getCheckoutCartLine2Price()
    .invoke("text")
    .as("line2Price");

  onCheckoutPage.getContinueBtn().contains("Continue")
    .click();

  //current order total amt n save it
  onCheckoutPage.getOrderTotalContainer().invoke("text")
    .as("currentOrdrTotal");

  onCheckoutPage.getCheckoutItemSubtotal()
    .invoke("text").as("subTotal1");

  onCheckoutPage.getCheckoutDelFeeTotal().invoke("text").as("delFeeInTotal")

  cy.get("@deliveryFees1").then((fee) => {
    const delFee = parseFloat(fee.text().substring(1));
    //cy.log(delFee);

    cy.get("@line1Price").then((line1P) => {
      const line1PriceNum = parseFloat(`${line1P}`.substring(1));
      //cy.log(line1PriceNum);

      cy.get("@line2Price").then((line2P) => {
        const line2PriceNum = parseFloat(`${line2P}`.substring(1));
        // cy.log(line2PriceNum);

        const total = (delFee + line1PriceNum + line2PriceNum).toFixed(2);
        // cy.log(total);

        cy.get("@currentOrdrTotal").then((el) => {
          expect(el).to.be.eq(total);
        });
      });
    });
  });
  //assertions on order total container-checkout
  onCheckoutPage.getOrderTotalContainerTitle().contains(
    "Your order:"
  );
  onCheckoutPage.getOrderTotalLabel().contains(
    "Total (incl. GST)"
  );

  onCheckoutPage.getCurrency().contains(
    "$"
  );

  onCheckoutPage.getCheckoutSubTotalPaymentTitle().scrollIntoView()
    .should("be.visible")
    .contains("Subtotal");

  const fn = (el: any) => {
    return parseFloat(el.text().substring(1)).toFixed(2);
  };
  const func = (el: any) => {
    return parseFloat(`${el}`.substring(1));
  };

  const sumfn = (a: any, b: any) => {
    return (a + b).toFixed(2);
  };

  const sumfn1 = (a: any, b: any) => {
    return (a + b);
  };

  onCheckoutPage.getCheckoutItemSubtotal()
    .should("be.visible")
    .then((subTotl) => {
      cy.wrap({ SubtlStringToNumfn: fn })
        .invoke("SubtlStringToNumfn", subTotl)
        .as("subTotl"); // true

      cy.get("@line1Price").then((line1Price) => {
        cy.wrap({ Line1StringToNumfn: func }).invoke(
          "Line1StringToNumfn",
          line1Price
        );

        cy.get("@line2Price").then((line2Price) => {
          cy.wrap({ Line2StringToNumfn: func }).invoke(
            "Line2StringToNumfn",
            line2Price
          );

          cy.get("@subTotl").then((el) => {
            cy.wrap({ SumOfAll: sumfn })
              .invoke("SumOfAll", func(line1Price), func(line2Price))
              .should("eq", el);
          });
        });
      });
    });

  cy.get(".payment-breakdown > :nth-child(2) > .payment-title")
    .should("be.visible")
    .contains("Delivery fee");

  cy.get(".payment-breakdown > :nth-child(2) > .payment-amount")
    .should("be.visible")
    .then((delFee) => {
      cy.get(".auto_delivery-fee-summary").then((el) => {
        expect(delFee.text().trim()).to.be.eq(el.text().trim());
      });
    });


  cy.get(".payment-breakdown > :nth-child(3) > .payment-title")
    .should("be.visible")
    .contains("Paper bag");
  cy.get(".payment-breakdown > :nth-child(3) > .payment-amount")
    .should("be.visible").then(packFree => {
      cy.get('.auto_packing-summary-cost').then(el => {
        expect(packFree.text().trim()).to.contain(el.text().trim())
      })
    })

  cy.get(".payment-breakdown > :nth-child(5) > .payment-title")
    .should("be.visible")
    .contains("Total (incl. GST)");




  cy.get(".payment-breakdown > :nth-child(5) > .payment-amount")
    .should("be.visible")
    .then((totalIncGST) => {
      cy.wrap({ TotalStringToNumfn: fn })
        .invoke("TotalStringToNumfn", totalIncGST)
        .as("totalIncGST"); // true


      cy.get("@subTotal1").then((subTotal1) => {
        cy.wrap({ subTotal1StringToNumfn: func })
          .invoke("subTotal1StringToNumfn", subTotal1);


        cy.get("@delFeeInTotal").then((delFeeInTotal) => {
          cy.wrap({ delFeeInTotalStringToNumfn: func })
            .invoke("delFeeInTotalStringToNumfn", delFeeInTotal);


          cy.get("@totalIncGST").then((elTotal) => {
            cy.wrap({ SumTotal: sumfn })
              .invoke("SumTotal", func(subTotal1), func(delFeeInTotal))
              .should("eq", elTotal);

          })
        })
      })
    })

  //   //Select open pay and clicking
  cy.get(".digitalPayListItem-icon").eq(0).should(
    "be.visible"
  );
  cy.get(
    "#digitalPayListItem1 > .digitalPayListItem-contentContainer .title-text"
  )
    .should("be.visible")
    .contains("Paid on Work Account");
  cy.get(
    "#digitalPayListItem1 > .digitalPayListItem-contentContainer .sub-text"
  )
    .should("be.visible")
    .contains("Powered by Openpay")
    .click();



  //Enter purchase order number
  onCheckoutPage.getPurchaseOrderField()
    .should("be.visible")
    .and("has.attr", "placeholder", "Purchase order number *")
    .clear()
    .type("1111");
  onFMSWindowSelector.getContinueShoppingButton()
    .should("be.visible")
    .and('not.be.disabled')
    .contains("Place order")
    .click();

  //waiting for the confirm order api to be called
  cy.intercept({
    method: "GET",
    url: "/apis/ui/Checkout/ConfirmOrder?*",
  }).as("confirmOrder");
  cy.wait("@confirmOrder").should((xhr) => {

    //  expect(xhr.state,'Complete');
    expect(xhr.response, "statusCode").is.not.null;
    expect(xhr.response?.body.Order.OrderId, "OrderId").is.not.null;
  });
})