export class MyAccountPage {
  getLogout () {
    return cy.get('shared-navigation-menu a[queryparamshandling]')
  }

  getMyAccountHeaderLink () {
    return cy.get('a#wx-link-login-desktop')
  }

  getDeliveryUnlimitedSideNavLink () {
    return cy.get('nav[role="navigation"] > a[href*="deliveryunlimited"]')
  }
}

export const onMyAccountPage = new MyAccountPage()
