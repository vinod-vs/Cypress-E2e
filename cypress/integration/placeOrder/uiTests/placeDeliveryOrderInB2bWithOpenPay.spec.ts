/// <reference types="cypress" />

import shoppers from "../../../fixtures/myAccount/b2bShoppers.json";
import creditCard from "../../../fixtures/myAccount/creditCard.json";
import TestFilter from "../../../support/TestFilter";
import "../../../support/login/ui/commands/login";
import "../../../support/myAccount/ui/commands/myAccount";
import "../../../support/myAccount/ui/commands/myPaymentMethods";
import "../../../support/logout/ui/commands/logout";
import { add, has } from "cypress/types/lodash";
import exp from "constants";
import { text } from "stream/consumers";
import { parseHTML } from "cypress/types/jquery";
import { any } from "cypress/types/bluebird";

TestFilter(["B2B", "UI", "P0", "Checkout", "E2E"], () => {
  describe("[UI] Place orders on B2B using Open Pay", () => {
    // pre-requisite to clear all cookies before login
    beforeEach(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
      Cypress.Cookies.preserveOnce("w-rctx");
    });

    it("Be able to place delivery order using OpenPay type payment method", () => {
      // Login to the site
      cy.loginViaUi(shoppers[2]);
      cy.viewport(1536, 1080);

      //Validate that the user is on the fulfilmentMethod page to select one
      cy.url().should("include", "/shop/fulfilmentmethod");
      cy.get(".coreHeader-logo").click();

      //assert if user is on WAW home page now
      cy.get(".button--primary.ng-star-inserted")
        .contains("My Account")
        .should("be.visible");
      cy.get('[erlabel="My Lists"]').contains("Lists").should("be.visible");
      cy.get('[routerlink="/shop/discover/centre"]').should(
        "be.visible"
      );

      //make sure cart is empty, if not clear it- make this a function
      cy.get("#viewCartPanel > .button")
        .should("have.text", "View cart")
        .click();

      cy.get("body").then((body) => {
        if (body.find(".empty-cart-title").length > 0) {
          cy.get(".empty-cart-title").should("have.text", "Your cart is empty");
        } else {
          cy.get(".product-actionsClearCart").scrollIntoView().click();
          cy.get("#btnclearAllCartItems > .primary").scrollIntoView().click();
          cy.get(".empty-cart-title").should("have.text", "Your cart is empty");
        }

        cy.get("#btnContinueShopping > .primary").should("be.visible").click();
      });

      //click on coffee category- make it a function
      cy.scrollTo("top");
      cy.get('[href="/shop/browse/coffee-tea"]').click();
      cy.get(".categoryHeader-menuHeaderLink")
        .should("have.text", " Show all Coffee & Tea ")
        .click();

      cy.get(".navigation-item-link").as("leftMenuLnk");
      cy.get("@leftMenuLnk")
        .eq(1)
        .then((mainLnk) => {
          expect(mainLnk[0].innerText.toLocaleLowerCase()).to.contain(
            "Coffee".toLocaleLowerCase()
          );

        })
        .click();


      //asserting if components in page is visible to do next steps. Giving sometime for the page to load basically. network calls not working for some reason else that would be the best way to do
      cy.get(".browseContainer-title").then((el) => {
        expect(el[0].innerText.trim().toLocaleLowerCase()).to.contain(
          "Coffee".trim().toLocaleLowerCase()
        );
      });
      cy.get(".searchFilter-expandButton").should("be.visible");
      cy.get(".searchFilter-expandButtonText")
        .contains("Show filters")
        .and("be.visible");
      cy.get(".inline-dropdown__label").contains("Sort by").and("be.visible");
      cy.get('shared-product-tile > shared-product-tile-v1 > .shelfProductTile').should("be.visible");
      cy.scrollTo("top");

      //get product to be added to cart
      cy.get("shared-product-tile > shared-product-tile-v1 > .shelfProductTile")
        .contains(
          "Moccona Freeze Dried Instant Coffee Classic Medium Roast 200g"
        )
        .click();

      //wait for the page to load-
      cy.intercept({
        method: "GET",
        url: "/api/v3/ui/schemaorg/product/*",
      }).as("productLoad");
      cy.wait("@productLoad").should((xhr) => {
        //  expect(xhr.state,'Complete');
        expect(xhr.response, "statusCode").is.not.null;
      });

      //add two products to cart
      cy.get(".shelfProductTile-title").should(
        "have.text",
        "Moccona Freeze Dried Instant Coffee Classic Medium Roast 200g"
      );
      cy.get(".cartControls-addButton").contains("Add to cart").click();
      cy.scrollTo("top");
      cy.get(".cartControls-quantityInput:visible")
        .scrollIntoView()
        .clear()
        .type("2");
      cy.scrollTo("top");
      cy.get(".quantity-pill-container").contains("2");
      cy.visit(
        "/shop/productdetails/248520/moccona-freeze-dried-instant-coffee-classic-dark-roast"
      );
      cy.get(".shelfProductTile-title").should(
        "have.text",
        "Moccona Freeze Dried Instant Coffee Classic Dark Roast 200g"
      );

      //reusing the wait for waiting on details page
      cy.intercept({
        method: "GET",
        url: "/api/v3/ui/schemaorg/product/*",
      }).as("productLoad");
      cy.wait("@productLoad").should((xhr) => {
        //  expect(xhr.state,'Complete');
        expect(xhr.response, "statusCode").is.not.null;
      });

      cy.get(".cartControls-addButton").contains("Add to cart").click();
      cy.scrollTo("top");

      //click on view cart, expand, go to checkout
      cy.get("#viewCartPanel > .button").contains("View cart").click();
      cy.get(".heading-title").contains("Your Cart");
      cy.get(".cartSaveList > .linkButton").contains("Save as a list");
      cy.get(".product-actionsClearCart").contains("Remove all");
      cy.get(".cart-checkout-summary > .linkButton")
        .should("be.visible")
        .contains(" Order summary ")
        .click();

      //check if cart totals are good
      cy.get(".cart-checkout-summary__price").contains("Woolworths items");
      cy.get(".cart-checkout-summary__price").contains(" $47.10 ");

      cy.get(".cart-checkout-summary__section > :nth-child(2)").contains(
        " Estimated delivery fee "
      );
      cy.get(".cart-checkout-summary__section > :nth-child(2)").contains(
        "$0.00 - $15.00"
      );

      cy.get(".cart-checkout-summary__section > :nth-child(3)").contains(
        " Estimated packaging fee "
      );
      cy.get(".cart-checkout-summary__section > :nth-child(3)").contains(
        "$0.00 - $2.50"
      );

      cy.get(".cart-checkout-content").contains(" $47.10 ");
      cy.get(".cart-checkout-content").contains("Excluding service fees");

      //click on checkout button
      cy.get(".cart-checkout-button > .button").click();
      cy.get(
        "wow-checkout-fulfilment-summary.ng-star-inserted > span.ng-star-inserted"
      ).contains("Auto Reg All trading 101 - 101 Red street, ARMIDALE 2350");

      //When unavailable delivery window tile
      // cy.get('.unavailable-title').contains('We\'re sorry, Delivery windows are currently closed')

      //when morning window is closed as example
      //No windows currently offered-- .no-time-slots-heading

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
