import '@xylabs/vitest-extended'

import { PayloadBuilder } from '@xyo-network/payload-builder'
import { HDWallet } from '@xyo-network/wallet'
import {
  afterAll,
  beforeAll,
  describe, expect, it,
  vi,
} from 'vitest'

import { BoundWitnessBuilder } from '../BoundWitnessBuilder.ts'

const payloadSequences = [
  {
    payloads: [{ salt: '0', schema: 'network.xyo.id' }],
    payloadHashes: [
      'ada56ff753c0c9b2ce5e1f823eda9ac53501db2843d8883d6cf6869c18ef7f65',
    ],
  },
  {
    payloads: [{ salt: '1', schema: 'network.xyo.id' }],
    payloadHashes: [
      '3a3b8deca568ff820b0b7c8714fbdf82b40fb54f4b15aca8745e06b81291558e',
    ],
  },
  {
    payloads: [{ salt: '2', schema: 'network.xyo.id' }, { salt: '3', schema: 'network.xyo.id' }],
    payloadHashes: [
      '1a40207fab71fc184e88557d5bee6196cbbb49f11f73cda85000555a628a8f0a',
      'c4bce9b4d3239fcc9a248251d1bef1ba7677e3c0c2c43ce909a6668885b519e6',
    ],
  },
  {
    payloads: [{ salt: '4', schema: 'network.xyo.id' }, { salt: '5', schema: 'network.xyo.id' }],
    payloadHashes: [
      '59c0374dd801ae64ddddba27320ca028d7bd4b3d460f6674c7da1b4aa9c956d6',
      '5d9b8e84bc824280fcbb6290904c2edbb401d626ad9789717c0a23d1cab937b0',
    ],
  },
]

const wallet1Mnemonic
  = 'report door cry include salad horn recipe luxury access pledge husband maple busy double olive'
const wallet1Path = "m/44'/60'/0'/0/0"
const wallet1Address = '25524Ca99764D76CA27604Bb9727f6e2f27C4533'

const wallet2Mnemonic
  = 'turn you orphan sauce act patient village entire lava transfer height sense enroll quit idle'
const wallet2Path = "m/44'/60'/0'/0/0"
const wallet2Address = 'FdCeD2c3549289049BeBf743fB721Df211633fBF'

const boundWitnessSequenceTestCase1 = {
  mnemonics: [wallet1Mnemonic],
  paths: [wallet1Path],
  addresses: [wallet1Address],
  payloads: payloadSequences[0].payloads,
  payloadHashes: payloadSequences[0].payloadHashes,
  previousHashes: [null],
  dataHash: '750113b9826ba94b622667b06cd8467f1330837581c28907c16160fec20d0a4b',
}

const boundWitnessSequenceTestCase2 = {
  mnemonics: [wallet2Mnemonic],
  paths: [wallet2Path],
  addresses: [wallet2Address],
  payloads: payloadSequences[1].payloads,
  payloadHashes: payloadSequences[1].payloadHashes,
  previousHashes: [null],
  dataHash: 'bacd010d79126a154339e59c11c5b46be032c3bef65626f83bcafe968dc6dd1b',
}

const boundWitnessSequenceTestCase3 = {
  mnemonics: [wallet1Mnemonic, wallet2Mnemonic],
  paths: [wallet1Path, wallet2Path],
  addresses: [wallet1Address, wallet2Address],
  payloads: payloadSequences[2].payloads,
  payloadHashes: payloadSequences[2].payloadHashes,
  previousHashes: [
    '750113b9826ba94b622667b06cd8467f1330837581c28907c16160fec20d0a4b',
    'bacd010d79126a154339e59c11c5b46be032c3bef65626f83bcafe968dc6dd1b',
  ],
  dataHash: '73245ef73517913f4b57c12d56d81199968ecd8fbefea9ddc474f43dd6cfa8c8',
}

const boundWitnessSequenceTestCase4 = {
  mnemonics: [wallet1Mnemonic, wallet2Mnemonic],
  paths: [wallet1Path, wallet2Path],
  addresses: [wallet1Address, wallet2Address],
  payloads: payloadSequences[3].payloads,
  payloadHashes: payloadSequences[3].payloadHashes,
  previousHashes: [
    '73245ef73517913f4b57c12d56d81199968ecd8fbefea9ddc474f43dd6cfa8c8',
    '73245ef73517913f4b57c12d56d81199968ecd8fbefea9ddc474f43dd6cfa8c8',
  ],
  dataHash: '210d86ea43d82b85a49b77959a8ee4e6016ff7036254cfa39953befc66073010',
}

const boundWitnessSequenceTestCases = [
  boundWitnessSequenceTestCase1,
  boundWitnessSequenceTestCase2,
  boundWitnessSequenceTestCase3,
  boundWitnessSequenceTestCase4,
]

describe.sequential('BoundWitnessBuilder', () => {
  beforeAll(() => {
    // This is here and brittle because the BoundWitnessBuilder
    // uses Date.now() to generate timestamps and our test vectors were
    // generated without them. We need to find a better way to handle
    // this but for now this gives us parity with the vectors in other
    // language's test cases.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(Date, 'now').mockImplementation(() => undefined as any)
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })
  describe('Sequence Tests', () => {
    it.each(boundWitnessSequenceTestCases)('Consistently reproduces sequence', async (testCase) => {
      // Create accounts
      const signers = await Promise.all(testCase.mnemonics.map(async (mnemonic, i) => {
        const path = testCase.paths[i]
        return await HDWallet.fromPhrase(mnemonic, path)
      }))

      expect(signers.length).to.equal(testCase.addresses.length)
      const actualAddresses = signers.map(signer => signer.address.toLowerCase())
      const expectedAddresses = testCase.addresses.map(address => address.toLowerCase())
      expect(actualAddresses).toEqual(expectedAddresses)

      // Ensure correct initial account state
      for (let i = 0; i < testCase.previousHashes.length; i++) {
        const previousHash = testCase.previousHashes[i]
        expect(previousHash).toEqual(testCase.previousHashes[i])
      }

      // Build the BW
      const [bw] = await new BoundWitnessBuilder()
        .signers(signers)
        .payloads(testCase.payloads)
        .build()

      // Ensure the BW is corrects
      expect(await PayloadBuilder.dataHash(bw)).toEqual(testCase.dataHash)

      for (let i = 0; i < testCase.payloadHashes.length; i++) {
        const expectedPayloadHash = testCase.payloadHashes[i]
        const actualPayloadHash = bw.payload_hashes[i]
        expect(expectedPayloadHash).to.equal(
          actualPayloadHash,
          'Incorrect payload hash in BW',
        )
      }

      for (let i = 0; i < testCase.payloads.length; i++) {
        const payload = testCase.payloads[i]
        const actualSchema = bw.payload_schemas[i]
        expect(payload.schema).to.equal(
          actualSchema,
          'Incorrect payload schema in BW',
        )
      }

      // Ensure correct ending account state
      for (const signer of signers) {
        expect(signer.previousHash).to.equal(
          await PayloadBuilder.dataHash(bw),
          'Incorrect previous hash for account',
        )
      }
    })
  })
})
