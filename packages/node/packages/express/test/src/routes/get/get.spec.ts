import { NodeInfo } from '@xyo-network/node-core-model'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { parse } from 'url'

import { request } from '../../testUtil'

describe('/', () => {
  it(`returns status code of ${ReasonPhrases.OK}`, async () => {
    const result = await (await request()).get('/')
    expect(result.status).toBe(StatusCodes.OK)
  })
  it('responds with an array of the registered modules', async () => {
    const result = await (await request()).get('/')
    const modules: NodeInfo[] = result.body.data
    expect(modules).toBeDefined()
    expect(modules).toBeArray()
    modules.map((mod) => {
      expect(mod).toBeObject()
    })
  })
  describe('for each of the registered modules returns the', () => {
    let modules: NodeInfo[]
    beforeAll(async () => {
      const result = await (await request()).get('/')
      modules = result.body.data
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
    it('url', () => {
      modules.map((mod) => {
        const { url } = mod
        expect(url).toBeTruthy()
        expect(url).toBeString()
        const parsed = parse(url)
        expect(parsed).toBeObject()
        expect(parsed.href).toBeString()
        expect(parsed.path).toBeString()
        expect(parsed.pathname).toBeString()
      })
    })
  })
})
