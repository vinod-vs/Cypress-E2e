/// <reference types="cypress" />
import TestFilter from '../../support/TestFilter'
import '../../support/coolService/api/coolServiceApi'


TestFilter(['API'], () => {
describe('[API] get CountryOfOrigin of the product', () =>{
    it('should have CountryOfOrgin', () => {
  
        cy.getCountryOfOrigin().then((response) => {
          expect(response).to.have.property('Country', 'Australia')
         })
    })
  })
})

