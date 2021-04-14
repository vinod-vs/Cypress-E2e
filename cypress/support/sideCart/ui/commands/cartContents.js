import HomePage from '../../../homePage/ui/pageObjects/HomePage';
import SideCartPage from '../pageObjects/SideCartPage';
import SearchResultsPage from '../../../search/ui/pageObjects/SearchResultsPage';

const homePage = new HomePage();
const sideCartPage = new SideCartPage();
const searchResultsPage = new SearchResultsPage();

Cypress.Commands.add('verifyCartContent', (test) => {
    var items = test.items
    var noOfItems = test.items.length
    cy.log('noOfItems: ' + noOfItems)
    var index = 0
    items.forEach(item => {
        cy.log('index: ' + noOfItems-index)
        cy.getTotalPriceForItem(noOfItems-index, item)
        var expectedAmount = item.pricePerItem*item.quantity;
        var actualAmount = item.totalOnUI
        cy.log('expectedAmount: ' + expectedAmount)
        cy.log('actualAmount: ' + item.totalOnUI)
        index++
    });
})

Cypress.Commands.add('getTotalPriceForItem', (index, item) => {
    cy.get(':nth-child('+ index+ ') > .cart-item > .cart-item-product > .cart-item-details > .cart-item-cart-controls-wrapper > .cart-item-cart-controls-price > .cart-item-prices-container > shared-price > .price').then(function(element) {
        var text;
        text = element.text()       
        text = text.split('$')[1]
        item.totalOnUI = text;
        cy.log("Index: " + index + " , Text: " + item.totalOnUI)        
    })
})

