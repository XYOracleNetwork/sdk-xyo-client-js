import assertEx from '@xylabs/assert'
import { StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

describe('Node API', () => {
  describe('/', () => {
    const path = '/node'
    describe('GET', () => {
      it('returns node describe', async () => {
        const response = await (await request()).get(path).expect(StatusCodes.OK)
        const { data } = response.body
        expect(data).toBeTruthy()
        expect(data.address).toBeString()
        expect(data.queries).toBeArray()
        expect(data.queries.length).toBeGreaterThan(0)
        expect(data.children).toBeArray()
        expect(data.children.length).toBeGreaterThan(0)
      })
    })
    describe('POST', () => {
      it('issues query to Node', async () => {
        // TODO: Test
      })
    })
  })
  describe('/<address>', () => {
    let path = '/node'
    beforeAll(async () => {
      // TODO: GEt modules and update path
      const response = await (await request()).get(path).expect(StatusCodes.OK)
      const address = assertEx(response.body.data.children?.[0]?.address, 'Missing address from child module')
      path = `/node/${address}`
    })
    describe('GET', () => {
      it('returns module describe', async () => {
        const response = await (await request()).get(path).expect(StatusCodes.OK)
        const { data } = response.body
        expect(data).toBeTruthy()
      })
    })
    describe('POST', () => {
      it('issues query to module at address', async () => {
        // TODO: Test
      })
    })
  })
})
