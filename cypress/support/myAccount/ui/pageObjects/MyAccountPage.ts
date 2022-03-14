export class MyAccountPage {
  getLogout () {
    return cy.get('shared-navigation-menu a[queryparamshandling]')
  }

  getMyAccountHeaderLink () {
    return cy.get('button#wx-link-login-desktop')
  }

  getDeliveryUnlimitedSideNavLink () {
    return cy.get('nav[role="navigation"] > a[href*="deliveryunlimited"]')
  }

  getLeftNavigationMenu() {
    return cy.get('.left-panel a.navigation-link')
  }
}

export const onMyAccountPage = new MyAccountPage()
