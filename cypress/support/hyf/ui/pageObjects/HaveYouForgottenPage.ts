export class HaveYouForgottenPage {
    getHaveYouForgottenContinueToCheckoutButton () {
        return cy.get('wow-have-you-forgotten-container .continue-button')
    }

    continueToCheckout() {
        cy.checkIfElementExists('wow-have-you-forgotten-container .continue-button').then((result : boolean) => {
            if(result){
                this.getHaveYouForgottenContinueToCheckoutButton().click({force: true})
            }
        })
    }
}

export const onHaveYouForgottenPage = new HaveYouForgottenPage()