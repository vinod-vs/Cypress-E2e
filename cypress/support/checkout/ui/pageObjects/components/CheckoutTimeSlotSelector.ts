import '../../../../utilities/ui/utility'

/**
 * CheckoutTimeSlotSelector component is a representation of the fulfilment window selection component for Pick up &
 * Delivery. It can be identified by the element "wow-checkout-time-slot-selector" (Note it also includes the child
 * component for the window selection itself, identified by "wow-checkout-time-slot-time"). This can be re-used
 * outside of checkout, as the immediate child is "wow-time-slot-selector".
 */
export class CheckoutTimeSlotSelector {
  dayDescription = '.day-description'
  timeSlot = '.time-slot'
  crowdSourced = '.crowd-sourced'
  timeSpan = '.time-span'

  private getAllDaysElList() {
    return cy.get('.dates-container-outer').find('.day')
  }

  private getDayEl(day: string) {
    return this.getAllDaysElList()
      .find(this.dayDescription)
      .filter(`:contains(${day})`)
  }

  private getAllAvailableDaysElList(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getAllDaysElList().not('.closed')
  }

  private getAllAvailableNextDayElList(): Cypress.Chainable<
    JQuery<HTMLElement>
  > {
    return this.getAllAvailableDaysElList()
      .find(this.dayDescription)
      .not(':contains("Today")')
  }

  private getWindowElList(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.timeSlot)
  }

  private getSelectedWindowEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getWindowElList().filter('.selected')
  }

  private selectRandomWindow(windowElList: any) {
    windowElList[Math.floor(Math.random() * windowElList.length)].click()
  }

  private selectDayHavingFleetWindow(startIndex: number) {
    let found = false

    this.getAllAvailableNextDayElList()
      .as('dayList')
      .its('length')
      .then((len) => {
        if (startIndex >= len) {
          throw new Error(
            'Test failed. Unable to find day with available fleet window(s)'
          )
        }

        cy.get('@dayList')
          .eq(startIndex)
          .click()
          .then(() => {
            const totalWindowLength = Cypress.$(this.timeSlot).length
            const crowdWindowLength = Cypress.$(
              this.timeSlot + ' ' + this.crowdSourced
            ).length

            if (totalWindowLength !== crowdWindowLength) {
              found = true
              return false
            }
          })
          .then(() => {
            if (!found) {
              this.selectDayHavingFleetWindow(++startIndex)
            }
          })
      })
  }

  /**
   * Select a Next Day window (Delivery, Pick up/Direct to boot). For Delivery, it'll filter out
   * Crowd windows so only Fleet will be selected
   */
  public selectNextDayWindow() {
    this.selectDayHavingFleetWindow(0)

    cy.get(this.timeSlot).each((eachTimeSlot) => {
      if (!eachTimeSlot.find(this.crowdSourced).length) {
        cy.wrap(eachTimeSlot).click()
        return false
      }
    })
  }

  /**
   * Select a window by a particular day and time.
   * Availability of window must be known in advance, and formatted correctly for the FE to select.
   * Use a Cypress command such as 'selectRandomWindowInCheckout' tofilter /windows based on a
   * fulfilment type and window type, and format parameters correctly for FE selection.
   *
   * @param day day to select, e.g. 'Today' or 'Thursday'
   * @param time formatted time to select (e.g. 7:00 am - 10:00 am)
   */
  public selectWindow(day: string, time: any) {
    this.getDayEl(day).click()
    cy.get(this.timeSpan)
      .filter(`:contains(${time})`)
      .closest(this.timeSlot)
      .click()
  }

  /**
   * Get the time of the selected window, and output it to a fixture file for test verification.
   *
   * @returns The selected window time within a Cypress.Chainable<string> object
   */
  public getSelectedWindowTime(): Cypress.Chainable<string> {
    return this.getSelectedWindowEl()
      .find(this.timeSpan)
      .invoke('text')
      .then((text) => {
        cy.removeNewLineCarriageReturn(text).then((crText) => {
          return crText.trim()
        })
      })
  }

  /**
   * Get the cost of the selected window, and output it to a fixture file for test verification.
   *
   * @returns The selected window cost within a Cypress.Chainable<string> object
   */
  public getSelectedWindowCost(): Cypress.Chainable<string> {
    return this.getSelectedWindowEl().find('.window-price').invoke('text')
  }

  /**
   * Get the duration of the selected window, and output it to a fixture file for test verification.
   *
   * @returns The selected window duration within a Cypress.Chainable<string> object
   */
  public getSelectedWindowDuration(): Cypress.Chainable<string> {
    return this.getSelectedWindowEl().find('.window-length').invoke('text')
  }
}

export const inCheckoutTimeSlotSelector = new CheckoutTimeSlotSelector()
