import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
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
import { Payload } from '@xyo-network/payload-model'

export class MemoryBoundWitnessStatsDiviner<
  TParams extends BoundWitnessStatsDivinerParams = BoundWitnessStatsDivinerParams,
> extends BoundWitnessStatsDiviner<TParams> {
  static override configSchema = BoundWitnessStatsDivinerConfigSchema

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<BoundWitnessStatsQueryPayload>(isBoundWitnessStatsQueryPayload)
    if (!query) return []
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new PayloadBuilder<BoundWitnessStatsPayload>({ schema: BoundWitnessStatsDivinerSchema }).fields({ count }).build())
  }

  protected async divineAddress(address: string): Promise<number> {
    const archivistMod = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const all = await archivist.all()
    return all.filter(isBoundWitness).filter((bw) => bw.addresses.includes(address)).length
  }

  protected async divineAllAddresses(): Promise<number> {
    const archivistMod = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const all = await archivist.all()
    return all.filter(isBoundWitness).length
  }
}
