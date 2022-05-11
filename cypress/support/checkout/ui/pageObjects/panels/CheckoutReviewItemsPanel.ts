export class CheckoutReviewItemsPanel {
  // #region - General selectors
  getContinueButton () {
    return cy.get('button.shopper-action').contains('Continue')
  }

  getOrderReviewErrorParagraph () {
    return cy.get('wow-checkout-order-review-errors p')
  }

  getOrderReviewChangeSelectionLink () {
    return cy.get('wow-checkout-order-review-card .linkButton')
  }

  getPackageOptionReusableBagsButton () {
    return cy.get('wow-checkout-packaging-selector button').contains('Reusable bags')
  }

  getPackageOptionPaperBagsButton () {
    return cy.get('wow-checkout-packaging-selector button').contains('Paper bags')
  }

  // #endregion

  // #region - Selectors of all products
  getAllProductsDetailsList () {
    return cy.get('.cart-item')
  }

  getAllProductsNameList () {
    return cy.get('.cart-item-link')
  }
  // #endregion

  // #region - Selectors of all available products
  getAvailableProductsPanel () {
    return cy.get('.auto_product-cart-section')
  }

  getAvailableProductsDetailsList () {
    return this.getAvailableProductsPanel().find('.cart-item')
  }
  // #endregion

  // #region - Selectors of grocery products
  getGroceryItemsTotalPaymentAmount () {
    return cy.get('wow-checkout-order-review .woolworths .payment-amount .amount')
  }

  getAvailableGroceryProductsDetailsList () {
    return this.getAvailableProductsPanel().children('wow-cart-item-checkout').find('.cart-item')
  }
  // #endregion

  // #region - Selectors of everyday market products
  getMarketProductsPanel () {
    return cy.get('wow-checkout-grouped-market-product-list')
  }

  getAvailableMarketProductsDetailsList () {
    return this.getMarketProductsPanel().find('.cart-item')
  }
  // #endregion

  // #region - Selectors of restricted products panel
  getRestrictedProductsNotificationPanel () {
    return cy.get('.auto_group-restricted-fulfilment-window')
  }

  getRestrictedProductsDetailsList () {
    return this.getRestrictedProductsNotificationPanel().find('.cart-item')
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
    return this.getUnavailableProductsNotificationPanel().find('.cart-item')
  }

  getUnavailableProductsNotificationParagraph () {
    return this.getUnavailableProductsNotificationPanel().find('p.title')
  }

  getUnavailableProductsNotificationRemoveItemsLink () {
    return this.getUnavailableProductsNotificationPanel().find('button.linkButton')
  }
  // #endregion

  // #region - General actions in checkout page
  modifyItemQuantityByName (productName: string, expectedAmount: number) {
    this.findItemDetailsByName(productName)
      .find('.cartControls-quantityInput')
      .clear()
      .type(expectedAmount.toString())
      .should('have.value', expectedAmount)
  }

  removeItemByName (productName: string) {
    this.findItemDetailsByName(productName)
      .find('.remove-button')
      .click()
  }

  removeItemsByNames (productNameList: string[]) {
    for (const eachName of productNameList) {
      this.removeItemByName(eachName)
    }
  }

  removeAllUnavailableItems () {
    this.getUnavailableProductsNotificationRemoveItemsLink().click()
  }

  changeSubstitutionsByProductName (productName: string, expectedValue: boolean) {
    this.findItemDetailsByName(productName)
      .find('shared-checkbox').then(sharedCheckbox => {
        cy.wrap(sharedCheckbox).invoke('attr', 'data-checked').then(dataCheckedAttribute => {
          if ((dataCheckedAttribute === 'true') != expectedValue) {
            cy.wrap(sharedCheckbox).click()
          }
        })
      })

    this.findItemDetailsByName(productName)
      .find('shared-checkbox').invoke('attr', 'data-checked').then(dataCheckedAttribute => {
        if ((dataCheckedAttribute === 'true') != expectedValue) {
          throw new Error('test failed because not able to set substitutions')
        }
      })
  }

  addOrEditPersonalShopperNoteToProduct (productName: string, shopperNotes: string) {
    this.findItemDetailsByName(productName)
      .find('shared-product-note').click()
      .find('shared-textbox input').clear().type(shopperNotes).should('have.value', shopperNotes)
      .parents('shared-product-note')
      .find('shared-button button').click()
  }

  changeGroceriesPackageOption (packageOption: string) {
    this.getOrderReviewChangeSelectionLink().invoke('attr', 'aria-expanded').then(ariaExpandedAttribute => {
      if (ariaExpandedAttribute == 'false') {
        this.getOrderReviewChangeSelectionLink().click()
      }
    })

    if (packageOption.toLowerCase().includes('reusable')) {
      this.getPackageOptionReusableBagsButton().click()
    } else if (packageOption.toLowerCase().includes('paper')) {
      this.getPackageOptionPaperBagsButton().click()
    } else {
      throw new Error('test fails because package option is not matching')
    }
  }
  // #endregion

  // #endregion - private methods
  private findItemDetailsByName (productName: string) {
    return this.getAllProductsNameList()
      .should('have.lengthOf.greaterThan', 0)
      .contains(productName)
      .parents('.cart-item')
  }
  // #endregion
}

export const onCheckoutReviewItemsPanel = new CheckoutReviewItemsPanel()
