import { StatusCodes } from 'http-status-codes'

import { getAutomationWitness } from './Test'

describe('/', () => {
  it('Provides health checks', async () => {
    const response = await getAutomationWitness().get('/').expect(StatusCodes.OK)
    expect(response.body).toEqual({ alive: true })
  })
})
