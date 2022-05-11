import { setComponentBase } from '../../../utilities/ui/utility'

export class ToggleSwitch {
  private readonly toggleSwitchTag = 'shared-toggle-switch'
  private readonly toggleBase = 'toggleBase'
  private readonly dataChecked = 'data-checked'

  constructor (elLocator: Cypress.Chainable<JQuery<HTMLElement>>) {
    setComponentBase(elLocator, this.toggleSwitchTag).as(this.toggleBase)
  }

  private toggleSwitchEl (): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('@' + this.toggleBase).find('input')
  }

  private toggleSliderEl (): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('@' + this.toggleBase).find('.toggle-slider')
  }

  private switchState (state: boolean): ToggleSwitch {
    this.toggleSwitchEl().invoke('attr', this.dataChecked).then((isChecked) => {
      if (isChecked === 'false' && state) {
        cy.log('Switch state is true & off')
        this.toggleSliderEl().click()
      } else if (isChecked === 'true' && !state) {
        cy.log('Switch state is false & on')
        this.toggleSliderEl().click()
      }
    })
    return this
  }

  /**
   * Set the toggle to on or off. Current state will be checked before making the requested
   * toggle state change.
   *
   * @param state true or false for on or off state
   * @returns ToggleSwitch instance
   */
  public setToggleState (state: boolean): ToggleSwitch {
    return this.switchState(state)
  }

  /**
   * Get the state of the Togggle, i.e. "On" or "Off".
   *
   * @returns true or false as a Chainable<boolean>
   */
  public getToggleState (): Cypress.Chainable<boolean> {
    return this.toggleSwitchEl().invoke('attr', this.dataChecked).then(($state) => {
      if ($state === 'true') {
        return true
      } else {
        return false
      }
    })
  }

  /**
   * Is the Toggle enabled/editable.
   *
   * @returns true or false as a Chainable<boolean>
   */
  public isEnabled (): Cypress.Chainable<boolean> {
    return cy.get('@' + this.toggleBase).find('input').then(($btn) => {
      if ($btn.is(':disabled')) {
        return false
      } else {
        return true
      }
    })
  }
}
