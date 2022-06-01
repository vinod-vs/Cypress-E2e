/// <reference types="cypress" />

import shoppers from "../../../fixtures/myAccount/b2bShoppers.json";
import TestFilter from "../../../support/TestFilter";
import "../../../support/login/ui/commands/login";
import "../../../support/myAccount/ui/commands/myAccount";
import "../../../support/myAccount/ui/commands/myPaymentMethods";
import "../../../support/logout/ui/commands/logout";
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector';
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage';
import '../../../support/sideCart/ui/commands/clearTrolley';
import '../../../support/search/ui/commands/searchAndAddProduct';
import '../../../support/sideCart/ui/commands/cartContents';




TestFilter(["B2B", "UI", "P0", "Checkout", "E2E"], () => {
  describe("[UI] Place orders on B2B using Open Pay", () => {
    // pre-requisite to clear all cookies before login
    beforeEach(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
      Cypress.Cookies.preserveOnce("w-rctx");
    });

    it("Be able to place delivery order using OpenPay type payment method", () => {
      // login to the site
      cy.loginViaUi(shoppers[2]);
      cy.viewport(1536, 1080);
      

      //validate that the user is on the fulfilmentMethod page but selecting FMS windows in checkout for this test
      cy.url().should("include", "/shop/fulfilmentmethod");

      //clicking on WAW logo to redirect to B2B home page
      onFMSAddressSelector.getHomePage().click();

      //assert if user is on WAW home page now, also allows sometime for the page to load completely
      onHomePage.getB2BMyAccount()
      //cy.get(".button--primary.ng-star-inserted")
        .contains("My Account")
        .should("be.visible");

      onHomePage.getListsLink()
      .contains("Lists").should("be.visible");
      
     onHomePage.getDiscoverCenterLinkB2B().should('be.visible');

      //make sure side cart is empty, if not clear it- make this a function
      
      cy.clearSideCartB2B();      

      //click on coffee category and adding to cart- make it a function & assert the page. Giving sometime for the page to load basically
      cy.navigateToCategoryAndProductSelectB2B();

      //click on view cart, expand, go to checkout
     cy.clickToViewSideCartAndNavigateToCheckout();

      //check if cart totals are good
      cy.verifySideCartOrderSummary();
      // cy.get("div.cart-checkout-summary__price").contains("Woolworths items");
      // cy.get("div.cart-checkout-summary__price").contains(" $47.10 ");

      // cy.get("div.cart-checkout-summary__section > :nth-child(2)").contains(
      //   " Estimated delivery fee "
      // );
      // cy.get("div.cart-checkout-summary__section > :nth-child(2)").contains(
      //   "$0.00 - $15.00"
      // );

      // cy.get("div.cart-checkout-summary__section > :nth-child(3)").contains(
      //   " Estimated packaging fee "
      // );
      // cy.get("div.cart-checkout-summary__section > :nth-child(3)").contains(
      //   "$0.00 - $2.50"
      // );

      // cy.get(".cart-checkout-content").contains(" $47.10 ");
      // cy.get(".cart-checkout-content").contains("Excluding service fees");

      //click on checkout button
      cy.navigateToCheckoutFromSideCart();
      // cy.get(".cart-checkout-button > .button").click();
      // cy.get(
      //   "wow-checkout-fulfilment-summary.ng-star-inserted > span.ng-star-inserted"
      // ).contains("Auto Reg All trading 101 - 101 Red street, ARMIDALE 2350");
      

      //assumption- atleast one day window is selected and always available for this test
      //first waiting for the below calls and assertions since window section takes time to load and loads dynamically
      cy.get(
        "wow-checkout-fulfilment-summary.ng-star-inserted > p.ng-star-inserted"
      ).contains("Delivery to:");

      cy.intercept({
        method: "GET",
        url: Cypress.env("purchaseOrderCode"),
      }).as("getPurchaseOrderCode");
      cy.wait("@getPurchaseOrderCode").should((xhr) => {
        expect(xhr.response, "statusCode").is.not.null;
      });

      cy.get(
        "#checkout-timePanel > .panel > .ng-trigger > .panel-heading"
      ).then((el) => {
        const textBtn = el.contents().text();
        cy.log(textBtn);
        if (textBtn.includes("Delivery time")) {
          cy.contains("Delivery time").should("be.visible");
          cy.get(
            ".wow-row > :nth-child(3) > :nth-child(1) > p.ng-star-inserted"
          ).contains(" Estimated time of delivery: ");
        }
      });

      cy.get(
        "#checkout-timePanel > .panel > .ng-trigger > .panel-heading"
      ).then((body) => {
        const textBtn1 = body.contents().text();
        if (textBtn1.includes("Select a time")) {
          cy.get("wow-time-slot-time button").each(($el) => {
            cy.log($el.text())



            if(!$el.contents().text().includes("Original price: ")) {
                cy.wrap($el).should('have.not.contain.text','Original price: ').click().should("have.attr", "aria-checked", "true");
                cy.get(".panel-actions-button > .shopper-action", { timeout: 5000 })
                .scrollIntoView()
                .contains("Continue")
                .click();
              return false;
            }

          });
        }
      });

      cy.get(".checkout-cart-available-item-group-heading").should(
        "have.text",
        "Coffee & Tea"
      );
      cy.get("wow-cart-item-checkout>.cart-item").should("have.length", 2);

      cy.get(".auto_delivery-fee-summary").as("deliveryFees1");
      cy.get(
        ":nth-child(2) > .cart-item > :nth-child(1) > .wow-col-8 > .wow-col-md-3 > shared-price.ng-star-inserted > .price"
      )
        .invoke("text")
        .as("line1Price");

      cy.get(
        ":nth-child(3) > .cart-item > :nth-child(1) > .wow-col-8 > .wow-col-md-3 > shared-price.ng-star-inserted > .price"
      )
        .invoke("text")
        .as("line2Price");

      cy.get(
        "#checkout-reviewPanel > .panel > .ng-trigger > .panel-actions .shopper-action"
      )
        .contains("Continue")
        .click();

      //current order total amt n save it
      cy.get(".order-total > .order-total-container .totals > .total-amount")
        .invoke("text")
        .as("currentOrdrTotal");

        cy.get('#checkout-items-subtotal > .payment-amount')
        .invoke("text").as("subTotal1");

        cy.get(':nth-child(2) > .payment-amount').invoke("text").as("delFeeInTotal")

      cy.get("@deliveryFees1").then((fee) => {
        const delFee = parseFloat(fee.text().substring(1));
        cy.log(delFee);

        cy.get("@line1Price").then((line1P) => {
          const line1PriceNum = parseFloat(`${line1P}`.substring(1));
          cy.log(line1PriceNum);

          cy.get("@line2Price").then((line2P) => {
            const line2PriceNum = parseFloat(`${line2P}`.substring(1));
            cy.log(line2PriceNum);

            const total = (delFee + line1PriceNum + line2PriceNum).toFixed(2);
            cy.log(total);

            cy.get("@currentOrdrTotal").then((el) => {
              expect(el).to.be.eq(total);
            });
          });
        });
      });
      //assertions on order total container-checkout
      cy.get(".order-total > .order-total-container > .title").contains(
        "Your order:"
      );
      cy.get(".order-total > .order-total-container > .column").contains(
        "Total (incl. GST)"
      );

      cy.get(".order-total > .order-total-container .dollar-symbol").contains(
        "$"
      );

      cy.get("#checkout-items-subtotal > .payment-title").scrollIntoView()
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

      cy.get("#checkout-items-subtotal > .payment-amount")
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
          .should("be.visible").then(packFree=>{
            cy.get('.auto_packing-summary-cost').then(el=>{
              expect(packFree.text().trim()).to.contain(el.text().trim())
            })
          })
         
        cy.get(".payment-breakdown > :nth-child(5) > .payment-title")
          .should("be.visible")
          .contains("Total (incl. GST)");
      
      
      
          
        cy.get(".payment-breakdown > :nth-child(5) > .payment-amount")
          .should("be.visible")
          .then((totalIncGST)=>{
            cy.wrap({ TotalStringToNumfn: fn })
            .invoke("TotalStringToNumfn", totalIncGST)
            .as("totalIncGST"); // true
        

        cy.get("@subTotal1").then((subTotal1) => {
          cy.wrap({ subTotal1StringToNumfn: func })
          .invoke("subTotal1StringToNumfn",subTotal1);
       

        cy.get("@delFeeInTotal").then((delFeeInTotal) => {
          cy.wrap({ delFeeInTotalStringToNumfn: func })
          .invoke("delFeeInTotalStringToNumfn",delFeeInTotal);
      

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
        cy.get("#purchaseOrderInput")
          .should("be.visible")
          .and("has.attr", "placeholder", "Purchase order number *")
          .clear()
          .type("1111");
        cy.get(".shopper-action")
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
            expect(xhr.response?.body.Order.OrderId,"OrderId").is.not.null;
          });

          cy.url().should("include", "/shop/confirmation")
          cy.get('.confirmation-container__header').contains('Order received')
          cy.get('.confirmation-fulfilment-details__header').contains(' Delivery details ')

    });
  });
});
