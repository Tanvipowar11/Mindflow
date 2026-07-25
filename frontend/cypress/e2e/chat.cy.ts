describe('Chat Interface', () => {

  beforeEach(() => {

    cy.visit('http://localhost:5173');

  });

  it('should send and display a message', () => {

    cy.get('[aria-label="Chat message input"]')
      .type('Hello bot');

    cy.get('button')
      .contains('Send')
      .click();

    cy.contains('Hello bot')
      .should('be.visible');

  });

});