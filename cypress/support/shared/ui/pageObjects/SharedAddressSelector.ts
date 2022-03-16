export class SharedAddressSelector{
  // #region - Tabs
  getFullfilmentPane (){
    return cy.get('.drawer')
  }

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
    return cy.get('[class*="linkButton fulfilment-button"]')
  }

  getSearchAddressSelectorTextbox () {
    return cy.get('#deliveryAddressSelector')
  }

  getSearchAddressResultList () {
    return cy.get('#deliveryAddressSelector-listbox > li > div')
  }

  getDeliveryFullfilmentSelectorForFirstTimeShopper() {
    return cy.get('#fulfilmentSelection0')
  }

  getPickupFullfilmentSelectorForFirstTimeShopper() {
    return cy.get('#fulfilmentSelection1')
  }

  getDTBFullfilmentSelectorForFirstTimeShopper() {
    return cy.get('#fulfilmentSelection2')
  }
  // #endregion

  // #region - Pick / DTB UI elements
  getSearchStoreSelectorTextbox () {
    return cy.get('#pickupAddressSelector')
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

  // #region - General actions
  chooseFulfilmentOptionForFirstTimeCustomer(fulfilmentOption: string){
    if (fulfilmentOption.toUpperCase().includes('DELIVERY')){
      this.getDeliveryFullfilmentSelectorForFirstTimeShopper().click()
    }
    else if (fulfilmentOption.toUpperCase().includes('PICKUP')){
      this.getPickupFullfilmentSelectorForFirstTimeShopper().click()
    }
    else if (fulfilmentOption.toUpperCase().includes('DTB') || fulfilmentOption.toUpperCase().includes('DIRECT')){
      this.getDTBFullfilmentSelectorForFirstTimeShopper().click()
    }
    else{
      throw new Error('not recongnised fulfilment option: ' + fulfilmentOption)
    }

    this.getSaveAndContinueButton().click()
  }

  selectSavedDeliveryAddressByKeyword (addressKeyword: string) {
    this.getSavedAddressesListLabel().each(addressRow => {
      const addressText = addressRow.find('label').text()

      if (addressText.includes(addressKeyword)) {
        cy.wrap(addressRow).find('input').check({ force: true })
        return false
      }
    })
  }

  searchForNewDeliveryAddress (addressKeyword: string) {
    this.getSearchAddressSelectorTextbox().type(addressKeyword)

    this.getSearchAddressResultList().each(resultOption => {
      const suggestedAddressText = resultOption.find('span').text().replace(/  /g, ' ').trim()
      const trimmedAddressKeyword = addressKeyword.replace(/  /g, ' ').trim()

      if (suggestedAddressText.toLowerCase().includes(trimmedAddressKeyword.toLowerCase())) {
        cy.wrap(resultOption).click()
        return false
      }
    })
  }

  searchForStoreBySuburbName (suburbName: string) {
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

  searchForStoreByPostcode (postcode: number) {
    this.getSearchStoreSelectorTextbox().type(postcode.toString())

    // it's a bit farfetched to choose the first result from list as below.
    // but if we want to make sure automation select the correct suburb by given postcode,
    // we may need a libary to validate the suburb name in result list with postcode.
    this.getSearchStoreResultList().first().find('input').check({ force: true })
  }

  // Please be aware using below function might miss out the protential defects on FMS Delivery Tab !!!
  // More conditions we handles on UI behaviours means more chance to skip the protential risk.
  // This is only for bringing ease to the test script which would like having a general function as a tool to select delivery address but check point is somewhere else.
  selectDeliveyAddress (deliveryAddress: string) {
    //Select the delivery address if its existing or enter if it doesnot already exist or enter the address if user is first time shopper
    var deliveryAddressForSearch = deliveryAddress.toString().substring(0, deliveryAddress.lastIndexOf(" "))
    deliveryAddressForSearch = deliveryAddressForSearch.substring(0, deliveryAddress.lastIndexOf(" "))
    var deliveryAddressToSelect = deliveryAddress.toString().substring(deliveryAddress.indexOf(','), deliveryAddress.length)
    
    this.getFullfilmentPane().then(($ffPane) => {
      if($ffPane.find('label:contains('+deliveryAddressForSearch+')').length > 0){
        this.selectSavedDeliveryAddressByKeyword(deliveryAddressForSearch)
      }
      else if ($ffPane.find('button.add-address-button').length > 0) {
        this.getAddNewDeliveryAddressButton().click()
        this.searchForNewDeliveryAddress(deliveryAddressForSearch)
      }
      else if ($ffPane.find('input#deliveryAddressSelector').length > 0) {
        this.searchForNewDeliveryAddress(deliveryAddressForSearch)
      }
    }) 
    // click on savecontinue button
    this.getSaveAndContinueButton().click() 
  }
  // #endregion
}