import { setComponentBase } from '../../../utilities/ui/utility'

export class Button {
  private buttonBase = 'buttonBase';
  private sharedButtonTag = 'shared-button';

  /**
   *  Button is a shared component used across the website. It can be
   * instantiated either from a parent element, or from a class/other attribute
   * at the 'shared-button' level. The constructor will accept either instantiation
   * type and build the component appropriately.
   * 
   * @param elLocator locator to locate the shared-button
   */
  constructor(elLocator: Cypress.Chainable<JQuery<HTMLElement>>) {
    setComponentBase(elLocator, this.sharedButtonTag).as(this.buttonBase);
  }

  private buttonEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('@' + this.buttonBase).find('button');
  }

  /**
   * Click the button.
   * 
   * @returns Button instance
   */
  public click(): Button {
    this.buttonEl().click();
    return this;
  }

  /**
   * Get the visible text of the button.
   * 
   * @returns button text as a Chainable<string>
   */
  public getVisibleText(): Cypress.Chainable<string> {
    return this.buttonEl().invoke('text');
  }

  /**
   * Get the type of the button.
   * 
   * @returns button type as a Chainable<string>
   */
  public getType(): Cypress.Chainable<string> {
    return this.buttonEl().invoke('attr', 'type');
  }

  /**
   * Is the button enabled.
   * 
   * @returns true or false as a Chainable<boolean> on button being enabled
   */
  public isEnabled(): Cypress.Chainable<boolean> {
    return this.buttonEl().then(($btn) => {
      if ($btn.is(':disabled')) {
        return false;
      } else {
        return true;
      } 
    })
  }

}