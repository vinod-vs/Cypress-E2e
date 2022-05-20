class EditOrderPromotionPage {
  getNameInput () {
    return cy.get('#Name')
  }

  getStartDateInput () {
    return cy.get('#StartDate')
  }

  getEndDateInput () {
    return cy.get('#EndDate')
  }

  getEligibleShoppersInput () {
    return cy.xpath('//*[text()=\'Eligible Shoppers\']/../select')
  }

  getQualifyingAmountInput () {
    return cy.get('#MinimumOrderValue')
  }

  getTargetInput () {
    return cy.get('#Target')
  }

  getDiscountTypeInput () {
    return cy.get('#AwardType')
  }

  getAmountInput () {
    return cy.get('#Amount')
  }

  getUpdateButton () {
    return cy.get('input[value="Update"]')
  }
}

export const editOrderPromotionPage = new EditOrderPromotionPage()
