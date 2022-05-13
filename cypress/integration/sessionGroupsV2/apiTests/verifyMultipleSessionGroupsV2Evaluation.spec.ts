import TestFilter from '../../../support/TestFilter'
import requiredAttributesSdkClientBodyMulti from '../../../fixtures/sessionGroupsV2/requiredAttributesSdkClientBodyMulti.json'
import promotionCombinationAttributesSdkClientBodyMulti from '../../../fixtures/sessionGroupsV2/promotionCombinationAttributesSdkClientBodyMulti.json'

import '../../../support/sessionGroupsV2/api/commands/segmentationSdkClient'

TestFilter(['B2C', 'SessionGroupsV2', 'API', 'P0', 'CONWAY'], () => {
  describe('[API] Verify Multiple Session Groups v2 Evaluation', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    it('Verify required attributes can trigger Session Groups v2 using isingroupsbyid end point', () => {
      for (let i = 0; i < requiredAttributesSdkClientBodyMulti.length; i++) {
        cy.evaluateMultipleSessionGroups(requiredAttributesSdkClientBodyMulti[i]).then((responseBody: any) => {
          expect(responseBody.isInGroup).to.eq(true)
        })
      }
    })
    it('Verify promotion combination attributes can trigger Session Groups v2 using isingroupsbyid end point', () => {
      for (let i = 0; i < promotionCombinationAttributesSdkClientBodyMulti.length; i++) {
        cy.evaluateMultipleSessionGroups(promotionCombinationAttributesSdkClientBodyMulti[i]).then((responseBody: any) => {
          expect(responseBody.isInGroup).to.eq(true)
        })
      }
    })
  })
})
