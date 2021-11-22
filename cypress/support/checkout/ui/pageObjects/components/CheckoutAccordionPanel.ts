import { Button } from '../../../../shared/ui/pageObjects/Button'

export abstract class CheckoutAccordionPanel {

  private cancelBtn(): Button {
    return new Button(cy.get('@panelBase').find('.auto_checkout-accordion-panel-button__cancel'))
  }

  private saveBtn(): Button {
    return new Button(cy.get('@panelBase').find('.auto_checkout-accordion-panel-button__submit'))
  }

  private changeBtn(): Button {
    return new Button(cy.get('@panelBase').find('.auto_checkout-accordion-panel-button__change'))
  }

  public abstract isAccordionActiveAndEditable(): void;

  public abstract isAccordionSavedAndSummarised(): void;

  public abstract isAccordionCollapsedAndClosed(): void;

  public selectSave() {
    this.saveBtn().click();
  }

  public selectCancel() {
    this.cancelBtn().click();
  }

  public selectChange() {
    this.changeBtn().click();
  }

  public getPanelHeadingText(): Cypress.Chainable<string> {
    return cy.get('@panelBase').find('.panel-heading-text').invoke('text');
  }
}