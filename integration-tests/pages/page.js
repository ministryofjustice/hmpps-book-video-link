export default (headerText, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(headerText)
  checkOnPage()
  const feedbackBannerLink = () => cy.get('[data-qa="feedback-banner"]').find('a')
  const errorSummary = () => cy.get('.govuk-error-summary')
  return { ...pageObject, checkStillOnPage: checkOnPage, feedbackBannerLink, errorSummary }
}
