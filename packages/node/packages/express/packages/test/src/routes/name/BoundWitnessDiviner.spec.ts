import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerDivineQuerySchema, DivinerInstance } from '@xyo-network/diviner'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import {
  getArchivist,
  getDivinerByName,
  getNewBoundWitness,
  getNewPayload,
  getTestSchemaName,
  nonExistentHash,
  unitTestSigningAccount,
  validateDiscoverResponse,
} from '../../testUtil'

const schema = BoundWitnessDivinerQuerySchema

const moduleName = 'BoundWitnessDiviner'
describe(`/${moduleName}`, () => {
  let account: AccountInstance
  let diviner: DivinerInstance
  let archivist: ArchivistInstance

  beforeAll(async () => {
    account = await unitTestSigningAccount()
    diviner = await getDivinerByName(moduleName)
    archivist = await getArchivist()
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('discovers', async () => {
      const response = await diviner.discover()
      expect(response).toBeArray()
      validateDiscoverResponse(response, [DivinerDivineQuerySchema])
    })
  })
  describe('DivinerDivineQuerySchema', () => {
    const accountA = Account.randomSync()
    const accountB = Account.randomSync()
    const boundWitnesses: BoundWitnessWrapper[] = []
    beforeAll(async () => {
      const boundWitnessA = BoundWitnessWrapper.parse((await getNewBoundWitness([accountA], [getNewPayload()]))[0])
      const boundWitnessB = BoundWitnessWrapper.parse((await getNewBoundWitness([accountB], [getNewPayload()]))[0])
      const boundWitnessC = BoundWitnessWrapper.parse((await getNewBoundWitness([accountA, accountB], [getNewPayload(), getNewPayload()]))[0])
      boundWitnesses.push(boundWitnessA, boundWitnessB, boundWitnessC)
      await archivist.insert(boundWitnesses.map((b) => b.boundwitness))
    })
    describe('address', () => {
      const cases: [title: string, addresses: string[], expected: () => BoundWitnessWrapper[]][] = [
        ['single address returns boundWitnesses signed by address', [accountA.address], () => [boundWitnesses[0], boundWitnesses[2]]],
        ['single address returns boundWitnesses signed by address', [accountB.address], () => [boundWitnesses[1], boundWitnesses[2]]],
        ['multiple addresses returns boundWitnesses signed by both addresses', [accountA.address, accountB.address], () => [boundWitnesses[2]]],
        [
          'multiple addresses returns boundWitnesses signed by both addresses (independent of order)',
          [accountB.address, accountA.address],
          () => [boundWitnesses[2]],
        ],
      ]
      describe.each(cases)('with %s', (_title, addresses, data) => {
        it('divines BoundWitnesses by address', async () => {
          const expected = data()
          const query: BoundWitnessDivinerQueryPayload = { addresses, schema }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(expected.length)
          const responseHashes = await Promise.all(response.map((p) => PayloadWrapper.hashAsync(p)))
          expect(responseHashes).toContainAllValues(await Promise.all(expected.map((p) => p.hashAsync())))
        })
      })
    })
    describe('hash', () => {
      let boundWitness: BoundWitnessWrapper
      beforeAll(async () => {
        boundWitness = BoundWitnessWrapper.parse((await getNewBoundWitness([account]))[0])
        await archivist.insert([boundWitness.payload()])
      })
      it('divines BoundWitnesses by hash', async () => {
        const hash = await boundWitness.hashAsync()
        const query: BoundWitnessDivinerQueryPayload = { hash, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(1)
        const responseHashes = await Promise.all(response.map((p) => PayloadWrapper.hashAsync(p)))
        expect(responseHashes).toContainAllValues([await boundWitness.hashAsync()])
      })
      it('returns empty array for non-existent hash', async () => {
        const hash = nonExistentHash
        const query: BoundWitnessDivinerQueryPayload = { hash, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(0)
      })
    })
    describe('limit', () => {
      let boundWitnesses: BoundWitness[]
      beforeAll(async () => {
        boundWitnesses = [(await getNewBoundWitness())[0], (await getNewBoundWitness())[0]]
        await archivist.insert(boundWitnesses)
      })
      it.each([1, 2])('returns the specified number of BoundWitnesses', async (limit) => {
        const query: BoundWitnessDivinerQueryPayload = { limit, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(limit)
      })
    })
    describe('offset', () => {
      const account = Account.randomSync()
      const address = account.address
      let boundWitnesses: BoundWitnessWrapper[]
      beforeAll(async () => {
        boundWitnesses = [(await getNewBoundWitness([account]))[0], (await getNewBoundWitness([account]))[0]].map((bw) =>
          BoundWitnessWrapper.parse(bw),
        )
        await archivist.insert(boundWitnesses.map((b) => b.boundwitness))
      })
      describe('with timestamp', () => {
        it('divines BoundWitnesses from offset', async () => {
          const timestamp = assertEx(boundWitnesses[boundWitnesses.length - 1].boundwitness.timestamp, 'Missing timestamp in test BW') + 1
          const limit = boundWitnesses.length
          const query: BoundWitnessDivinerQueryPayload = { address, limit, schema, timestamp }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(boundWitnesses.length)
          const responseHashes = await Promise.all(response.map((p) => BoundWitnessWrapper.hashAsync(p)))
          const expected = await Promise.all(boundWitnesses.map((p) => p.hashAsync()))
          expect(responseHashes).toContainAllValues(expected)
        })
      })
    })
    describe('order', () => {
      it.skip('divines BoundWitnesses in order', async () => {
        await Promise.resolve()
        throw new Error('Not Implemented')
      })
    })
    describe('payload_schemas', () => {
      const schemaA = getTestSchemaName()
      const schemaB = getTestSchemaName()
      const payloadBaseA = getNewPayload()
      payloadBaseA.schema = schemaA
      const payloadA: PayloadWrapper = PayloadWrapper.wrap(payloadBaseA)
      const payloadBaseB = getNewPayload()
      payloadBaseB.schema = schemaB
      const payloadB: PayloadWrapper = PayloadWrapper.wrap(payloadBaseB)
      const boundWitnesses: BoundWitnessWrapper[] = []
      beforeAll(async () => {
        const boundWitnessA = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadA.payload()]))[0])
        const boundWitnessB = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadB.payload()]))[0])
        const boundWitnessC = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadA.payload(), payloadB.payload()]))[0])
        boundWitnesses.push(boundWitnessA, boundWitnessB, boundWitnessC)
        await archivist.insert(boundWitnesses.map((b) => b.payload()))
      })
      const cases: [title: string, payload_schemas: string[], expected: () => BoundWitnessWrapper[]][] = [
        ['single schema', [schemaA], () => [boundWitnesses[0], boundWitnesses[2]]],
        ['single schema', [schemaB], () => [boundWitnesses[1], boundWitnesses[2]]],
        ['multiple schemas', [schemaA, schemaB], () => [boundWitnesses[0], boundWitnesses[1], boundWitnesses[2]]],
      ]
      describe.each(cases)('with %s', (_title, payload_schemas, data) => {
        it('divines BoundWitnesses that contain any of the supplied schemas in payload_schemas', async () => {
          const expected = data()
          const query: BoundWitnessDivinerQueryPayload = { payload_schemas, schema }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(expected.length)
          const responseHashes = await Promise.all(response.map((p) => PayloadWrapper.hashAsync(p)))
          expect(responseHashes).toContainAllValues(await Promise.all(expected.map((p) => p.hashAsync())))
        })
      })
    })
  })
})
