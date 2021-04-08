import HomePage from '../../pageObjects/homePage/HomePage';
import SideCartPage from '../../pageObjects/sideCart/SideCartPage';
import SearchResultsPage from '../../pageObjects/search/SearchResultsPage';

const homePage = new HomePage();
const sideCartPage = new SideCartPage();
const searchResultsPage = new SearchResultsPage();

Cypress.Commands.add('searchAndAddProductsToCart', (items) => {
    var firstTime = false;
    items.forEach(item => {
        cy.log("Adding item: " + item.StockCode + ", of quantity: " + item.Quantity + " to cart.")
        //Search for the desired item
        homePage.getSearchHeader().click()
        homePage.getSearchHeader().type(item.StockCode).type("{enter}")
        //Add item with desired quantity to the cart

        //Adding item once
        cy.get('.cartControls-addCart').click();
        //Side cart is opened when first item is added. To close it, force click on the search box again
        if (firstTime == false) {
            cy.wait(500);
            sideCartPage.getCloseSideCartButton().click()
            cy.wait(500);
            firstTime = true;
        }

        //Adding remaining quantity
        var i;
        for (i = 1; i < item.Quantity; i++) {
            searchResultsPage.getIncreaseQuantityButton().eq(0).click()
            cy.wait(500);
        }

        //Verify the right quantity is added
        cy.get('.cartControls-quantityInput').then(function (quantityElement) {
            const quantity = quantityElement.text();
            cy.log('Quantity added: ' + quantity)
        })
        cy.wait(1000);

        //Clear search
        homePage.getClearSearchHeader().click()
        cy.wait(1000);

        //TO-DO verify the desired item and quantity is added to cart
    });
})
