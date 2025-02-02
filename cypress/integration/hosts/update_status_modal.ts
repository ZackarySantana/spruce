const hostsRoute = "/hosts";

describe("Update Status Modal", () => {
  before(() => {
    cy.login();
    cy.preserveCookies();
  });

  beforeEach(() => {
    cy.visit(`${hostsRoute}?limit=100&page=0`);
  });

  it("Update status for selected hosts", () => {
    cy.get(".ant-checkbox-input").first().should("be.visible");
    cy.get(".ant-checkbox-input").first().should("not.be.disabled");
    cy.get(".ant-checkbox-input").first().check({ force: true });

    cy.dataCy("update-status-button").click();

    cy.dataCy("host-status-select").click();

    cy.dataCy("decommissioned-option").click();

    cy.dataCy("host-status-notes").type("notes");

    cy.dataCy("modal-update-button").click();

    cy.validateToast("success");

    // MODAL FORM VALUES SHOULD BE CLEARED AFTER MUTATION
    cy.dataCy("update-status-button").click();

    cy.dataCy("host-status-select").within(() => {
      cy.get(".ant-select-selection-item").should("not.exist");
    });

    cy.dataCy("host-status-notes").invoke("val").should("eq", "");
  });
});
