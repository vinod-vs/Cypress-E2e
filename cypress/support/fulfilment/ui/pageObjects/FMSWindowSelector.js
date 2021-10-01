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

  selectLatestAvailableDay () {
    this.selectDayByKeyword()
  }
  // #endregion

  // #region - General actions
  selectDayByKeyword (dayKeyword) {
    cy.get('.day-dropdown > option')
      .contains(dayKeyword)
      .then(dayOption => {
        cy.wrap(dayOption).parent().select(dayOption.text())
    })
  }

  selectTimeSlotByTime (startTime, endTime = 'undefined') {
    this.#selectTimeSlotStartFromIndex(0, startTime, endTime)
  }

  selectFirstTimeslot () {
    this.getAllTimeSlotList().first().find('input').check({ force: true })
  }

  selectLastTimeslot () {
    this.getAllTimeSlotList().last().find('input').check({ force: true })
  }
  // #endregion

  // #region - private methods
  #selectTimeSlotStartFromIndex (index, startTime, endTime = 'undefined') {
    let found = false

    this.getAllTimeSlotList().its('length').then(len => {
      if (index >= len) {
        throw new Error('Test failed. Unable to find given time slot: ' + startTime + ' to ' + endTime)
      }

      this.getAllTimeSlotList().eq(index).find('.time-slot-text').invoke('text').then(windowTimeText => {
        const startTimeOnLabel = windowTimeText.substring(0, windowTimeText.indexOf('to')).trim()
        const endTimeOnLabel = windowTimeText.substring(windowTimeText.indexOf('to') + 2).trim()

        if (startTimeOnLabel.toLowerCase() == startTime.toLowerCase() && (endTime == 'undefined' || endTimeOnLabel.toLowerCase() == endTime.toLowerCase())) {
          this.getAllTimeSlotList().eq(index).find('input').check({ force: true })
          found = true
          return false
        }
      })
        .then(() => {
          if (!found) {
            this.#selectTimeSlotStartFromIndex(++index, startTime, endTime)
          }
        })
    })
  }
  // #endregion
}

export const onFMSWindowSelector = new FMSWindowSelector()
