import { Button } from '../../../../shared/ui/components/Button'

export abstract class CheckoutAccordionPanel {

  panelBaseLocatorString: string

  constructor(elLocator: string) {
    this.panelBaseLocatorString = elLocator
  }

  private cancelBtn(): Button {
    return new Button(cy.get('panelBaseLocatorString').find('.auto_checkout-accordion-panel-button__cancel'))
  }

  private continueBtn(): Button {
    return new Button(cy.get('panelBaseLocatorString').find('.auto_checkout-accordion-panel-button__submit'))
  }

  private editBtn(): Button {
    return new Button(cy.get('panelBaseLocatorString').find('.auto_checkout-accordion-panel-button__change'))
  }

  public abstract isAccordionActiveAndEditable(): void;

  public abstract isAccordionSavedAndSummarised(): void;

  public abstract isAccordionCollapsedAndClosed(): void;

  public selectContinue() {
    this.continueBtn().click();
  }

  public selectCancel() {
    this.cancelBtn().click();
  }

  public selectEdit() {
    this.editBtn().click();
  }

  public getPanelHeadingText(): Cypress.Chainable<string> {
    return cy.get('panelBaseLocatorString').find('.panel-heading-text').invoke('text');
  }
}