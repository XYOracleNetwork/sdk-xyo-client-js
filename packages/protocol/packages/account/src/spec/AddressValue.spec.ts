import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { Hasher } from '@xyo-network/core'

import { Account } from '../Account'
import { AddressValue } from '../Key'

const testVectorPrivateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
const testVectorPublicKey =
  'ed6f3b86542f45aab88ec48ab1366b462bd993fec83e234054afd8f2311fba774800fdb40c04918463b463a6044b83413a604550bfba8f8911beb65475d6528e'
const testVectorAddress = '5e7a847447e7fec41011ae7d32d768f86605ba03'
const testVectorHash = '4b688df40bcedbe641ddb16ff0a1842d9c67ea1c3bf63f3e0471baa664531d1a'
const testVectorSignature =
  'b61dad551e910e2793b4f9f880125b5799086510ce102fad0222c1b093c60a6b38aa35ef56f97f86537269e8be95832aaa37d3b64d86b67f0cda467ac7cb5b3e'

describe('AddressValue', () => {
  const valid: [string, string, string][] = [
    [testVectorHash, testVectorSignature, testVectorAddress],
    [
      'bbec8ecdb31d60247c1b66461f46f3da15f8ae84877ba2cd1747b8a317e4aa12',
      '537141a59b50950bb98259be6c27ff00c3d51bca43179b5ec98454eb308255ee599ff8b29ca3445861e4c1c4669145b3f2d0e86e1bd59064a5104ef14576d93d',
      '5e7a847447e7fec41011ae7d32d768f86605ba03',
    ],
  ]

  beforeAll(async () => {
    for (let index = 0; index < 1; index++) {
      const account = new Account({ privateKey: testVectorPrivateKey })
      const payload = { data: Math.random(), schema: 'network.xyo.test' }
      const boundWitness = await new BoundWitnessBuilder().payload(payload).witness(account).build()
      const other = Hasher.hash(boundWitness[0])
      const message = boundWitness[0].payload_hashes[0]
      const signature = boundWitness[0]._signatures[0]
      const address = boundWitness[0].addresses[0]
      valid.push([message, other, address])
      const foo = await account.verify(message, signature)
      const bar = 1
    }
    const foo = 'bytesArray'
  })
  describe('verify', () => {
    it.each(valid)('Verifies a signature', (message, signature, address) => {
      expect(AddressValue.verify(message, signature, address)).toBeTrue()
    })
  })
})
