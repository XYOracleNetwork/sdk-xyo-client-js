import { assertEx } from '@xylabs/assert'
import { ArchivistParams } from '@xyo-network/archivist-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaTypeWithMeta, Payload, WithSources } from '@xyo-network/payload-model'

import { reservedBrands } from './reservedBrands'
import { reservedCryptos } from './reservedCryptos'
import { reservedDomains } from './reservedDomains'

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

export const HashLeaseEstimateDivinerConfigSchema = 'network.xyo.diviner.hash.lease.estimate.config'
export type HashLeaseEstimateDivinerConfigSchema = typeof HashLeaseEstimateDivinerConfigSchema

export type HashLeaseEstimateDivinerConfig = DivinerConfig<
  {
    baseMonthlyPrice?: number
    characterLengthFactor?: number
    minNameLength?: number
  },
  HashLeaseEstimateDivinerConfigSchema
>

export type HashLeaseEstimateDivinerParams<
  TConfig extends AnyConfigSchema<HashLeaseEstimateDivinerConfig> = AnyConfigSchema<HashLeaseEstimateDivinerConfig>,
> = ArchivistParams<TConfig>

export const NameSchema = 'network.xyo.name'
export type NameSchema = typeof NameSchema

export type Name = Payload<{ name: string }, NameSchema>

export const HashLeaseSchema = 'network.xyo.hash.lease'
export type HashLeaseSchema = typeof HashLeaseSchema

export type HashLease = Payload<
  {
    expire: number
  },
  HashLeaseSchema
>

export const HashLeaseEstimateSchema = 'network.xyo.hash.lease.estimate'
export type HashLeaseEstimateSchema = typeof HashLeaseEstimateSchema

export type HashLeaseEstimate = Payload<{ price: number }, HashLeaseEstimateSchema>

@creatableModule()
export class HashLeaseEstimateDiviner<
  TParams extends HashLeaseEstimateDivinerParams = HashLeaseEstimateDivinerParams,
  TIn extends WithSources<HashLease> | Name = WithSources<HashLease> | Name,
> extends AbstractDiviner<TParams, TIn, HashLeaseEstimate> {
  static override configSchemas = [HashLeaseEstimateDivinerConfigSchema]
  static override targetSchema = HashLeaseEstimateSchema

  private _reservedFragments: string[] = ['xyo', 'xy', 'coin', 'lifehash', 'foreventry']

  private _reservedStrings?: string[]

  get baseMonthlyPrice() {
    return this.config.baseMonthlyPrice ?? 4
  }

  get characterLengthFactor() {
    return this.config.characterLengthFactor ?? 10
  }

  get minNameLength() {
    return this.config.minNameLength ?? 3
  }

  get reservedStrings() {
    this._reservedStrings =
      this._reservedStrings ??
      [
        reservedBrands.map(({ name }) => name),
        ...reservedDomains.map(({ name }) => name.split('.')),
        ...reservedCryptos.map(({ name, symbol }) => [name, symbol]),
      ]
        .flat()
        .map((item) => item.toLowerCase())
    return this._reservedStrings
  }

  protected override async divineHandler(payloads: TIn[] = []): Promise<WithSources<HashLeaseEstimate>[]> {
    const leases = await PayloadBuilder.build(
      payloads.filter(isPayloadOfSchemaTypeWithMeta<WithSources<HashLease>>(HashLeaseSchema)) as WithSources<HashLease>[],
    )
    const payloadMap = await PayloadBuilder.toDataHashMap(payloads)
    return leases.map((lease) => {
      const sources = lease.sources ?? []
      assertEx(sources.length === 1, () => 'Must pass single source')
      const leaseSource = assertEx(sources.at(0), () => 'Failed to load lease source')
      const sourcePayload = assertEx(payloadMap[leaseSource], () => 'Hash lease payload not provided')
      assertEx(sourcePayload.schema === NameSchema, () => `Invalid source schema [${sourcePayload.schema}]`)
      const sourceName = sourcePayload as Name

      const duration = lease.expire - Date.now()

      assertEx(duration <= ONE_YEAR, () => 'Max expiration may be one year in the future')
      assertEx(duration >= ONE_YEAR / 2, () => 'Min expiration must be half year in the future')

      //check if all lowercase
      assertEx(sourceName.name.toLowerCase() === sourceName.name, () => 'name must be lowercase')

      //check if min length
      assertEx(sourceName.name.length >= this.minNameLength, () => 'name must be at least 3 characters')

      //check if in one of the reserved name lists
      assertEx(!this.reservedStrings.includes(sourceName.name), () => 'Reserved name')

      //check if any of our fragments are in the name
      for (const reserved of this._reservedFragments) {
        assertEx(!sourceName.name.includes(reserved), () => 'Reserved name fragment')
      }
      const price = this.calculateLengthCost(sourceName.name, duration)
      return { price, schema: HashLeaseEstimateSchema, sources: [lease.$hash] }
    })
  }

  private calculateLengthCost(name: string, duration: number) {
    const exponent = this.characterLengthFactor / name.length
    const rawMonthlyCost = Math.pow(this.baseMonthlyPrice, exponent)
    const months = (duration / ONE_YEAR) * 12
    const proratedAnnualPrice = months * rawMonthlyCost
    return Math.floor(proratedAnnualPrice)
  }
}
