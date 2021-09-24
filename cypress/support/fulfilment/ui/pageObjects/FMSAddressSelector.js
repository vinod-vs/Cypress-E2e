export class FMSAddressSelector {
  // #region - Tabs
  getTabList () {
    return cy.get('.tab-list')
  }

  getDeliveryTab () {
    return this.getTabList().find('li').eq(0)
  }

  getPickupTab () {
    return this.getTabList().find('li').eq(1)
  }

  getDirectToBootTab () {
    return this.getTabList().find('li').eq(2)
  }
  // #endregion

  // #region - Delivery address UI elements
  getSharedTextBox () {
    return cy.get('shared-textbox')
  }

  getSavedAddressesList () {
    return cy.get('.saved-addresses')
  }

  getSavedAddressesListLabel () {
    return this.getSavedAddressesList().find('label')
  }

  getAddNewDeliveryAddressButton () {
    return this.getSavedAddressesList().find('.add-address-button')
  }

  getPreviousAddressesButtonLink () {
    return cy.get('.linkButton')
  }

  getSearchAddressSelectorTextbox () {
    return this.getSharedTextBox().find('#deliveryAddressSelector')
  }

  getSearchAddressResultList () {
    return cy.get('#deliveryAddressSelector-listbox > li > div')
  }
  // #endregion

  // #region - Pick / DTB UI elements
  getSearchStoreSelectorTextbox () {
    return this.getSharedTextBox().find('#pickupAddressSelector')
  }

  getChangeServiceLink () {
    return cy.get('shared-tab-group').find('a')
  }

  getSuburbResultList () {
    return cy.get('#pickupAddressSelector-listbox > li > div')
  }

  getSearchStoreResultList () {
    return cy.get('.stores > label')
  }
  // #endregion

  getSaveAndContinueButton () {
    return cy.get('.shopper-action')
  }

  selectSavedAddressByKeyword (addressKeyword) {
    this.getSavedAddressesListLabel().each(addressRow => {
      const addressText = addressRow.find('label').text()

      if (addressText.includes(addressKeyword)) {
        cy.wrap(addressRow).find('input').check({ force: true })
        return false
      }
    })
  }

  searchForNewAddress (addressKeyword) {
    this.getSearchAddressSelectorTextbox().type(addressKeyword)

    this.getSearchAddressResultList().each(resultOption => {
      const suggestedAddressText = resultOption.find('span').text()

      if (suggestedAddressText.toLowerCase().includes(addressKeyword.toLowerCase())) {
        cy.wrap(resultOption).click()
        return false
      }
    })
  }

  searchForStoreBySuburbName (suburbName) {
    this.getSearchStoreSelectorTextbox().type(suburbName)

    this.getSuburbResultList().first().click()

    this.getSearchStoreResultList().each(resultOption => {
      const suggestedStore = resultOption.children('span:nth-child(0)').text()

      if (suggestedStore.toLowerCase().includes(suburbName.toLowerCase())) {
        cy.wrap(resultOption).find('input').check({ force: true })
        return false
      }
    })
  }

  searchForStoreByPostcode (postcode) {
    this.getSearchStoreSelectorTextbox().type(postcode)

    // it's a bit farfetched to choose the first result from list as below.
    // but if we want to make sure automation select the correct suburb by given postcode,
    // we may need a libary to validate the suburb name in result list with postcode.
    this.getSearchStoreResultList().first().find('input').check({ force: true })
  }
}

export const onFMSAddressSelector = new FMSAddressSelector()
