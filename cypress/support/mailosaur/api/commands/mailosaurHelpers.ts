const { JSDOM } = require('jsdom')

Cypress.Commands.add('getEmailDetails', (emailId: string, expectedEmailSubject: string) => {
    cy.log(emailId)
    cy.mailosaurGetMessage(Cypress.env('mailosaur_serverId'), {
        sentTo: emailId,
        subject: expectedEmailSubject,
        sentFrom: 'shoponline@woolworths.com.au'
    }, {
        timeout: 60000
    }).then(email => {
        const dom = new JSDOM(email.html.body);
        const ell = dom.window.document.querySelector('body');
        let emailBody = ell.textContent;
        let emailSubject = email.subject;
        cy.log('Email Subject: ' + emailSubject)
        console.log('Email Subject: ' + emailSubject)
        cy.log('Email Body: ' + emailBody)
        console.log('Email Body: ' + emailBody)
        cy.wrap({
            subject: emailSubject,
            body: emailBody,
            email: email,
            dom: dom
        }).as('emailDetails')
    })
})