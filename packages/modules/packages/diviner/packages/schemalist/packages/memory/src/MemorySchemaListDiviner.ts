import { distinct } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import { isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { SchemaListDiviner } from '@xyo-network/diviner-schema-list-abstract'
import type {
  SchemaListDivinerParams,
  SchemaListPayload,
  SchemaListQueryPayload,
} from '@xyo-network/diviner-schema-list-model'
import {
  isSchemaListQueryPayload,
  SchemaListDivinerConfigSchema,
  SchemaListDivinerSchema,
} from '@xyo-network/diviner-schema-list-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'

export class MemorySchemaListDiviner<TParams extends SchemaListDivinerParams = SchemaListDivinerParams> extends SchemaListDiviner<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, SchemaListDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = SchemaListDivinerConfigSchema

  protected async divineAddress(address: Address): Promise<string[]> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const filtered = (await archivist.next({ limit: 20_000 }))
      .filter(isBoundWitnessWithStorageMeta)
      .filter(bw => bw.addresses.includes(address))
    return filtered.flatMap(bw => bw.payload_schemas).filter(distinct)
  }

  protected async divineAllAddresses(): Promise<string[]> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const all = await archivist.next({ limit: 20_000 })
    return all.map(payload => payload.schema).filter(distinct)
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<SchemaListQueryPayload>(isSchemaListQueryPayload)
    if (!query) return []
    const addresses
      = query?.address
        ? Array.isArray(query?.address)
          ? query.address
          : [query.address]
        : undefined
    const results = addresses ? await Promise.all(addresses.map(address => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return await Promise.all(
      results.map(schemas => new PayloadBuilder<SchemaListPayload>({ schema: SchemaListDivinerSchema }).fields({ schemas }).build()),
    )
  }
}
