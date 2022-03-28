import { XyoBoundWitness } from '../core'

const testBoundWitness: XyoBoundWitness = {
  _archive: 'temp',
  _client: 'js',
  _hash: '8c9e3921db15dcba269dcd483604b164c7986875d559425efaf3ca78d036a6e8',
  _payloads: [
    {
      _archive: 'temp',
      _hash: '20e14207f952a09f767ff614a648546c037fe524ace0bfe55db31f818aff1f1c',
      _id: '621d2d9c99aa8f6be9b7d37b',
      _timestamp: 1646079388450,
      numberField: 1,
      objectField: {
        numberField: 1,
        stringField: 'stringValue',
      },
      schema: 'network.xyo.test',
      stringField: 'stringValue',
    },
  ],
  _signatures: [
    '3046022100cea039d6a5c85a8a04340ce22e2dd6662231c171e6f2d1f165e9b6fdcd13bab4022100d98e344c2be1d7b3053b6c758d9b36561c82fa075e3ea11885de65724489c58e',
  ],
  _timestamp: 1647975841211,
  addresses: ['1e8d8402b8375f8f757623342ce399de56be9983'],
  payload_hashes: ['20e14207f952a09f767ff614a648546c037fe524ace0bfe55db31f818aff1f1c'],
  payload_schemas: ['network.xyo.test'],
  previous_hashes: [null],
  schema: 'network.xyo.boundwitness',
}

export { testBoundWitness }
