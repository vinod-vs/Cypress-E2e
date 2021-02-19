/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

describe('Sample log in spec using custom commands', () => {
  before(() => {
    cy.clearCookies()
    cy.fixture('login').then((credentials) => {
      cy.loginb2c(credentials)
    })
  })

  it('should be able to get the cookie from the before block', () => {
    cy.getCookie('w-rctx').then((wrctx) => {
      expect(wrctx).to.haveOwnProperty('value', 'testToken')
    })
  })

  it('should be able to get the same cookie from the same before block without getting cleared', () => {
    cy.getCookie('w-rctx').then((wrctx) => {
      expect(wrctx).to.haveOwnProperty('value', 'testToken2')
    })
  })
})

describe('Test inherit cookie from previous suite', () => {
  it('should get the cookie preserved from the other describe block', () => {
    cy.getCookie('w-rctx').then((wrctx) => {
      expect(wrctx).to.haveOwnProperty('value', 'testToken3')
    })
  })
})

describe('Test clearing of stored default cookie', () => {
  before(() => {
    cy.clearCookie('w-rctx') // seemed like if it is set as default, it has to be specifically cleared
  })
  it('should clear the default cookie in this describe', () => {
    cy.getCookie('w-rctx').then((wrctx) => {
      expect(wrctx).to.be.null
    })
  })
})
