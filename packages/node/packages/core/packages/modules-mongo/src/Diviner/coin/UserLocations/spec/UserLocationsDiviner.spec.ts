import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { mock } from 'jest-mock-extended'

import { CoinCurrentUserWitnessPayload, CoinCurrentUserWitnessSchema, MemoryCoinUserLocationsDiviner } from '../UserLocationsDiviner'

describe.skip('MemoryCoinUserLocationsDiviner', () => {
  const archivist = mock<ArchivistInstance>()
  const bws = mock<AbstractDiviner>()
  const logger = mock<Console>()
  let sut: MemoryCoinUserLocationsDiviner
  beforeAll(async () => {
    sut = await MemoryCoinUserLocationsDiviner.create({
      archivist,
      bws,
      config: { schema: MemoryCoinUserLocationsDiviner.configSchema },
    })
    sut.params.logger = logger
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: CoinCurrentUserWitnessPayload = { schema: CoinCurrentUserWitnessSchema, uid: 'test' }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(0)
        //const actual = result[0] as Payload
        //expect(actual).toBeObject()
        //expect(actual.schema).toBe(LocationSchema)
      })
    })
  })
})
