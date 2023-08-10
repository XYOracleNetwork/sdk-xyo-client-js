import { NftCollectionCount } from '@xyo-network/crypto-nft-collection-payload-plugin'

import { scoreTotal } from '../total'

describe('scoreTotal', () => {
  const values: [total: number, expected: number][] = [
    [1, 0],
    [2, 0],
    [3, 0],
    [10, 1],
    [20, 1],
    [30, 2],
    [100, 3],
    [200, 4],
    [300, 5],
    [1000, 7],
    [2000, 9],
    [3000, 9],
    [10000, 10],
    [20000, 10],
    [30000, 9],
    [100000, 7],
    [200000, 6],
    [300000, 5],
  ]

  it.each(values)('scores %s as %s', (total, expected) => {
    const collection: NftCollectionCount = { total }
    const [score, possible] = scoreTotal(collection)
    expect(score).toBeNumber()
    expect(score).not.toBeNegative()
    expect(possible).not.toBeNegative()
    expect(possible).toBeNumber()
    expect(score).toBe(expected)
  })
})
