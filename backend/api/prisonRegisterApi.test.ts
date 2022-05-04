import nock from 'nock'

import Client from './oauthEnabledClient'
import PrisonRegisterApi from './prisonRegisterApi'

const baseUrl = 'http://localhost:8080'

describe('prisonRegisterApi', () => {
  const api = new PrisonRegisterApi(new Client({ baseUrl, timeout: 2000 }))
  const mock = nock(baseUrl)

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getVideoLinkConferencingCentreEmailAddress', () => {
    it('Gets a VCC email address', async () => {
      mock.get('/secure/prisons/id/MDI/videolink-conferencing-centre/email-address').reply(200, 'vcc@def')
      expect(await api.getVideoLinkConferencingCentreEmailAddress({}, 'MDI')).toEqual('vcc@def')
    })

    it('VCC email address not found - returns 404 error', async () => {
      mock.get('/secure/prisons/id/MDI/videolink-conferencing-centre/email-address').reply(404)
      await expect(api.getVideoLinkConferencingCentreEmailAddress({}, 'MDI')).resolves.toBe(undefined)
    })
  })

  describe('getOffenderManagementUnitEmailAddress', () => {
    it('Gets an OMU email address', async () => {
      mock.get('/secure/prisons/id/MDI/offender-management-unit/email-address').reply(200, 'omu@def')
      expect(await api.getOffenderManagementUnitEmailAddress({}, 'MDI')).toEqual('omu@def')
    })

    it('OMU email address not found - returns 404 error', async () => {
      mock.get('/secure/prisons/id/MDI/offender-management-unit/email-address').reply(404)
      await expect(api.getOffenderManagementUnitEmailAddress({}, 'MDI')).resolves.toBe(undefined)
    })
  })
})
