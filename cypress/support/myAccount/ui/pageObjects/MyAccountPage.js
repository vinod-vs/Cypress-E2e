class MyAccountPage {
  getLogout () {
    return cy.get('shared-navigation-menu a[queryparamshandling]')
  }
}
export default MyAccountPage
