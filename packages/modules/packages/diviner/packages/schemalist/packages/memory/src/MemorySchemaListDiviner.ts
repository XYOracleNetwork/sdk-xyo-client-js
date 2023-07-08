import { distinct } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { SchemaListDiviner } from '@xyo-network/diviner-schema-list-abstract'
import {
  isSchemaListQueryPayload,
  SchemaListDivinerConfigSchema,
  SchemaListDivinerParams,
  SchemaListDivinerSchema,
  SchemaListPayload,
  SchemaListQueryPayload,
} from '@xyo-network/diviner-schema-list-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export class MemorySchemaListDiviner<TParams extends SchemaListDivinerParams = SchemaListDivinerParams> extends SchemaListDiviner<TParams> {
  static override configSchemas = [SchemaListDivinerConfigSchema]

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<SchemaListQueryPayload>(isSchemaListQueryPayload)
    if (!query) return []
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const results = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return results.map((schemas) => new PayloadBuilder<SchemaListPayload>({ schema: SchemaListDivinerSchema }).fields({ schemas }).build())
  }

  protected async divineAddress(address: string): Promise<string[]> {
    const archivist = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const all = await assertEx(archivist.all, 'Archivist does not support "all"')()
    const filtered = all.filter(isBoundWitness).filter((bw) => bw.addresses.includes(address))
    return filtered
      .map((bw) => bw.payload_schemas)
      .flat()
      .filter(distinct)
  }

  protected async divineAllAddresses(): Promise<string[]> {
    const archivist = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const all = await assertEx(archivist.all, 'Archivist does not support "all"')()
    return all.map((payload) => payload.schema).filter(distinct)
  }
}
