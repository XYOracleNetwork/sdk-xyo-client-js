import { XyoPayloadBuilder } from './Builder'

const schema = 'network.xyo.temp'

const payloadHash = '9b4e701c5a0dd06d270237fd0794eea7cd8713f80e8e35159ef19511a1aeaa69'

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
