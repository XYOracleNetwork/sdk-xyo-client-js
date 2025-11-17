import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import { isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { PayloadStatsDiviner } from '@xyo-network/diviner-payload-stats-abstract'
import type {
  PayloadStatsDivinerParams,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
} from '@xyo-network/diviner-payload-stats-model'
import {
  isPayloadStatsQueryPayload,
  PayloadStatsDivinerConfigSchema,
  PayloadStatsDivinerSchema,
} from '@xyo-network/diviner-payload-stats-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'

export class MemoryPayloadStatsDiviner<TParams extends PayloadStatsDivinerParams = PayloadStatsDivinerParams> extends PayloadStatsDiviner<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, PayloadStatsDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = PayloadStatsDivinerConfigSchema

  protected async divineAddress(address: Address): Promise<number> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    return (await archivist.next({ limit: 20_000 }))
      .filter(isBoundWitnessWithStorageMeta)
      .filter(bw => bw.addresses.includes(address))
      .map(bw => bw.payload_hashes.length)
      .reduce((total, count) => total + count, 0)
  }

  protected async divineAllAddresses(): Promise<number> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const all = await archivist.next({ limit: 20_000 })
    return all.length
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<PayloadStatsQueryPayload>(isPayloadStatsQueryPayload)
    if (!query) return []
    const addresses
      = query?.address
        ? Array.isArray(query?.address)
          ? query.address
          : [query.address]
        : undefined
    const counts = addresses ? await Promise.all(addresses.map(address => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return await Promise.all(
      counts.map(count => new PayloadBuilder<PayloadStatsPayload>({ schema: PayloadStatsDivinerSchema }).fields({ count }).build()),
    )
  }
}
