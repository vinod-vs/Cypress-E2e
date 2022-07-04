import { Button } from '../../../../shared/ui/components/Button'
import { CheckoutTimeSlotSelector } from '../components/CheckoutTimeSlotSelector'
import { Notification } from '../../../../shared/ui/components/Notification'
import { TextArea } from '../../../../shared/ui/components/TextArea'
import { TextBox } from '../../../../shared/ui/components/TextBox'
import { ToggleSwitch } from '../../../../shared/ui/components/ToggleSwitch'
import { CheckoutAccordionPanel } from './CheckoutAccordionPanel'

export class CheckoutFulfilmentWindowPanel extends CheckoutAccordionPanel {
  private readonly fulfilmentWindowDetailsSection =
    'wow-checkout-delivery-details'
  private readonly pickUpNotesTextArea = '.auto_pickup-notes'
  private readonly delNotesTextArea = '.auto_delivery-notes'
  private readonly fulfilmentWindowSummary =
    'wow-checkout-fulfilment-windows-summary'
  private readonly fulfilmentDateSummaryText = '.delivery-date-summary-text'
  private readonly fulfilmentDateTimeValue = '.auto_fulfilment-date-time'
  private readonly fulfilmentDateTimeSummaryTextDN = '.auto_express-date-time'
  private readonly deliveryFeeSummaryNoDiscount = '.auto_delivery-fee-summary'
  private readonly normalDeliveryFee = '.normal-fee'
  private readonly saleFee = '.sale-fee'
  private readonly selfIsolationSummary = '.auto_self-isolation'
  private readonly leaveUnattendedSummary = '.auto_leave-unattended'
  private readonly notesSummary = '.notes'
  private readonly deliveryInstructionsNotification =
    'wow-checkout-delivery-instructions-notifications'
  private readonly selfIsolationContainer = '.covid-19-container'
  private readonly leaveUnattendedContainer = '.unattended-delivery-section'
  private readonly nominatedIdField = '.auto_restricted-items-id'
  private readonly nominatedIDSummary = '.auto_nominated-id-summary'
  private readonly instructionsPanelBase =
    'wow-checkout-delivery-instructions-panel'

  private readonly chilled = 'chilled'
  private readonly restricted = 'restricted'

  inCheckoutTimeSlotSelector = new CheckoutTimeSlotSelector()

  constructor() {
    super('.auto_checkout-accordion-panel__time')
  }

  /**
   * Overridden method from abstract base. Checks if the accordion panel is in an active
   * and editable state.
   *
   * @returns true or false
   */
  public isAccordionActiveAndEditable(): boolean {
    return cy.checkIfElementExists(this.fulfilmentWindowDetailsSection)
  }

  /**
   * Overridden method from abstract base. Checks if the accordion panel is in a saved
   * and summarised state.
   *
   * @returns true or false
   */
  public isAccordionSavedAndSummarised(): boolean {
    return cy.checkIfElementExists(this.fulfilmentWindowSummary)
  }

  /**
   * Overridden method from abstract base. Checks if the accordion panel is in a collapsed
   * and closed state.
   *
   * @returns true or false
   */
  public isAccordionCollapsedAndClosed(): boolean {
    return !(
      this.isAccordionActiveAndEditable() &&
      this.isAccordionSavedAndSummarised()
    )
  }

  private summarySectionEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.fulfilmentWindowSummary)
  }

  private fulfilmentDaySummaryEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.summarySectionEl().find(this.fulfilmentDateSummaryText)
  }

  private fulfilmentTimeSummaryEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.summarySectionEl().find(this.fulfilmentDateTimeValue)
  }

  private standardDeliveryFeeEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.deliveryFeeSummaryNoDiscount)
  }

  private saleDeliveryFeeEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.normalDeliveryFee)
  }

  private selfIsolationToggle(): ToggleSwitch {
    return new ToggleSwitch(cy.get(this.selfIsolationContainer))
  }

  private selfIsolationDetails(): Button {
    return new Button(cy.get(this.selfIsolationContainer))
  }

  private leaveUnattendedToggle(): ToggleSwitch {
    return new ToggleSwitch(cy.get(this.leaveUnattendedContainer))
  }

  private leaveUnattendedDetails(): Button {
    return new Button(cy.get(this.leaveUnattendedContainer))
  }

  private notesEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.summarySectionEl().find(this.notesSummary)
  }

  private pickUpDTBNotesTextArea(): TextArea {
    return new TextArea(cy.get(this.pickUpNotesTextArea))
  }

  private deliveryNotesTextArea(): TextArea {
    return new TextArea(cy.get(this.delNotesTextArea))
  }

  private selfIsolationSummaryEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selfIsolationSummary)
  }

  private leaveUnattendedSummaryEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.leaveUnattendedSummary)
  }

  private chilledNotificationSummary(): Notification {
    return new Notification(cy.get(this.deliveryInstructionsNotification))
  }

  private chilledNotificationEditView(): Notification {
    return new Notification(cy.get(this.instructionsPanelBase))
  }

  private restrictedItemsId(): TextBox {
    return new TextBox(cy.get(this.nominatedIdField))
  }

  private restrictedItemIDSummaryEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.nominatedIDSummary)
  }

  /**
   * Get the day of the reserved window in a formatted state from the summary view.
   * The formatted state allows for the result to be used in an appropriate verification.
   *
   * @returns day of reserved window
   */
  public getSummarisedFulfilmentDay(): Cypress.Chainable<string> {
    return cy
      .checkIfElementExists(this.fulfilmentDateTimeSummaryTextDN)
      .then((result: boolean) => {
        if (result) {
          return ''
        } else {
          this.fulfilmentDaySummaryEl()
            .invoke('text')
            .then(($text) => {
              if (
                !$text.includes('Today') &&
                !$text.includes('Tomorrow') &&
                !$text.includes('In approx')
              ) {
                cy.removeDateOrdinals($text).then((noOrdinals: any) => {
                  const shortWeekdayString = noOrdinals.substring(
                    0,
                    noOrdinals.indexOf(' ')
                  )
                  cy.convertShortWeekDayToLong(shortWeekdayString).then(
                    (longWeekdayString: any) => {
                      const str =
                        longWeekdayString +
                        ',' +
                        noOrdinals.substring(noOrdinals.indexOf(' '))
                      return str.replace(' of', '')
                    }
                  )
                })
              } else {
                return $text
              }
            })
        }
      })
  }

  /**
   * Get the time of the reserved window in a formatted state from the summary view.
   * The formatted state allows for the result to be used in an appropriate verification.
   *
   * @returns time of reserved window
   */
  public getSummarisedFulfilmentTime(): Cypress.Chainable<string> {
    return cy
      .checkIfElementExists(this.fulfilmentDateTimeSummaryTextDN)
      .then((result: boolean) => {
        if (result) {
          this.convertDNEstimateTimeTextToMinutes().then((estimatesMunites) => {
            return this.getEstimateDeliveryTimeForDN(estimatesMunites)
          })
        } else {
          return this.fulfilmentTimeSummaryEl()
            .invoke('text')
            .then(($text) => {
              cy.removeNewLineCarriageReturn($text).then((noCr: any) => {
                return noCr.split('between')[1].replace('and-', '-').trim()
              })
            })
        }
      })
  }

  /**
   * Get the cost of the window in a formatted state (e.g. without $) from the summary view.
   * The formatted state allows for the result to be used in an appropriate verification.
   *
   * @returns cost of reserved window
   */
  public getSummarisedDeliveryCost(): Cypress.Chainable<string> {
    return cy
      .checkIfElementExists(this.standardDeliveryFeeEl())
      .then((present: any) => {
        if (present === true) {
          this.standardDeliveryFeeEl()
            .invoke('text')
            .then(($text) => {
              return $text.replace('$', '').trim()
            })
        } else {
          this.saleDeliveryFeeEl()
            .invoke('text')
            .then(($text) => {
              return $text.split('now')[1].replace('$', '').trim()
            })
        }
      })
  }

  /**
   * Get the delivery/pick up notes (in a formatted state) from the summary view.
   * The formatted state allows for the result to be used in an appropriate verification.
   *
   * @returns summarised notes
   *
   */
  public getSummarisedNotes(): Cypress.Chainable<string> {
    return this.notesEl()
      .invoke('text')
      .then(($text) => {
        return $text.replace("'", '')
      })
  }

  /**
   * Get a TimeSlotSelector object, from where a window can be reserved.
   *
   * @returns CheckoutTimeSlotSelector object
   */
  public timeSlotSelector(): CheckoutTimeSlotSelector {
    return new CheckoutTimeSlotSelector()
  }

  /**
   * Enter pick up notes on the details view.
   *
   * @param notes notes to enter
   * @returns CheckoutFulfilmentWindowPanel instance
   */
  public enterPickupNotes(notes: string): CheckoutFulfilmentWindowPanel {
    this.pickUpDTBNotesTextArea().enterText(notes)
    return this
  }

  /**
   * Enter delivery notes on the details view.
   *
   * @param notes notes to enter
   * @returns CheckoutFulfilmentWindowPanel instance
   */
  public enterDeliveryNotes(notes: string): CheckoutFulfilmentWindowPanel {
    this.deliveryNotesTextArea().enterText(notes)
    return this
  }

  /**
   * Toggle self-isolation on/off. The initial toggle state will be checked
   * before performing the requested state toggle.
   *
   * @param state true (to toggle on), false (to toggle off)
   * @returns CheckoutFulfilmentWindowPanel instance
   */
  public toggleSelfIsolation(state: boolean): CheckoutFulfilmentWindowPanel {
    this.selfIsolationToggle().setToggleState(state)
    return this
  }

  /**
   * Toggle leave unattended on/off. he initial toggle state will be checked
   * before performing the requested state toggle.
   *
   * @param state true (to toggle on), false (to toggle off)
   * @returns CheckoutFulfilmentWindowPanel instance
   */
  public toggleLeaveUnattended(state: boolean): CheckoutFulfilmentWindowPanel {
    this.leaveUnattendedToggle().setToggleState(state)
    return this
  }

  /**
   * Is Leave Unattended enabled on the details view.
   *
   * @returns true or false (as a Chainable) for leave unattended being enabled
   */
  public isLeaveUnattendedEnabled() {
    return this.leaveUnattendedToggle().isEnabled()
  }

  /**
   * Is Leave Unattended selected on the details view.
   *
   * @returns true or false (as a Chainable) for leave unattended being selected
   */
  public isLeaveUnattendedSelected(): Cypress.Chainable<boolean> {
    return this.leaveUnattendedToggle().getToggleState()
  }

  /**
   * Get the self-isolation text on the summary view.
   *
   * @returns self-isolation text as a Chainable string
   */
  public getSelfIsolationSummaryText(): Cypress.Chainable<string> {
    return this.selfIsolationSummaryEl()
      .invoke('text')
      .then(($text) => {
        return $text.trim()
      })
  }

  /**
   * Get the leave unattended text on the summary view.
   *
   * @returns leave unattended text as a Chainable string
   */
  public getLeaveUnattendedSummaryText(): Cypress.Chainable<string> {
    return this.leaveUnattendedSummaryEl()
      .invoke('text')
      .then(($text) => {
        return $text.trim()
      })
  }

  /**
   * Is the Chilled Items notification present on the summary view.
   *
   * @returns true or false (as a Chainable) on chilled items notification being present
   */
  public isChilledItemNotificationPresentOnSummary(): Cypress.Chainable<boolean> {
    const chilledNotification = this.chilledNotificationSummary()

    return chilledNotification.isPresent().then((response) => {
      if (response) {
        chilledNotification.getPrimaryHeaderText().then(($text) => {
          return $text.includes(this.chilled)
        })
      } else {
        return false
      }
    })
  }

  /**
   * Is the Chilled Items notification present on the details view.
   *
   * @returns true or false (as a Chainable) on chilled items notification being present
   */
  public isChilledItemNotificationPresentOnDetailsView(): Cypress.Chainable<boolean> {
    const chilledNotification = this.chilledNotificationEditView()

    return chilledNotification.isPresent().then((response) => {
      if (response) {
        chilledNotification.getPrimaryHeaderText().then(($text) => {
          return $text.includes(this.chilled)
        })
      } else {
        return false
      }
    })
  }

  /**
   * Is the self-isolation option present on the details view.
   *
   * @returns true or false (as a Chainable) on the self-isolation option being present
   */
  public isSelfIsolationOptionPresent(): boolean {
    return cy.checkIfElementExists(this.selfIsolationContainer)
  }

  /**
   * Is the nominated ID present on the details view.
   *
   * @returns true or false (as a Chainable) on the Nominated ID field being present
   */
  public isNominatedIDFieldPresent(): boolean {
    return cy.checkIfElementExists(this.nominatedIdField)
  }

  /**
   * Enter the Nominated ID on the details view.
   *
   * @param id name to enter for Nominated ID
   * @returns CheckoutFulfilmentWindowPanel instance
   */
  public enterNominatedID(id: string): CheckoutFulfilmentWindowPanel {
    this.restrictedItemsId().enterValue(id)
    return this
  }

  /**
   * Get the Nominated ID from the summary view.
   *
   * @returns Nominated ID (as a Chainable string)
   */
  public getNominatedIDOnSummary(): Cypress.Chainable<string> {
    return this.restrictedItemIDSummaryEl()
      .find('span')
      .invoke('text')
      .then(($text) => {
        return $text.trim()
      })
  }

  /**
   * Is the Restricted Item notification present on the summary view
   *
   * @returns true or false (as a Chainable) on the Restricted Item notification being present
   */
  public isRestrictedItemNotificationPresentOnSummary(): Cypress.Chainable<boolean> {
    const restrictedNotification = new Notification(
      cy.get(this.deliveryInstructionsNotification)
    )
    return restrictedNotification.isPresent().then((response) => {
      if (response) {
        restrictedNotification.getPrimaryHeaderText().then(($text) => {
          return $text.includes(this.restricted)
        })
      } else {
        return false
      }
    })
  }

  public convertDNEstimateTimeTextToMinutes(): Cypress.Chainable<number> {
    return cy.get(this.fulfilmentDateTimeSummaryTextDN).then((textElement) => {
      let hours = 0
      let minutes = 0

      if (textElement.text().includes('hr')) {
        hours = Number(
          textElement.text().charAt(textElement.text().indexOf('hr') - 1)
        )
      }
      if (textElement.text().includes('mins')) {
        minutes = Number(
          textElement
            .text()
            .substring(
              textElement.text().indexOf('mins') - 2,
              textElement.text().indexOf('mins')
            )
        )
      }

      return hours * 60 + minutes
    })
  }

  private getEstimateDeliveryTimeForDN(estimateMinutes: number): string {
    const currentDate = new Date() // get current system date time.
    const futureDateTime = new Date(
      currentDate.getTime() + estimateMinutes * 60000
    )

    const estimateDeliveryTime = this.RoundUpDeliveryTime(futureDateTime)

    // eg, 1:15:30 AM
    const deliveryTimeStringArray = estimateDeliveryTime
      .toLocaleTimeString('en-US')
      .split(':')
    // eg, 1:15AM
    const deliveryTimeString =
      deliveryTimeStringArray[0] +
      ':' +
      deliveryTimeStringArray[1] +
      deliveryTimeStringArray[2].substring(
        deliveryTimeStringArray[2].length - 2
      )

    return deliveryTimeString
  }

  private RoundUpDeliveryTime(furtureDateTime: Date): Date {
    const minuteLastDigit = furtureDateTime.getMinutes().toString().charAt(1)
    switch (minuteLastDigit) {
      case '0':
      case '5':
        return new Date(furtureDateTime.getTime() + 5 * 60000)
      case '1':
      case '6':
        return new Date(furtureDateTime.getTime() + 4 * 60000)
      case '2':
      case '7':
        return new Date(furtureDateTime.getTime() + 3 * 60000)
      case '3':
      case '8':
        return new Date(furtureDateTime.getTime() + 2 * 60000)
      case '4':
      case '9':
        return new Date(furtureDateTime.getTime() + 1 * 60000)
      default:
        return furtureDateTime
    }
  }
}

export const onCheckoutFulfilmentWindowPanel =
  new CheckoutFulfilmentWindowPanel()
