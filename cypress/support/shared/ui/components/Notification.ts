export class Notification {
  private readonly sharedNotificationTag = 'shared-notification'
  private readonly notificationContainer = '.notification-container'
  private readonly textContainer = '.text-container'
  private readonly primaryHeaderText = 'p' // find within context of the text container
  private readonly secondaryHeaderText = '.small-heading' // find within context of the text container
  private readonly action = '.action'

  /**
   * Notification is a shared component used across the website that can be identified by the
   * tag 'shared-notification'. It should always be instantiated with an argument that will
   * uniquely identify the 'shared-notification' within its context.
   *
   * @param elLocator parent locator through which the notification can be uniquely identified
   */
  constructor (elLocator: Cypress.Chainable<JQuery<HTMLElement>>) {
    elLocator.as('notificationParent')
  }

  private notificationContainerEl () {
    return cy.get('@notificationParent').find(this.notificationContainer)
  }

  private primaryHeaderTextEl () {
    return cy.get('@notificationParent').find(this.primaryHeaderText)
  }

  private secondaryHeaderEl () {
    return cy.get('@notificationParent').find(this.secondaryHeaderText)
  }

  private linkElList (): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.notificationContainerEl().find(this.textContainer).find(this.action)
  }

  private selectLink (index: number) {
    this.linkElList().eq(index).click()
  }

  private hasType (type: string): Cypress.Chainable<boolean> {
    return this.notificationContainerEl().invoke('attr', 'class').then(($notification: any) => {
      if ($notification.includes(type)) {
        return true
      } else {
        return false
      }
    })
  }

  /**
   * Get the primary text from within the notification.
   *
   * @returns primary text as a Chainable<string>
   */
  public getPrimaryHeaderText (): Cypress.Chainable<string> {
    return this.primaryHeaderTextEl().invoke('text')
  }

  /**
   * Get the secondary text from within the notification.
   *
   * @returns secondary text as a Chainable<string>
   */
  public getSecondaryHeaderText (): Cypress.Chainable<string> {
    return this.secondaryHeaderEl().invoke('text')
  }

  /**
   * Get the text of the primary link.
   *
   * @returns text of the primary link as a Chainable<string>
   */
  public getPrimaryLinkText (): Cypress.Chainable<string> {
    return this.linkElList().eq(0).invoke('text')
  }

  /**
   * Get the text of the secondary link.
   *
   * @returns text of the secondary link as a Chainable<string>
   */
  public getSecondaryLinkText (): Cypress.Chainable<string> {
    return this.linkElList().eq(0).invoke('text')
  }

  /**
   * Select the notification's primary link.
   *
   * @returns Notification instance
   */
  public selectPrimaryLink (): Notification {
    this.selectLink(0)
    return this
  }

  /**
   * Select the notification's secondary link.
   *
   * @returns Notification instance
   */
  public selectSecondaryLink (): Notification {
    this.selectLink(1)
    return this
  }

  /**
   * Is the Notification present on the DOM.
   *
   * @returns true or false as a Chainable<boolean> on Notification presence
   */
  public isPresent (): Cypress.Chainable<boolean> {
    return cy.get('@notificationParent').then(($parent) => {
      if ($parent.find(this.sharedNotificationTag).length > 0) {
        return true
      } else {
        return false
      }
    })
  }

  /**
   * Is the Notification of type "Warning".
   *
   * @returns true or false as a Chainable<boolean>
   */
  public IsWarning (): Cypress.Chainable<boolean> {
    return this.hasType('warning')
  }

  /**
   * Is the Notification of type "Error".
   *
   * @returns true or false as a Chainable<boolean>
   */
  public isError (): Cypress.Chainable<boolean> {
    return this.hasType('error')
  }

  /**
   * Is the Notification of type "Info".
   *
   * @returns true or false as a Chainable<boolean>
   */
  public IsInfo (): Cypress.Chainable<boolean> {
    return this.hasType('info')
  }
}
