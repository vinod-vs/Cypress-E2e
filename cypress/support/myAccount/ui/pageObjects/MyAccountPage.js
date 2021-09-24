export class MyAccountPage {
  getLogout () {
    return cy.get('shared-navigation-menu a[queryparamshandling]')
  }
}
export const onMyAccountPage = new MyAccountPage();
