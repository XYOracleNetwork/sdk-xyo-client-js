import { XyoApiError } from '@xyo-network/api-models'
import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness'

import { testPayload } from '../../Test'
import { getApi, getNewArchive } from '../ApiUtil.spec'

describe('XyoArchivistArchiveBlockApi', () => {
  const api = getApi()
  describe('post', function () {
    it.each([true, false])('posts a single bound witness', async (inlinePayloads) => {
      const builder = new BoundWitnessBuilder({ inlinePayloads }).payload(testPayload)
      const [boundWitness] = builder.build()
      try {
        const response = await api.archives.archive().block.post([boundWitness])
        expect(response?.length).toEqual(1)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
    it.each([true, false])('posts multiple bound witnesses', async (inlinePayloads) => {
      const builder = new BoundWitnessBuilder({ inlinePayloads }).payload(testPayload)
      const [json] = builder.build()
      const boundWitnesses: XyoBoundWitness[] = [json, json]
      //TODO: We are casting the result here since the server has not yet been updated to return the actual saved data
      try {
        const response = await api.archives.archive().block.post(boundWitnesses)
        expect(response?.length).toEqual(2)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error, null, 2))
        expect(error === undefined)
      }
    })
  })
  describe('stats', () => {
    it('returns stats for boundwitness', async () => {
      try {
        const stats = await api.archives.archive().block.stats.get()
        expect(stats?.count).toBeGreaterThan(0)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })
  describe('find', () => {
    describe('findBoundWitnessesBefore', function () {
      it('returns bound witnesses from before the timestamp', async () => {
        try {
          const [boundWitness] = new BoundWitnessBuilder().build()
          await api.archives.archive().block.post([boundWitness])
          const timestamp = Date.now() + 10000
          // eslint-disable-next-line deprecation/deprecation
          const response = await api.archives.archive('temp').block.findBefore(timestamp)
          expect(response?.length).toBe(1)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          expect(error === undefined)
        }
      })
    })

    describe('findBoundWitnessesAfter', function () {
      it('returns bound witnesses from before the timestamp', async () => {
        try {
          const archive = await getNewArchive(api)
          const [boundWitness] = new BoundWitnessBuilder().build()
          await api.archives.archive(archive).block.post([boundWitness])
          const timestamp = Date.now() - 10000
          const response = await api.archives.archive(archive).block.find({ order: 'asc', timestamp })
          expect(response?.length).toBe(1)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          expect(error === undefined)
        }
      })
    })
  })
})
