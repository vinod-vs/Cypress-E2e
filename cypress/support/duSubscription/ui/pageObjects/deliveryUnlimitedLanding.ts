//
// This class will capture DOM elements on the delivery unlimited landing page
//

export class DeliveryUnlimitedLandingPage {
  
    getPageURL () {
      return cy.url();
    }
  
    getMonthlyPlanName () {
        return cy.get('[for="plan-selection-plan10"] .plan-selection-name')
    }

    getMonthlyPlanPrice () {
        return cy.get('[for="plan-selection-plan10"] .price-dollars')
    }

    getMonthlyPlanSection () {
        return cy.get('fieldset > div:nth-of-type(2)')
    }

    getAnnualPlanName () {
        return cy.get('[for="plan-selection-plan9"] .plan-selection-name')
    }

    getAnnualPlanPrice () {
        return cy.get('[for="plan-selection-plan60"] .price-dollars')
    }

    getStartTrialButton () {
        return cy.get('.button--large')
    }
    
  }
  
  export const onDeliveryUnlimitedLanding = new DeliveryUnlimitedLandingPage()
  