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
  // #endregion
}

export const onFMSWindowSelector = new FMSWindowSelector()