export class DeliveryDateAndWindowPage {
  getWowfulfilmentMethodContainer () {
    return cy.get('wow-fulfilment-method-selector-container')
  }

  getTodaysShoppingPreferenceLocatorString () {
    return 'h3.selected-fulfilment-method--subHeading'
  }

  getChangeTradingAccountLink () {
    return cy.get('button.selected-fulfilment-method--editButton')
  }

  getSelectTradingAccountList () {
    return cy.get('#deliveryAddressSelector')
  }

  getTheFirstTradingAccount () {
    return cy.get('#deliveryAddressSelector-option1')
  }

  getSaveAndContinueButton () {
    return cy.get('button.shopper-action span')
  }

  getSelectDate () {
    return cy.get('select.day-dropdown').select('3: Object')
  }

  getthefirsttimeslot () {
    return cy.get('input.wowRadio').first()
  }

  getContinueShoppingButton () {
    return cy.get('button.shopper-action').contains('Continue shopping')
  }

  getChangeDeliveryAddressLink (){
    return cy.get('.header-fulfilment__section-arrow > span').first()
  }

  getFullfilmentPane (){
    return cy.get('.drawer')
  }

  getDeliveryFullfilmentSelectorForFirstTimeShopper() {
    return cy.get('#fulfilmentSelection0')
  }

  getSaveContinueButton() {
    return cy.get('.shopper-action').contains('Save & continue')
  }

  getFullfilmentTabForDelivery() {
    return cy.get('.fm-name').contains('Delivery')
  }

  getSavedAddressOption() {
    return cy.get('.saved-address')
  }

  getAddAddressButtonForDelivery() {
    return cy.get('.add-address-button')
  }

  getFirstAddressInLookupDropdown() {
    return cy.get('span.primary-text')
  }

  getSelectFullfilmentTimeHeading() {
    return cy.get('.time-slot-title')
  }

  getSelectDateDropdownOptions() {
    return cy.get('select.day-dropdown option')
  }

  getSelectDateDropdown() {
    return cy.get('select.day-dropdown')
  }

  getFirstDeliveryTimeSlot() {
    return cy.get('.time-slot-badge-container').children().should('not.have.class', '.badge pink delivery-now ng-star-inserted').first()
  }

  getLastDeliveryTimeSlot() {
    return cy.get('.time-slot-badge-container').children().should('not.have.class', '.badge pink delivery-now ng-star-inserted').last()
  }

  //This method selects given fullfilment method for an existing or new user
  selectFullfilmentMethod(fullfilmentMethod: string)
  {
    if(fullfilmentMethod.toUpperCase().indexOf("DELIVERY")>=0)
    {
      //click on change delivery address link
      onDeliveryDateAndWindowPage.getChangeDeliveryAddressLink().click({force:true})
      //if user is logging in for first time, select a different delivery button otherwise click on delivery tab in fullfilment method selection pane
      onDeliveryDateAndWindowPage.getFullfilmentPane().then(($ffPane) => {
      if($ffPane.find('input#fulfilmentSelection0').length>0){
        onDeliveryDateAndWindowPage.getDeliveryFullfilmentSelectorForFirstTimeShopper().click({force: true})
        onDeliveryDateAndWindowPage.getSaveContinueButton().click()
      }
      else{
        onDeliveryDateAndWindowPage.getFullfilmentTabForDelivery().click()
      }
      })
    }
    else if(fullfilmentMethod.toUpperCase().indexOf("PICK")>=0){
      //To write similar code for pick up
    }
    else if(fullfilmentMethod.toUpperCase().indexOf("DIRECT TO BOOT")>=0){
      //To write similar code for DTB
    }
  }

  //This method selects first available window which is not in today, tomorrow and not a delivery now window
  selectAnAvailableFullfilmentWindow()
  {
    //verify user is on delivery window selection page within fullfilment pane
    onDeliveryDateAndWindowPage.getSelectFullfilmentTimeHeading().should('contain.text', 'Select a day then a time')
    //select a delivery date in drop down that is not today, not tomorrow, not labled as 'Closed' or not labled as 'select a day'
    onDeliveryDateAndWindowPage.getSelectDateDropdownOptions().each(($ele) => {
      if (!($ele.text().includes('Select a day') || $ele.text().includes('Today') || $ele.text().includes('Tomorrow') || $ele.text().includes('Closed'))) {
        onDeliveryDateAndWindowPage.getSelectDateDropdown().select($ele.text())
        return false; //to break the loop
      }
    })
    //click on first delivery time slop (which is not marked as delivery now)
    onDeliveryDateAndWindowPage.getLastDeliveryTimeSlot().click({force:true})
    //wait
    cy.wait(2000)
  }

  //This method selects given delivery address and a first available window which is not in today, tomorrow and not delivery now
  selectDeliveyAddressAndRandomWindow (deliveryAddress: string) {
    //==========selecting fullfilment method as delivery and adding delivery address========
    onDeliveryDateAndWindowPage.selectFullfilmentMethod('Delivery')
    //wait for addresses to load
    cy.wait(2000)
    //Select the delivery address if its existing or enter if it doesnot already exist or enter the address if user is first time shopper
    var $deliveryAddressForSearch = deliveryAddress.toString().substring(0, deliveryAddress.lastIndexOf(" "))
    $deliveryAddressForSearch = $deliveryAddressForSearch.substring(0, deliveryAddress.lastIndexOf(" "))
    var $deliveryAddressToSelect = deliveryAddress.toString().substring(deliveryAddress.indexOf(','), deliveryAddress.length)
    
    onDeliveryDateAndWindowPage.getFullfilmentPane().then(($ffPane) => {
      if($ffPane.find('label:contains('+$deliveryAddressForSearch+')').length>0){
        onDeliveryDateAndWindowPage.getSavedAddressOption().contains($deliveryAddressForSearch).siblings('.wowRadio').click({force: true})
      }
      else if ($ffPane.find('button.add-address-button').length>0) {
        onDeliveryDateAndWindowPage.getAddAddressButtonForDelivery().click()
        onDeliveryDateAndWindowPage.getSelectTradingAccountList().type(deliveryAddress)
        onDeliveryDateAndWindowPage.getFirstAddressInLookupDropdown().contains($deliveryAddressToSelect).click()
      }
      else if ($ffPane.find('input#deliveryAddressSelector').length>0) {
        onDeliveryDateAndWindowPage.getSelectTradingAccountList().type(deliveryAddress)
        onDeliveryDateAndWindowPage.getFirstAddressInLookupDropdown().contains($deliveryAddressToSelect).click()
      }
    }) 
    // click on savecontinue button
    onDeliveryDateAndWindowPage.getSaveContinueButton().click() 
    //=========select delivery window==============
    onDeliveryDateAndWindowPage.selectAnAvailableFullfilmentWindow()
    // click on savecontinue button
    onDeliveryDateAndWindowPage.getContinueShoppingButton().click() 
  }
}

export const onDeliveryDateAndWindowPage = new DeliveryDateAndWindowPage()
