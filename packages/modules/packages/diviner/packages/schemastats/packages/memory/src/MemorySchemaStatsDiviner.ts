import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import { isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { SchemaStatsDiviner } from '@xyo-network/diviner-schema-stats-abstract'
import type {
  SchemaStatsDivinerParams,
  SchemaStatsPayload,
  SchemaStatsQueryPayload,
} from '@xyo-network/diviner-schema-stats-model'
import {
  isSchemaStatsQueryPayload,
  SchemaStatsDivinerConfigSchema,
  SchemaStatsDivinerSchema,
} from '@xyo-network/diviner-schema-stats-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'

export class MemorySchemaStatsDiviner<TParams extends SchemaStatsDivinerParams = SchemaStatsDivinerParams> extends SchemaStatsDiviner<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, SchemaStatsDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = SchemaStatsDivinerConfigSchema

  protected async divineAddress(address: Address): Promise<Record<string, number>> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const all = await assertEx(archivist.all, () => 'Archivist does not support "all"')()
    const filtered = all
      .filter(isBoundWitnessWithStorageMeta)
      .filter(bw => bw.addresses.includes(address))
    // eslint-disable-next-line unicorn/no-array-reduce
    const counts: Record<string, number> = filtered.reduce(
      (acc, payload) => {
        acc[payload.schema] = acc[payload.schema] ? acc[payload.schema] + 1 : 1
        return acc
      },
      {} as Record<string, number>,
    )
    return counts
  }

  protected async divineAllAddresses(): Promise<Record<string, number>> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const all = await assertEx(archivist.all, () => 'Archivist does not support "all"')()
    // eslint-disable-next-line unicorn/no-array-reduce
    const counts: Record<string, number> = all.reduce(
      (acc, payload) => {
        acc[payload.schema] = acc[payload.schema] ? acc[payload.schema] + 1 : 1
        return acc
      },
      {} as Record<string, number>,
    )
    return counts
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<SchemaStatsQueryPayload>(isSchemaStatsQueryPayload)
    if (!query) return []
    const addresses
      = query?.address
        ? Array.isArray(query?.address)
          ? query.address
          : [query.address]
        : undefined
    const counts = addresses ? await Promise.all(addresses.map(address => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return await Promise.all(
      counts.map(count => new PayloadBuilder<SchemaStatsPayload>({ schema: SchemaStatsDivinerSchema }).fields({ count }).build()),
    )
  }
}
