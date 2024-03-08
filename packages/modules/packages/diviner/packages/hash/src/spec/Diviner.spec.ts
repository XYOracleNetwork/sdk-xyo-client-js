import { PayloadBuilder } from '@xyo-network/payload-builder'
import { WithMeta } from '@xyo-network/payload-model'

import { HashLease, HashLeaseEstimateDiviner, HashLeaseEstimateSchema, HashLeaseSchema, Name, NameSchema } from '../Diviner'

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

describe('HashLeaseEstimateDiviner', () => {
  it('allowed (3)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abc',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(1210)
      expect(outPayload.price).toBeLessThanOrEqual(1219)
    }
  })
  it('allowed (4)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abcd',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(382)
      expect(outPayload.price).toBeLessThanOrEqual(384)
    }
  })
  it('allowed (5)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abcde',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(190)
      expect(outPayload.price).toBeLessThanOrEqual(192)
    }
  })
  it('allowed (6)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abcdef',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(118)
      expect(outPayload.price).toBeLessThanOrEqual(120)
    }
  })
  it('allowed (7)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abcdefg',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(84)
      expect(outPayload.price).toBeLessThanOrEqual(86)
    }
  })
  it('allowed (8)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abcdefgh',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(65)
      expect(outPayload.price).toBeLessThanOrEqual(67)
    }
  })
  it('allowed (9)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abcdefghi',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(53)
      expect(outPayload.price).toBeLessThanOrEqual(55)
    }
  })
  it('allowed (10)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'abcdefghij',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(46)
      expect(outPayload.price).toBeLessThanOrEqual(48)
    }
  })
  it('allowed (11)', async () => {
    const diviner = await HashLeaseEstimateDiviner.create({ account: 'random' })
    const name = await PayloadBuilder.build<Name>({
      name: 'ksdjfhsdkjh',
      schema: NameSchema,
    })
    const lease = (await PayloadBuilder.build({
      expire: Date.now() + ONE_YEAR,
      schema: HashLeaseSchema,
      sources: [name.$hash],
    })) as WithMeta<HashLease>
    const outPayload = (await diviner.divine([name, lease])).at(0)
    expect(outPayload).toBeDefined()
    if (outPayload) {
      expect(outPayload.schema).toBe(HashLeaseEstimateSchema)
      expect(outPayload.price).toBeGreaterThan(40)
      expect(outPayload.price).toBeLessThanOrEqual(42)
    }
  })
})
