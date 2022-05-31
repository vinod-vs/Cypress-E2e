import {onHomePage} from '../../../homePage/ui/pageObjects/HomePage'
import { onSearchResultsPage } from '../../../search/ui/pageObjects/SearchResultsPage'
import {onSideCartPage} from '../../../sideCart/ui/pageObjects/SideCartPage'
import {onCheckoutPage} from '../../../checkout/ui/pageObjects/CheckoutPage'



Cypress.Commands.add('verifyCartContent', (test) => {
  const items = test.items
  const noOfItems = test.items.length
  cy.log('noOfItems: ' + noOfItems)
  let index = 0
  items.forEach(item => {
    // Verify the item price (pricePerItem * quantity) or promo price
    // Get promo value if any
    cy.log('index: ' + Number(noOfItems - index))
    cy.log(JSON.stringify(test))
    // If promotion is applied
    const priceLocator = ':nth-child(' + (noOfItems - index) + ') > .cart-item > .cart-item-product > .cart-item-details > .cart-item-cart-controls-wrapper > .cart-item-cart-controls-price > .cart-item-prices-container > shared-price > .price'
    const promoLocator = ':nth-child(' + (noOfItems - index) + ') > .cart-item > .cart-item-message > div > div.cartItemMessage-content > span:contains("You\'ve saved")'
    cy.checkIfElementExists(promoLocator).then((isThereAPromotionOnTheItem) => {
      cy.log(isThereAPromotionOnTheItem)
      if (isThereAPromotionOnTheItem === true) {
        cy.get(promoLocator).then(function (promoPrice) {
          const promoPriceValue = promoPrice.text().toString().split('$')[1]
          item.promoPrice = promoPriceValue
          item.hasPromo = true
          cy.log('PromoPriceValue: ' + item.promoPrice)
          const expectedAmountAfterPromo = (Number(item.pricePerItem) * Number(item.quantity)) - Number(item.promoPrice)
          cy.log('Price after promo: ' + expectedAmountAfterPromo)
          cy.get(priceLocator).should('include.text', Number(item.pricePerItem) * Number(item.quantity) - Number(promoPriceValue))
        })
      } else {
        cy.log('nonPromo')
        const expectedAmount = item.pricePerItem * item.quantity
        cy.log('ExpectedAmount: ' + expectedAmount)
        cy.get(priceLocator).should('include.text', expectedAmount)
      }
    })
    index++
  })
  cy.log(JSON.stringify(test))
})

Cypress.Commands.add('clickToViewSideCartAndNavigateToCheckout', () => {
 //click on view cart, expand, go to checkout
 onHomePage.getViewCartButton().contains("View cart").click();
 onSideCartPage.getSideCartHeaderTitle().contains("Your Cart");
 onSideCartPage.getSaveAsListFromSideCart().contains("Save as a list");
 onSideCartPage.getRemoveAllB2B().contains("Remove all");
 onSideCartPage.getOrderSummaryButton()
   .should("be.visible")
   .contains(" Order summary ")
   .click();
})

Cypress.Commands.add('verifySideCartOrderSummary', () => {
  //click on view cart, expand, go to checkout
  onSideCartPage.getSideCartPriceTotal().contains("Woolworths items");
  onSideCartPage.getSideCartPriceTotal().contains(" $47.10 ");

      onSideCartPage.getSideCartEstimatedFee(2).contains(
        " Estimated delivery fee "
      );
      onSideCartPage.getSideCartEstimatedFee(2).contains(
        "$0.00 - $15.00"
      );

      onSideCartPage.getSideCartEstimatedFee(3).contains(
        " Estimated packaging fee "
      );
      onSideCartPage.getSideCartEstimatedFee(3).contains(
        "$0.00 - $2.50"
      );

      onSideCartPage.getSideCartTotalExclFees().contains(" $47.10 ");
      onSideCartPage.getSideCartTotalExclFees().contains("Excluding service fees");
 })

 Cypress.Commands.add('navigateToCheckoutFromSideCart', () => {
  //click on view cart, expand, go to checkout
  onSideCartPage.getCheckoutButton().click();
  onCheckoutPage.getTradingAccountInfoB2B().contains("Auto Reg All trading 101 - 101 Red street, ARMIDALE 2350");
 })