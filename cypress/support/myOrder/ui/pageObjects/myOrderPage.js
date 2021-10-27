export class myOrderPage {
    getMyAccountButton () {
        return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account')
    }
    
    getMyOrdersLink () {
        return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders')
    }
    }
    
    export const onMyOrderPage = new myOrderPage()