import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { isBoundWitness, isBoundWitnessWithMeta } from '@xyo-network/boundwitness-model'
import { BoundWitnessStatsDiviner } from '@xyo-network/diviner-boundwitness-stats-abstract'
import {
  BoundWitnessStatsDivinerConfigSchema,
  BoundWitnessStatsDivinerParams,
  BoundWitnessStatsDivinerSchema,
  BoundWitnessStatsPayload,
  BoundWitnessStatsQueryPayload,
  isBoundWitnessStatsQueryPayload,
} from '@xyo-network/diviner-boundwitness-stats-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, Schema } from '@xyo-network/payload-model'

export class MemoryBoundWitnessStatsDiviner<
  TParams extends BoundWitnessStatsDivinerParams = BoundWitnessStatsDivinerParams,
> extends BoundWitnessStatsDiviner<TParams> {
  static override configSchemas: Schema[] = [...super.configSchemas, BoundWitnessStatsDivinerConfigSchema]
  static override defaultConfigSchema: Schema = BoundWitnessStatsDivinerConfigSchema

  protected async divineAddress(address: Address): Promise<number> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const all = assertEx(await archivist.all?.(), () => 'Archivist does not support "all"')
    return all
      .filter(isBoundWitness)
      .filter(isBoundWitnessWithMeta)
      .filter((bw) => bw.addresses.includes(address)).length
  }

  protected async divineAllAddresses(): Promise<number> {
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const all = assertEx(await archivist.all?.(), () => 'Archivist does not support "all"')
    return all.filter(isBoundWitness).length
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<BoundWitnessStatsQueryPayload>(isBoundWitnessStatsQueryPayload)
    if (!query) return []
    const addresses =
      query?.address ?
        Array.isArray(query?.address) ?
          query.address
        : [query.address]
      : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return await Promise.all(
      counts.map((count) => new PayloadBuilder<BoundWitnessStatsPayload>({ schema: BoundWitnessStatsDivinerSchema }).fields({ count }).build()),
    )
  }
}
