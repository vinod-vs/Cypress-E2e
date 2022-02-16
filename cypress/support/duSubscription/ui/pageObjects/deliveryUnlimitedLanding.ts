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

    getMonthlyPlanNameSenior () {
        return cy.get('[for="plan-selection-plan43"] .plan-selection-name')
    }

    getMonthlyPlanPriceSenior () {
        return cy.get('[for="plan-selection-plan43"] .price--withPer')
    }

    getMonthlyPlanNameBusiness () {
        return cy.get('[for="plan-selection-plan14"] .plan-selection-name')
    }

    getMonthlyPlanPriceBusiness () {
        return cy.get('[for="plan-selection-plan14"] .price--withPer')
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

    getAnnualPlanNameSenior () {
        return cy.get('[for="plan-selection-plan44"] .plan-selection-name')
    }

    getAnnualPlanPriceSenior () {
        return cy.get('[for="plan-selection-plan44"] .price-dollars')
    }

    getAnnualPlanNameBusiness () {
        return cy.get('[for="plan-selection-plan13"] .plan-selection-name')
    }

    getAnnualPlanPriceBusiness () {
        return cy.get('[for="plan-selection-plan13"] .price--withPer')
    }

    getAnnualPlanSection () {
        return cy.get('fieldset > div:nth-of-type(3)')
    }

    getStartTrialButton () {
        return cy.get('.button--large')
    }
    
  }
  
  export const onDeliveryUnlimitedLanding = new DeliveryUnlimitedLandingPage()
  