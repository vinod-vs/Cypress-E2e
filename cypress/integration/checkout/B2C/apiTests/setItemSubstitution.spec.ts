import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../support/checkout/api/commands/substitution'
import substitutionRequest from '../../../../fixtures/checkout/substitutionRequest.json'

TestFilter(['API', 'B2C', 'Checkout', 'SPUD'], () => {
  describe('[API] Set Item Substitution options at B2C Checkout', () => {
    let subsItems: any = []

    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
    })

    it('Should set substitution options for items at Checkout', () => {
      cy.addAvailableNonRestrictedItemCountLimitedWowItemsToTrolley(
        'Bread',
        3
      ).then((response: any) => {
        for (let x = 0; x < response.length - 1; x++) {
          subsItems.push({
            Stockcode: response[x].stockCode,
            AllowSubstitution: true,
          })
        }
        subsItems = {
          ...subsItems,
          Stockcode: response[response.length - 1].stockCode,
          AllowSubstitution: false,
        }
        substitutionRequest.Items = subsItems

        cy.setItemSubstitutionviaAPI(substitutionRequest).then(
          (subsResponse: any) => {
            expect(
              subsResponse.ErrorMessage,
              'Error Message on post to /substitution'
            ).to.be.empty
          }
        )
      })
    })
  })
})
