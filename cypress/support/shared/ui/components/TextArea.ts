import { setComponentBase } from '../../../utilities/ui/utility'

export class TextArea {
  private readonly sharedTextAreaTag = 'shared-textarea'
  private readonly textAreaBase = 'textAreaBase'

  /**
   * TextArea is a shared component used across the website. It can be
   * instantiated either from a parent element, or from a class/other attribute
   * at the 'shared-textarea' level. The constructor will accept either instantiation
   * type and build the component appropriately.
   *
   * @param elLocator locator to locate the shared-textarea
   */
  constructor (elLocator: Cypress.Chainable<JQuery<HTMLElement>>) {
    setComponentBase(elLocator, this.sharedTextAreaTag).as(this.textAreaBase)
  }

  private inputAreaEl (): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('@' + this.textAreaBase).find('textarea')
  }

  /**
   * Get the placeholder text from the textarea.
   *
   * @returns Chainable string or undefined
   */
  public getPlaceHolderText (): Cypress.Chainable<string | undefined> {
    return cy.get('@' + this.textAreaBase).invoke('attr', 'placeholder').as('placeHolderText')
  }

  /**
   * Enter text in the textarea.
   *
   * @param text text to enter
   * @returns TextArea instance
   */
  public enterText (text: string): TextArea {
    this.inputAreaEl().clear().type(text)
    return this
  }

  /**
   * Get the text from within the TextArea.
   *
   * @returns TextArea text as a Chainable<string>
   */
  public getTextAreaValue (): Cypress.Chainable<string> {
    return this.inputAreaEl().invoke('val')
  }

  /**
   * Get the characters remaining as permitted input to the TextArea.
   *
   * @returns characters remaining as a Chainable<string>
   */
  public getCharactersRemaining (): Cypress.Chainable<string> {
    return cy.get('@' + this.textAreaBase).find('.countdown-text').invoke('text')
  }
}
