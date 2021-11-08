export class myOrderPage {
getMyAccountButton () {
    return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account').click()
}

getMyOrdersLink () {
    return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders').click()
}
}

export const onMyOrderPage = new myOrderPage()