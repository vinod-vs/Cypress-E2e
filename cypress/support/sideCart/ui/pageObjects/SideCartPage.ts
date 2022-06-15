export class SideCartPage {
  // #region - General selectors
  getCloseSideCartButton () {
    return cy.get('.close-button > .iconAct-Close_Cancel')
  }

  getCloseSideCartButtonLocatorString () {
    return '.close-button > .iconAct-Close_Cancel'
  }

  getViewCartButton () {
    return cy.get('.checkout-button')
  }

  getClearEntireCartLink () {
    return cy.get('.product-actionsClearCart > span')
  }

  getConfirmClearCartLink () {
    return cy.get('shared-button[ervalue="Clear cart click"]')
  }

  getCheckoutButton () {
    return cy.get('.cart-checkout-button > .button')
  }

  getEmptyCartImage () {
    return cy.get('.empty-cart-image')
  }

  getEmptyCartTitle () {
    return cy.get('.empty-cart-title')
  }

  getTotalItemsQuantityElemnt () {
    return cy.get('.item-count-amount')
  }

  getTotalSavingAmountElement () {
    return cy.get('.total-savings-amount')
  }

  getTotalRewardsPointsElement () {
    return cy.get('.cartLoyalty-pointsTotal')
  }

  getRewardcreditscheckElement(){
    return cy.get('[id^=shared-toggle-switch]').click({ force: true }) 
    
  }

  getTotalAmountElement () {
    return cy.get('.cart-checkout-total__currency')
  }

  getSaveAsListButton () {
    return cy.get('.cartSaveList-button')
  }

  getOrderSummaryButton () {
    return cy.get('.cart-checkout-summary__heading')
  }

  getTotalAmountElementOnHeader () {
    return cy.get('#wx-header-checkout-amount')
  }
  // #endregion

  // #region - Selectors of all products
  getAllProductsNameList () {
    return cy.get('.cart-item-name')
  }

  getAllProductsDetailList () {
    return cy.get('.cart-item-details')
  }
  // #endregion

  // #region - Selectors of available products panel
  getAvailableProductsInCartPanel () {
    return cy.get('.auto_products-in-cart') 
  }

  getAvailableProductsList () {
    return this.getAvailableProductsInCartPanel().find('.cart-item-details')
  }

  getAvailableProductsNameList () {
    return this.getAvailableProductsInCartPanel().find('.cart-item-name')
  }

  getAvailableProductsDecrementButtonList () {
    return this.getAvailableProductsInCartPanel().find('.cartControls-decrementButton')
  }

  getAvailableProductsIncrementButtonList () {
    return this.getAvailableProductsInCartPanel().find('.cartControls-incrementButton')
  }

  getAvailableProductsQuantityInputList () {
    return this.getAvailableProductsInCartPanel().find('.cartControls-quantityInput')
  }

  getAvailableProductsPriceDivList () {
    return this.getAvailableProductsInCartPanel().find('.price')
  }

  getAvailableCreditItemsProductsInCartPanel (){
    return cy.get('.rewards-credits-items')
  }
  getAvailableCreditItemsProductPriceDivList(){
    return this.getAvailableCreditItemsProductsInCartPanel().find('.price')  

  }
  
  getAvailableProductsRemoveButtonList () {
    return this.getAvailableProductsInCartPanel().find('.cart-item-remove-button')
  }

  getBuyMoreSaveMoreCartItemMessageSection () {
    return this.getAvailableProductsInCartPanel().find('.cartItemMessage')
  }
  // #endregion

  // #region - Selectors of restricted products panel
  getRestrictedProductsNotificationPanel () {
    return cy.get('.auto_group-restricted-fulfilment-window')
  }

  getRestrictedProductsList () {
    return this.getRestrictedProductsNotificationPanel().find('.cart-item-details')
  }

  getRestrictedProductsNotificationParagraph () {
    return this.getRestrictedProductsNotificationPanel().find('p')
  }

  getRestrictedProductsNotificationChangeDeliveryWindowLink () {
    return this.getRestrictedProductsNotificationPanel().find('button.linkButton')
  }
  // #endregion

  // #region - Selectors of unavalialbe products panel
  getUnavailableProductsNotificationPanel () {
    return cy.get('.auto_group-restricted-location')
  }

  getUnavailableProductsList () {
    return this.getUnavailableProductsNotificationPanel().find('.cart-item-details')
  }

  getUnavailableProductsNotificationParagraph () {
    return this.getUnavailableProductsNotificationPanel().find('p.title')
  }

  getUnavailableProductsNotificationUpdateToContinueLink () {
    return this.getUnavailableProductsNotificationPanel().find('button.linkButton')
  }
  // #endregion

  // #region - General actions in side cart
  CheckIfSideCartIsOpen () {
    cy.get('.drawer').invoke('attr', 'class').should('contain', 'is-open')
  }

  CheckIfSideCartIsClosed () {
    cy.get('.drawer').invoke('attr', 'class').should('not.contain', 'is-open')
  }

  checkIfSidecartIsEmpty () {
    this.getAllProductsNameList().should('have.lengthOf', 0)
  }

  openSideCart () {
    this.getViewCartButton().click()
  }

  closeSideCart () {
    this.getCloseSideCartButton().click({ force: true })   
  }

  gotoCheckout () {
    cy.wait(500)
    cy.checkIfElementExists('.auto_group-restricted-location button.linkButton').then((result: boolean) => {
      if (result) {
        cy.get('.auto_group-restricted-location button.linkButton').click()
        cy.wait(500)
      }
    })
    this.getCheckoutButton().click()
  }

  modifyItemQuantityByName (productName: string, expectedAmount: number) {
    this.findItemDetailsByName(productName)
      .find('.cartControls-quantityInput')
      .clear()
      .type(expectedAmount.toString())
      .should('have.value', expectedAmount)
  }

  removeItemByName (productName: string) {
    this.findItemDetailsByName(productName)
      .find('.cart-item-remove-button')
      .click()
  }

  removeItemsByNames (productNameList: string[]) {
    for (const eachName of productNameList) {
      this.removeItemByName(eachName)
    }
  }

  removeAllUnavailableItems () {
    this.getUnavailableProductsNotificationUpdateToContinueLink().click()
  }

  removeAllItems () {
    cy.checkIfElementExists('.notification-group').then((result: boolean) => {
      if (result) {
        this.getAllRemoveItemButtonsForItemsUnderNotification().click({ multiple: true })
        cy.wait(500)
      }
    })

    cy.checkIfElementExists('.empty-cart-title').then((exist: boolean) => {
      if (!exist) {
        this.getClearEntireCartLink().click({ force: true })
        this.getConfirmClearCartLink().click()
        cy.wait(500)
      }
    })
  }

  cleanupTrolley () {
    this.openSideCart()
    this.removeAllItems()
    this.closeSideCart()
  }
  // #endregion

  // #endregion - private methods
  private findItemDetailsByName (productName: string) {
    return this.getAllProductsNameList()
      .should('have.lengthOf.greaterThan', 0)
      .contains(productName)
      .parents('.cart-item-details')
  }
  // #endregion

  getAllRemoveItemButtonsForItemsUnderNotification () {
    return cy.get('.notification-group').find('.cart-item-remove-button')
  }

  removeAllItemsUnderNotificationGroupsFromCart () {
    onSideCartPage.getViewCartButton().click()
    cy.wait(500)
    cy.checkIfElementExists('.notification-group').then((existanceNG: boolean) => {
      if (existanceNG) {
        onSideCartPage.getAllRemoveItemButtonsForItemsUnderNotification().click({ multiple: true })
      }
    })
    onSideCartPage.getCloseSideCartButton().click({force: true})
  }
  
  getViewCart () {
    return cy.get('.headerCheckout-checkout')
  }

  getClearUnavailbleItemsLink () {
    return '.linkButton.auto_cart-item-group-action'
  }
  
  getClearEntireCart () {
    return '.product-actionsClearCart > span'
  }
  
}
export const onSideCartPage = new SideCartPage()
