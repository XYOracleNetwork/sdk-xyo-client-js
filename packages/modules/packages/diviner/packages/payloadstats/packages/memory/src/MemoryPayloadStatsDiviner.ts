import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadStatsDiviner } from '@xyo-network/diviner-payload-stats-abstract'
import {
  isPayloadStatsQueryPayload,
  PayloadStatsDivinerConfigSchema,
  PayloadStatsDivinerParams,
  PayloadStatsDivinerSchema,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
} from '@xyo-network/diviner-payload-stats-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export class MemoryPayloadStatsDiviner<TParams extends PayloadStatsDivinerParams = PayloadStatsDivinerParams> extends PayloadStatsDiviner<TParams> {
  static override configSchema = PayloadStatsDivinerConfigSchema

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<PayloadStatsQueryPayload>(isPayloadStatsQueryPayload)
    if (!query) return []
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new PayloadBuilder<PayloadStatsPayload>({ schema: PayloadStatsDivinerSchema }).fields({ count }).build())
  }

  protected async divineAddress(address: string): Promise<number> {
    const archivistMod = assertEx((await this.upResolver.resolve(this.config.archivist)).pop(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const all = await archivist.all()
    return all
      .filter(isBoundWitness)
      .filter((bw) => bw.addresses.includes(address))
      .map((bw) => bw.payload_hashes.length)
      .reduce((total, count) => total + count, 0)
  }

  protected async divineAllAddresses(): Promise<number> {
    const archivistMod = assertEx((await this.upResolver.resolve(this.config.archivist)).pop(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const all = await archivist.all()
    return all.length
  }
}
