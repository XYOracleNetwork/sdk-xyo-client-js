import { BoundWitnessBuilder } from '@xyo-network/boundwitness'

import { getApi, getNewArchive, getTimestampMinutesFromNow } from '../ApiUtil.spec'

describe('XyoArchivistPayloadApi', () => {
  describe('find', () => {
    const api = getApi()
    let archive = ''
    beforeEach(async () => {
      archive = await getNewArchive(api)
      expect(archive).toBeTruthy()
    })
    describe('when order is ascending', () => {
      it('returns payloads greater than or equal to timestamp', async () => {
        const timestamp = getTimestampMinutesFromNow(-1)
        const [boundWitness] = new BoundWitnessBuilder().build()
        const blockResult = await api.archive(archive).block.post([boundWitness])
        expect(blockResult?.length).toBe(1)
        const response = await api.archive(archive).block.find({ order: 'asc', timestamp })
        expect(response?.length).toBe(1)
      })
    })
    describe('when order is descending', () => {
      it('returns payloads less than or equal to timestamp', async () => {
        const [boundWitness] = new BoundWitnessBuilder().build()
        const blockResult = await api.archive(archive).block.post([boundWitness])
        expect(blockResult?.length).toBe(1)
        const timestamp = getTimestampMinutesFromNow(1)
        const response = await api.archive(archive).block.find({ order: 'desc', timestamp })
        expect(response?.length).toBe(1)
      })
    })
  })
})
