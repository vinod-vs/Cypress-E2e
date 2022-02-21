const severityIndicators = {
    minor: '⚪️',
    moderate: '🟡',
    serious: '🟠',
    critical: '🔴',
}

function callback(violations) {
    violations.forEach(violation => {
        const nodes = Cypress.$(violation.nodes.map(node => node.target).join(','))
        let message1 = {
            name: `${severityIndicators[violation.impact]} A11Y`,
            consoleProps: () => violation,
            $el: nodes,
            message: `[${violation.help}](${violation.helpUrl})`
        }


        Cypress.log(message1);
        cy.addMochaContext(`[${violation.help}](${violation.helpUrl})`, `[${violation.help}](${violation.helpUrl})`);
        console.log("`[${violation.help}](${violation.helpUrl}) : `" + `[${violation.help}](${violation.helpUrl})`)
        violation.nodes.forEach(({ target }) => {

            let message2 = {
                name: '🔧',
                consoleProps: () => violation,
                $el: Cypress.$(target.join(',')),
                message: target
            }
            Cypress.log(message2);
            cy.addMochaContext(target, target);
            Cypress.log({
                name: '🔧',
                consoleProps: () => violation,
                $el: Cypress.$(target.join(',')),
                message: target
            })
        })
    });

    cy.task(
        'log',
        `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'
        } ${violations.length === 1 ? 'was' : 'were'} detected`
    )
    // pluck specific keys to keep the table readable
    const violationData = violations.map(
        ({ id, impact, description, nodes }) => ({
            id,
            impact,
            description,
            nodes: nodes.length
        })
    )

    cy.task('table', violationData)
}

Cypress.Commands.add("checkA11y_wcag2aa_exclude_color_contrast", () => {
    cy.injectAxe();
    cy.checkA11y(null,
        {
            runOnly:
            {
                type: 'tag',
                values: ['wcag2aa']
            },
            rules:
            {
                'color-contrast': { enabled: false }
            }
        },
        callback);
})

Cypress.Commands.add("checkA11y_wcag2aa", () => {
    cy.injectAxe();
    cy.checkA11y(null,
        {
            runOnly:
            {
                type: 'tag',
                values: ['wcag2aa']
            }
        },
        callback);
})

Cypress.Commands.add("checkA11y_wcag2a", () => {
    cy.injectAxe();
    cy.checkA11y(null,
        {
            runOnly:
            {
                type: 'tag',
                values: ['wcag2a']
            }
        },
        callback);
})

Cypress.Commands.add("log_A11y_Violations", () => {
    cy.injectAxe();
    cy.checkA11y(null, null, null, { skipFailures: true });
})