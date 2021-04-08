/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />
import 'cypress-iframe'
import shoppers from '../../fixtures/everydayMarket/shoppers.json'
import items from '../../fixtures/everydayMarket/addItemsToTrolley.json'
import '../../support/ui/login/login'
import '../../support/ui/sideCart/clearTrolley'
import '../../support/ui/search/searchAndAddProduct'
import '../../support/ui/utilities/utility'

// likely want to do this in a support file
// so it's applied to all spec files
// cypress/support/index.js

//Required to ignore uncaught exceptions thrown by the application else tests will fail on an occurances
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Place an order using paypal', () => {

    //pre-requisite to clear all cookies before login
    before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })
    it('Place an order using paypal', () => {

        //Login 
        cy.loginViaUi(shoppers[0].EM1)
        //Open login page
        //cy.visit("https://uatsite.woolworths.com.au/shop/securelogin");
        //cy.url().should('include', '/securelogin')

        //Enter credentials and login
        //cy.get('#loginForm-Email').type(accounts[0].email)//.should('have.vaue', 'rjagadish+uat1@woolworths.com.au');
        //cy.get('#loginForm-Password').type(accounts[0].password)//.should('have.vaue', '******');
        //cy.get('.primary-legacy').click()
        //cy.url().should('not.include', '/securelogin')

        //clear cart if required
        cy.clearTrolley()
        //open cart if it has >0 amount and clear it
        // cy.get('.headerCheckout-orderAmount').then(function (cartElement) {
        //     cy.log(cartElement.text())
        //     const cartAmount = cartElement.text();
        //     if (cartAmount.includes('$0')) {
        //         cy.log('Cart has no items. Cart Value: ' + cartAmount)
        //     } else {
        //         cy.log('Cart has some items.  Cart Value: ' + cartAmount + '. Removing them.')
        //         cy.get('.headerCheckout-orderHeader button').click();
        //         cy.get('.product-actionsClearCart > span').click();
        //         cy.wait(1000);
        //         cy.get('.primary').click();
        //         cy.wait(1000);
        //         cy.get('.close-button').click();
        //         cy.wait(1000);
        //     }
        // })

        
        cy.searchAndAddProductsToCart(items.Test1)
        
        //Add MP item to cart
        // cy.get('#headerSearch').click()
        // cy.get('#headerSearch').type('1073741886').type("{enter}")
        // cy.get('.cartControls-addCart').click();
        // cy.wait(1000);
        // //TO-DO verify the item is added
        // //TO-DO add desired quantity

        // //Close cart buttom
        // cy.get(".close-button > .iconAct-Close_Cancel").click()

        // //Clear search
        // cy.get('.headerSearch-actionButton').click()

        // //Add another MP item to cart    
        // cy.get('#headerSearch').click()
        // cy.get('#headerSearch').type('1073741884').type("{enter}")
        // cy.get('.cartControls-addCart').click();
        // cy.wait(1000);
        // //TO-DO verify the item is added

        // //Open cart
        // cy.get('.headerCheckout-orderHeader > .button').click()
        //TO-DO Add verification for items added to cart and calculate amount

        //Add WOW item to cart
        //cy.get('#headerSearch').type('{del}{selectall}{backspace}')
        //cy.get('#headerSearch').type('42605').type("{enter}")
        //cy.get('.cartControls-addCart').click();

        cy.viewCart();
        cy.clickCheckout();
        //Click checkout button on side cart
        //cy.get('.headerCheckout-orderHeader > .button').click()
        //cy.url().should('include', '/checkout');
        //cy.wait(1000);

        //TO-DO Check and Select delivery address        

        //Select third delivery slot
        cy.get(".dates-container-inner > :nth-child(4)").click();
        cy.wait(1000);
        cy.get(':nth-child(2) > .time-slot-list > :nth-child(2) > .time-slot').click();
        cy.wait(1000);
        cy.scrollTo('bottom');
        cy.wait(1000);

        //Click time slot save details
        cy.get('.panel-actions-button > .shopper-action > .ng-star-inserted').click({ multiple: true });
        cy.wait(1000);

        //Click save details for items
        //cy.get('.panel-actions-button > .shopper-action > .ng-star-inserted').scrollIntoView({ offset: { top: 150, left: 0 } });
        cy.scrollTo('bottom');
        cy.wait(1000);
        cy.get('.panel-actions-button > .shopper-action > .ng-star-inserted').click();
        cy.wait(1000);

        //TO-DO verify cart total

        //TO-DO option to select different payment mentods

        //Click place order
        cy.get('.auto_place-order > .shopper-action').click();
        cy.wait(1000);

        //Verify order confirmation page
        cy.log('Order placed! Order details: ' + cy.url());
        cy.get('.confirmation-container__header').should('be.visible').and('have.text', 'Order received')
        cy.url().should('include', '/confirmation');
        cy.getTextFromElement('.confirmation-container__header')
        //cy.get('.confirmation-container__header').then(function (logoelement) {
        //    cy.log(logoelement.text())
        //})

        //TO-DO verify the items and mount on order confirmation page

    })
})