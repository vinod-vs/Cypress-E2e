export class FMSWindowSelector {
  // #region - Selectors
  getDayDropdown () {
    return cy.get('.day-dropdown')
  }

  getContinueShoppingButton () {
    return cy.get('.shopper-action')
  }

  getMorningTimeSlotList () {
    return cy.get('wow-time-slots-column-side-cart').eq(0).get('.time-slot-list > section > div')
  }

  getAfternoonTimeSlotList () {
    return cy.get('wow-time-slots-column-side-cart').eq(1).get('.time-slot-list > section > div')
  }

  getEveningTimeSlotList () {
    return cy.get('wow-time-slots-column-side-cart').eq(2).get('.time-slot-list > section > div')
  }

  getAllTimeSlotList () {
    return cy.get('.time-slot-list > section > div')
  }

  selectSameDay () {
    this.selectDayByKeyword('Today')
  }

  selectNextDay () {
    this.selectDayByKeyword('Tomorrow')
  }

  selectNextAvailableDay () {
    cy.get('.day-dropdown > option')
      .each(dayOption => {
        if(!dayOption.prop('disabled'))
        {
          cy.wrap(dayOption).parent().select(dayOption.text())
          return false;
        }
      })
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
  
  getSelectTradingAccountList () {
    return cy.get('#deliveryAddressSelector')
  }
  // #endregion

  // #region - General actions
  selectDayByKeyword (dayKeyword: string) {
    cy.get('.day-dropdown > option')
      .contains(dayKeyword)
      .then(dayOption => {
        cy.wrap(dayOption).parent().select(dayOption.text())
    })
  }

  selectTimeSlotByTime (startTimeString: string, endTimeString = 'undefined') {
    this.selectTimeSlotStartFromIndex(0, startTimeString, endTimeString)
  }

  selectFirstTimeslot () {
    this.getAllTimeSlotList().first().find('input').check({ force: true })
    cy.wait(500)
  }

  selectLastTimeslot () {
    this.getAllTimeSlotList().last().find('input').check({ force: true })
    cy.wait(500)
  }
  // #endregion

  // #region - private methods
  private selectTimeSlotStartFromIndex (index: number, startTimeString: string, endTimeString = 'undefined') {
    let found = false

    this.getAllTimeSlotList().its('length').then(len => {
      if (index >= len) {
        throw new Error('Test failed. Unable to find given time slot: ' + startTimeString + ' to ' + endTimeString)
      }

      this.getAllTimeSlotList().eq(index).find('.time-slot-text').invoke('text').then(windowTimeText => {
        const startTimeOnLabel = windowTimeText.substring(0, windowTimeText.indexOf('to')).trim()
        const endTimeOnLabel = windowTimeText.substring(windowTimeText.indexOf('to') + 2).trim()

        if (startTimeOnLabel.toLowerCase() == startTimeString.toLowerCase() && (endTimeString == 'undefined' || endTimeOnLabel.toLowerCase() == endTimeString.toLowerCase())) {
          this.getAllTimeSlotList().eq(index).find('input').check({ force: true })
          found = true
          return false
        }
      })
        .then(() => {
          if (!found) {
            this.selectTimeSlotStartFromIndex(++index, startTimeString, endTimeString)
          }
        })
    })
    cy.wait(500)
  }

  //This method selects given fullfilment method for an existing or new user
  private selectFullfilmentMethod(fullfilmentMethod: string)
  {
    if(fullfilmentMethod.toUpperCase().indexOf("DELIVERY")>=0)
    {
      //click on change delivery address link
      this.getChangeDeliveryAddressLink().click({force:true})
      //if user is logging in for first time, select a different delivery button otherwise click on delivery tab in fullfilment method selection pane
      this.getFullfilmentPane().then(($ffPane) => {
      if($ffPane.find('input#fulfilmentSelection0').length>0){
        this.getDeliveryFullfilmentSelectorForFirstTimeShopper().click({force: true})
        this.getSaveContinueButton().click()
      }
      else{
        this.getFullfilmentTabForDelivery().click()
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
  private selectAnAvailableFullfilmentWindow()
  {
    //verify user is on delivery window selection page within fullfilment pane
    this.getSelectFullfilmentTimeHeading().should('contain.text', 'Select a day then a time')
    //select a delivery date in drop down that is not today, not tomorrow, not labled as 'Closed' or not labled as 'select a day'
    this.getSelectDateDropdownOptions().each(($ele) => {
      if (!($ele.text().includes('Select a day') || $ele.text().includes('Today') || $ele.text().includes('Tomorrow') || $ele.text().includes('Closed'))) {
        this.getSelectDateDropdown().select($ele.text())
        return false; //to break the loop
      }
    })
    //click on first delivery time slop (which is not marked as delivery now)
    this.getLastDeliveryTimeSlot().click({force:true})
    //wait
    cy.wait(2000)
  }
  // #endregion

  //This method selects given delivery address and a first available window which is not in today, tomorrow and not delivery now
  selectDeliveyAddressAndRandomWindow (deliveryAddress: string) {
    //==========selecting fullfilment method as delivery and adding delivery address========
    this.selectFullfilmentMethod('Delivery')
    //wait for addresses to load
    cy.wait(2000)
    //Select the delivery address if its existing or enter if it doesnot already exist or enter the address if user is first time shopper
    var $deliveryAddressForSearch = deliveryAddress.toString().substring(0, deliveryAddress.lastIndexOf(" "))
    $deliveryAddressForSearch = $deliveryAddressForSearch.substring(0, deliveryAddress.lastIndexOf(" "))
    var $deliveryAddressToSelect = deliveryAddress.toString().substring(deliveryAddress.indexOf(','), deliveryAddress.length)
    
    this.getFullfilmentPane().then(($ffPane) => {
      if($ffPane.find('label:contains('+$deliveryAddressForSearch+')').length>0){
        this.getSavedAddressOption().contains($deliveryAddressForSearch).siblings('.wowRadio').click({force: true})
      }
      else if ($ffPane.find('button.add-address-button').length>0) {
        this.getAddAddressButtonForDelivery().click()
        this.getSelectTradingAccountList().type(deliveryAddress)
        this.getFirstAddressInLookupDropdown().contains($deliveryAddressToSelect).click()
      }
      else if ($ffPane.find('input#deliveryAddressSelector').length>0) {
        this.getSelectTradingAccountList().type(deliveryAddress)
        this.getFirstAddressInLookupDropdown().contains($deliveryAddressToSelect).click()
      }
    }) 
    // click on savecontinue button
    this.getSaveContinueButton().click() 
    //=========select delivery window==============
    this.selectAnAvailableFullfilmentWindow()
    // click on savecontinue button
    this.getContinueShoppingButton().click() 
  }
}

export const onFMSWindowSelector = new FMSWindowSelector()
