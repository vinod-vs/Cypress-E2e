export class customerMaintenance {
  // Customer maintenance page common elements
  getViewRefundsAndCreditsButton () {
    return cy.get('a[href*="/OrderManagement/Refunds"] > .submit-link-black')
  }
} export const onCustomerMaintenance = new customerMaintenance()
