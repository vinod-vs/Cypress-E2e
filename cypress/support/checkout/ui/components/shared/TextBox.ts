import { setComponentBase } from '../../../../../support/utilities/ui/utility'

export class TextBox {
  private textBoxBase = 'textBoxBase';
  private sharedTextBoxTag = 'shared-textbox';
  private inputTag = 'input';
  private labelTag = 'label';
  private clearText = '.clear-text';

  /**
   * TextBox is a shared component used across the website. It can be
   * instantiated either from a parent element, or from a class/other attribute
   * at the 'shared-textbox' level. The constructor will accept either instantiation
   * type and build the component appropriately.
   * 
   * @param elLocator locator to locate the shared-textbox
   */
  constructor(elLocator: Cypress.Chainable<JQuery<HTMLElement>>) {
    setComponentBase(elLocator, this.sharedTextBoxTag).as(this.textBoxBase);
  }

  private textInputEl(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('@' + this.textBoxBase).find(this.inputTag)
  }

  private textLabelEl(): Cypress.Chainable<JQuery<HTMLElement>>  {
    return cy.get('@' + this.textBoxBase).find(this.labelTag)
  }

  private clearTextEl() {
    return cy.get('@' + this.textBoxBase).find(this.clearText);
  }

  /**
   * Get the value from within the input field.
   * 
   * @returns input field value as a Chainable string 
   */
  public getTextValue(): Cypress.Chainable<string> {
    return this.textInputEl().invoke('val')
  }

  /**
   * Get the label text (i.e. placeholder) from the textbox.
   * 
   * @returns placeholder text as a Chainable string 
   */
  public getLabelText(): Cypress.Chainable<string> {
    return this.textLabelEl().invoke('text')
  }

  /**
   * Select the 'x' icon to clear the text input
   * 
   * @returns TextBox instance
   */
  public selectClearText(): TextBox {
    cy.get('@' + this.textBoxBase).then((base) => {
      if (base.find(this.clearText).length > 0) {
        this.clearTextEl().click();
      }
    })
    return this;
  }

  /**
   * Clear the text input by calling Cypress clear option.
   * 
   * @returns Cypress.Chainable<JQuery<HTMLElement>>
   */
  public clear(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.textInputEl().clear();
  }

  /**
   * Enter a value in the text field.
   * 
   * @param textVal value to enter in the text field
   * @returns TextBox instance 
   */
  public enterValue(textVal: string): TextBox {
    this.clear().type(textVal);
    return this;
  }

  /**
   * Get the character count from within the input field.
   * 
   * @returns number of characters, or undefined 
   */
  public getCharacterCount(): Cypress.Chainable<number | undefined> {
    return this.getTextValue().then(($text) => {
      return $text.length;
    })
  }

  /**
   * Has any text input/interaction left the component in a valid state.
   * 
   * @returns true or false (as Chainable<boolean>) for valid state
   */
  public isValid(): Cypress.Chainable<boolean> {
    return cy.get('@' + this.textBoxBase).then((base) => {
      if (base.hasClass('ng-valid')) {
      return true;
      } else {
        return false;
      }
    })
  }
}