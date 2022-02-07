import { XyoPayloadBuilder } from './Builder'

const schema = 'network.xyo.temp'

const payloadHash = '45036006c2b015eb4be70171d560f3b05ca094e887bec7fc5efb6ad477e019e8'

describe('XyoBoundWitnessBuilder', () => {
  test('build', () => {
    let builder = new XyoPayloadBuilder({ schema })
    expect(builder).toBeDefined()
    builder = builder.fields({
      testArray: [1, 2, 3],
      testBoolean: true,
      testNumber: 5,
      testObject: { t: 1 },
      testString: 'hi',
    })
    expect(builder).toBeDefined()

    const actual = builder.build()

    expect(actual).toBeDefined()
    expect(actual._hash).toEqual(payloadHash)
  })
})
