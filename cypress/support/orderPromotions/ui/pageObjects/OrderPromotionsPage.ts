class OrderPromotionsPage {

    open() {

        cy.visit('https://adminuatsite.woolworths.com.au/manage/orderpromotions')

        cy.visit(Cypress.env('siteAdminUat') + 'manage/orderpromotions')

    }

    getAddNewOrderPromotion() {
        return cy.get('a:contains("Add New Order Promotion")')
    }

    getTableFrame() {
        return cy.get('.table-frame')
    }

    getIdHeader() {
        return cy.get('a:contains("ID")')
    }

    getNameHeader() {
        return cy.get('a:contains("Name")')
    }

    getStartDateHeader() {
        return cy.get('a:contains("Start Date")')
    }

    getEndDateHeader() {
        return cy.get('a:contains("End Date")')
    }

    getTargetHeader() {
        return cy.get('a:contains("Target")')
    }

    getSessionGroupHeader() {
        return cy.get('a:contains("Session Group")')
    }

    getRankHeader() {
        return cy.get('a:contains("Rank")')
    }

    getOfferIdHeader() {
        return cy.get('a:contains("OfferID")')
    }

    getDeleteHeader() {
        return cy.get('a:contains("Delete")')
    }

    getOrderPromotionEntry(orderPromotionName: string) {
        return cy.get('a:contains("' + orderPromotionName + '")')
    }

    getDeleteOrderPromotion(orderPromotionName: string) {
        return cy.xpath('//a[text()=\'' + orderPromotionName + '\']/../..//td[@class=\'delete\']')
    }

}

export const orderPromotionsPage = new OrderPromotionsPage();