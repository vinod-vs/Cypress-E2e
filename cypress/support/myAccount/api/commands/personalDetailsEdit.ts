  Cypress.Commands.add('editPersonalDetails', (personalDetails) => {
    cy.api({ url: '/' }).then((response:any) => {
      expect(response.status).to.eq(200)
    })
    cy.api({
      method: 'POST',
      //headers: {
        //'cookie': 'INGRESSCOOKIE=1644295865.58.35.712006|f0690253be03ac1898756bdbb1fb21cb; Path=/; Secure; HttpOnly;w-8484730-uldtvc=7c78fa5ada664a738c6415b9ae57b1c9; Path=/; Secure; HttpOnly; Expires=Thu, 07 Aug 2025 07:19:30 GMT; w-loggedin=true; Path=/; HttpOnly; Expires=Sat, 08 Feb 2025 07:19:30 GMT; w-rctx=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NDQzMDExNzAsImV4cCI6MTY0NDMwNDc3MCwiaWF0IjoxNjQ0MzAxMTcwLCJpc3MiOiJXb29sd29ydGhzIiwiYXVkIjoiYWRtaW51YXRzaXRlLndvb2x3b3J0aHMuY29tLmF1Iiwic2lkIjoiODQ4NDczMCIsInVpZCI6ImI5NmEyZGY4LWMyZmEtNDE1MS1hZWY2LTkyY2I1MWI0NTJmZiIsIm1haWQiOiIwIiwiYXV0IjoiU2hvcHBlciIsImF1YiI6Ijg0ODQ3MzAiLCJhdWJhIjoiMCIsIm1mYSI6IjEifQ.W1Fin7tk22wLh3ZAtElBLOD2rAKg2HlFvYBwCmtcWKBI4Tb7v5ltbJW8iqjFWmXPq5s989CPxEiHFpz2bHRE-9li6Fk6oy0lYX4857EMF40gkS1lAgN7eXs_8WoqhB3k1L30kW8Iyvtx_Imc_PzXSLDSbBvzkzVDtxM5NM8vrYe8azpSJb6DpQR10f9mfHqYliOCexMssZ2vFJmbmo5jpu6DczCVB_UyP-mDpCfbrC9-spjV08NFWzptBwvyUW1wPLtP-Bpl_5GtzOOT54GxKCuFlgtZbm-PrhjRqMOViRSeYDaiMykmg1p3YH5tjOgqeyd43HQbjNp61m-8dzSzUQ; Path=/; Secure; HttpOnly; Expires=Sat, 08 Feb 2025 07:19:30 GMT;' },
      url: Cypress.env('editPersonalDetails'),
      failOnStatusCode: false,
      body: personalDetails
    }).then((response:any) => {
      return response
    })
  }) 