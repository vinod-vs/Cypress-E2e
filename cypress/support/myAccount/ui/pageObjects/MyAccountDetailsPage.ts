export class MyAccountDetailsPage {

    getMyPersonalDetailsText () {
      return cy.get('h3.heading3V2.ng-star-inserted')
    }
  
    getMyPersonalDetailsNameEditLink () {
      return cy.get(':nth-child(1) > .personalDetails-col > .margin-bottom-0 > .ng-tns-c345-3')
    }

    getMyPersonalDetailsDOBEditLink () {
      return cy.get('.padding-bottom-0 > .personalDetails-col > .margin-bottom-0 > .ng-tns-c345-3')
    }

    getMyPersonalDetailsFirstNameInput () {
        return cy.get('#personalDetails-firstName')
      }

    getMyPersonalDetailsFirstNameError () {
        return cy.get('#personalDetails-firstName~shared-validation-messages div')
      }  

    getMyPersonalDetailsLastNameInput () {
        return cy.get('#personalDetails-lastName')
      }

    getMyPersonalDetailsLastNameError () {
        return cy.get('#personalDetails-lastName~shared-validation-messages div')
      }

    getMyPersonalDetailsDOBInput () {
        return cy.get('#personalDetailsDOB-dateOfBirth')
      }  
    
    getMyPersonalDetailsDOBError () {
        return cy.get('#personalDetailsDOB-dateOfBirth~shared-validation-messages div')
      } 
     
    getSaveChangesButtonforName() {
      return cy.get('.success.l.m.full-width.mobile-full-width')
     }

     getSaveChangesButtonforDOB() {
      return cy.get('.success.l.m.full-width.mobile-full-width')
     } 

    getCancelButtonName() {
        return cy.get('.display-link-left')
       }     

    getCancelButtonDOB() {
        return cy.get('.display-link-left.underline.ng-tns-c342-4')
       }   
    getUpdatedName() {
        return cy.get(':nth-child(1) > .personalDetails-col > div.ng-tns-c345-3')
       }   
    getSuccessTittle() {
        return cy.get('p.title')
       }       
  
  }
  
  export const onMyAccountDetailsPage = new MyAccountDetailsPage()