import { BoundWitness, BoundWitnessBuilder } from '@xyo-network/boundwitness'

import { combinationsByBoundwitness } from '../combinationsByBoundwitness'

describe('combinationsByBoundwitness', () => {
  const payloadCount = 2
  const testMatrix: [string, string[]][] = [
    ['with single payload', ['network.xyo.temp.a']],
    ['with multiple payload', ['network.xyo.temp.a', 'network.xyo.temp.b']],
    ['with with many payloads', ['network.xyo.temp.a', 'network.xyo.temp.b', 'network.xyo.temp.c']],
  ]
  describe.each(testMatrix)('%s', (_title, schemas) => {
    const payloads = schemas.map((schema) => {
      return [...Array(payloadCount).keys()].map((i) => {
        return { i, schema }
      })
    })
    const bws: BoundWitness[] = []
    beforeAll(async () => {
      for (const p of payloads) {
        const bw = await new BoundWitnessBuilder().payloads(p).build()
        bws.push(bw[0])
      }
    })
    it('finds the distinct combinations of all payloads', async () => {
      const result = await combinationsByBoundwitness([...bws, ...payloads.flat()])
      expect(result).toBeArrayOfSize(bws.length)
    })
    it('filters duplicates', async () => {
      const result = await combinationsByBoundwitness([...bws, ...payloads.flat(), ...bws])
      expect(result).toBeArrayOfSize(bws.length)
    })
  })
})
