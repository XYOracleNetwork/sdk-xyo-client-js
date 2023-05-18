import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { SchemaListDiviner } from '@xyo-network/diviner-schema-stats-abstract'
import {
  isSchemaListQueryPayload,
  SchemaListDivinerConfigSchema,
  SchemaListDivinerParams,
  SchemaListDivinerSchema,
  SchemaListPayload,
  SchemaListQueryPayload,
} from '@xyo-network/diviner-schema-stats-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export class MemorySchemaListDiviner<TParams extends SchemaListDivinerParams = SchemaListDivinerParams> extends SchemaListDiviner<TParams> {
  static override configSchema = SchemaListDivinerConfigSchema

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<SchemaListQueryPayload>(isSchemaListQueryPayload)
    if (!query) return []
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new PayloadBuilder<SchemaListPayload>({ schema: SchemaListDivinerSchema }).fields({ count }).build())
  }

  protected async divineAddress(address: string): Promise<Record<string, number>> {
    const archivistMod = assertEx((await this.upResolver.resolve(this.config.archivist)).pop(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const all = await archivist.all()
    const filtered = all.filter(isBoundWitness).filter((bw) => bw.addresses.includes(address))
    const counts: Record<string, number> = filtered.reduce((acc, payload) => {
      acc[payload.schema] = acc[payload.schema] ? acc[payload.schema] + 1 : 1
      return acc
    }, {} as Record<string, number>)
    return counts
  }

  protected async divineAllAddresses(): Promise<Record<string, number>> {
    const archivistMod = assertEx((await this.upResolver.resolve(this.config.archivist)).pop(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const all = await archivist.all()
    const counts: Record<string, number> = all.reduce((acc, payload) => {
      acc[payload.schema] = acc[payload.schema] ? acc[payload.schema] + 1 : 1
      return acc
    }, {} as Record<string, number>)
    return counts
  }
}
