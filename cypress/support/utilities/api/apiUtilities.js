Cypress.Commands.add('retryRequest', (url, options) => {
  let retriesCounter = 0
  function makeRequest () {
    retriesCounter += 1
    cy.request({
      method: options.method || 'GET',
      url: url,
      headers: options.headers,
      body: options.body,
      failOnStatusCode: false
    }).then((response) => {
      try {
        if (options.function) {
          options.function(response)
        }
        return cy.wrap(response)
      } catch (err) {
        if (!options.function) {
          throw err
        }
        if (retriesCounter >= options.retries) {
          throw new Error(
            `Failed to request ${url} after ${options.retries} retries`
          )
        }
        cy.wait(options.timeout)
        return makeRequest()
      }
    })
  }
  makeRequest()
})
