import { onHomepage } from '../pageObjects/Homepage'
import { HomepageTopMenu } from './HomepageTopMenu'

Cypress.Commands.add('selectTopMenu', (menuToSelect) => {
  switch (menuToSelect) {
    case HomepageTopMenu.ORDER_MANAGEMENT:
      onHomepage.getOrderManagementPanel().click()
      break
    case HomepageTopMenu.SEARCH_MANAGEMENT:
      onHomepage.getSearchManagementPanel().click()
      break
    case HomepageTopMenu.INTEGRATION_MANAGEMENT:
      onHomepage.getIntegrationManagementPanel().click()
      break
    case HomepageTopMenu.IDENTITY_MANAGEMENT:
      onHomepage.getIdentityManagementPanel().click()
      break
    case HomepageTopMenu.B2B_MANAGEMENT:
      onHomepage.getB2BManagementPanel().click()
      break
    default:
      onHomepage.getSiteManagementPanel().click()
      break
  }
})
