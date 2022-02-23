import { onMyAccountDetailsPage } from "../../../myAccount/ui/pageObjects/MyAccountDetailsPage";

Cypress.Commands.add("verifyPersonalDetailsPageViaUi", () => {
  onMyAccountDetailsPage.getMyPersonalDetailsText().contains("Personal Details")

});

Cypress.Commands.add("clickToEditName", () => {
    onMyAccountDetailsPage.getMyPersonalDetailsNameEditLink().click()
  
});

Cypress.Commands.add("clickToEditDOB", () => {
    onMyAccountDetailsPage.getMyPersonalDetailsDOBEditLink().click()
  
});

Cypress.Commands.add("editFirstName", (FirstName) => {
    if (FirstName.length == 0) {
        onMyAccountDetailsPage.getMyPersonalDetailsFirstNameInput().clear()
    }
    else {
        onMyAccountDetailsPage.getMyPersonalDetailsFirstNameInput().clear().type(FirstName)
    }
    
  
});

Cypress.Commands.add("editLastName", (LastName) => {
    if (LastName.length == 0){
        onMyAccountDetailsPage.getMyPersonalDetailsLastNameInput().clear()
    }
    else {
        onMyAccountDetailsPage.getMyPersonalDetailsLastNameInput().clear().type(LastName)
    }    
  
});

Cypress.Commands.add("editDOB", (DOB) => {
    if (DOB.length == 0){
        onMyAccountDetailsPage.getMyPersonalDetailsDOBInput().clear()
    }
    else {
        onMyAccountDetailsPage.getMyPersonalDetailsDOBInput().clear().type(DOB)
    }
});



Cypress.Commands.add("saveName", () => {
    onMyAccountDetailsPage.getSaveChangesButtonforName().click()   
  
});

Cypress.Commands.add("validateNamesUpdation", (FirstName, LastName) => {
    onMyAccountDetailsPage.getUpdatedName().contains(FirstName)  
    onMyAccountDetailsPage.getUpdatedName().contains(LastName) 
  
});
Cypress.Commands.add("validateTheSuccessMessage", () => {
    onMyAccountDetailsPage.getSuccessTittle().contains("You have successfully saved your changes ")
  
});
Cypress.Commands.add("saveDOB", () => {
    onMyAccountDetailsPage.getSaveChangesButtonforName().click()   
  
});

Cypress.Commands.add("cancelNameChanges", () => {
    onMyAccountDetailsPage.getCancelButtonName().click()       
  
});

Cypress.Commands.add("cancelDOBChanges", () => {
    onMyAccountDetailsPage.getCancelButtonDOB().click()       
  
});

Cypress.Commands.add("verifyBlankFirstNameErrorMessage",()=>{
        onMyAccountDetailsPage.getMyPersonalDetailsFirstNameError().contains('First name is required.')   
})
Cypress.Commands.add("verifyBlankLastNameErrorMessage",()=>{
    onMyAccountDetailsPage.getMyPersonalDetailsLastNameError().contains('Last name is required.')   
})
Cypress.Commands.add("verifyBlankDOBErrorMessage",()=>{
    onMyAccountDetailsPage.getMyPersonalDetailsDOBError().contains('Date of birth is required.')   
})
Cypress.Commands.add("verifyIncorrectDOBErrorMessage",(errType)=>{
    if (errType == 'invalid'){
    onMyAccountDetailsPage.getMyPersonalDetailsDOBError().contains('Is not a valid Date') 
    }
    else { if (errType == 'future'){
        onMyAccountDetailsPage.getMyPersonalDetailsDOBError().contains('Date of birth cannot be in future')
    }

    }  
})





