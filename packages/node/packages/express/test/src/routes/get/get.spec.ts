import { ModuleDescription } from '@xyo-network/modules'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

describe('/', () => {
  it(`returns status code of ${ReasonPhrases.OK}`, async () => {
    const result = await (await request()).get('/')
    expect(result.status).toBe(StatusCodes.OK)
  })
  it('responds with the root node description', async () => {
    const result = await (await request()).get('/')
    const modules: ModuleDescription = result.body.data
    expect(modules).toBeDefined()
    expect(modules).toBeObject()
    expect(modules.children).toBeArray()
    expect(modules.children?.length).toBeGreaterThan(0)
    modules.children?.map((mod) => {
      expect(mod).toBeObject()
    })
  })
  describe('for each of the modules to the node returns the', () => {
    let modules: ModuleDescription[]
    beforeAll(async () => {
      const result = await (await request()).get('/')
      modules = result.body.data.children
    })
    it('address', () => {
      modules.map((mod) => {
        const { address } = mod
        expect(address).toBeTruthy()
        expect(address).toBeString()
      })
    })
    it('supported queries', () => {
      modules.map((mod) => {
        const { queries } = mod
        expect(queries).toBeArray()
        queries.map((query) => {
          expect(query).toBeTruthy()
          expect(query).toBeString()
        })
      })
    })
  })
})
