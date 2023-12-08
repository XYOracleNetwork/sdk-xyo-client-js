import { assertEx } from '@xylabs/assert'
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
  static override configSchemas = [PayloadStatsDivinerConfigSchema]

  protected async divineAddress(address: string): Promise<number> {
    const archivist = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const all = await assertEx(archivist.all, 'Archivist does not support "all"')()
    return all
      .filter(isBoundWitness)
      .filter((bw) => bw.addresses.includes(address))
      .map((bw) => bw.payload_hashes.length)
      .reduce((total, count) => total + count, 0)
  }

  protected async divineAllAddresses(): Promise<number> {
    const archivist = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const all = await assertEx(archivist.all, 'Archivist does not support "all"')()
    return all.length
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<PayloadStatsQueryPayload>(isPayloadStatsQueryPayload)
    if (!query) return []
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return await Promise.all(
      counts.map((count) => new PayloadBuilder<PayloadStatsPayload>({ schema: PayloadStatsDivinerSchema }).fields({ count }).build()),
    )
  }
}
