import TestFilter from '../../../support/TestFilter'
import requiredAttributesSdkClientBody from '../../../fixtures/sessionGroupsV2/requiredAttributesSdkClientBody.json'
import promotionCombinationAttributesSdkClientBody from '../../../fixtures/sessionGroupsV2/promotionCombinationAttributesSdkClientBody.json'

import '../../../support/sessionGroupsV2/api/commands/segmentationSdkClient'

TestFilter(['B2C', 'SessionGroupsV2', 'API', 'P0', 'CONWAY'], () => {

    describe('[API] Verify Session Groups v2 Evaluation', () => {
      before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
      })
      it('Verify required attributes can trigger Session Groups v2', () => {
        for(let i = 0; i < requiredAttributesSdkClientBody.length; i++) {
          cy.evaluateSessionGroup(requiredAttributesSdkClientBody[i]).then((responseBody: any) => {
              expect(responseBody.isInGroup).to.eq(true)
          })
        }
        
      })
      it('Verify promotion combination attributes can trigger Session Groups v2', () => {
        for(let i = 0; i < promotionCombinationAttributesSdkClientBody.length; i++) {
          cy.evaluateSessionGroup(promotionCombinationAttributesSdkClientBody[i]).then((responseBody: any) => {
              expect(responseBody.isInGroup).to.eq(true)
          })
        }
      })
    })
})