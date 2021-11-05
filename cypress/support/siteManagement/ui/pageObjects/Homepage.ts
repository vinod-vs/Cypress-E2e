export class Homepage {
  getOrderManagementPanel() {
    return cy.get('ul#manage-menu-top li a:contains("Order Management")');
  }

  getSearchManagementPanel() {
    return cy.get('ul#manage-menu-top li a:contains("Search Management")');
  }

  getIntegrationManagementPanel() {
    return cy.get('ul#manage-menu-top li a:contains("Integration Management")');
  }

  getIdentityManagementPanel() {
    return cy.get('ul#manage-menu-top li a:contains("Identity Management")');
  }

  getB2BManagementPanel() {
    return cy.get('ul#manage-menu-top li a:contains("B2B Management")');
  }

  getSiteManagementPanel() {
    return cy.get('ul#manage-menu-top li a:contains("Site Management")');
  }
}

export const onHomepage = new Homepage();
