import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import {
  BoundWitnessDivinerConfigSchema,
  BoundWitnessDivinerParams,
  isBoundWitnessDivinerQueryPayload,
} from '@xyo-network/diviner-boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export class MemoryBoundWitnessDiviner<TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams> extends BoundWitnessDiviner<TParams> {
  static override configSchema = BoundWitnessDivinerConfigSchema

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    const filter = assertEx(payloads?.filter(isBoundWitnessDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    const archivistMod = assertEx((await this.upResolver.resolve(this.config.archivist)).pop(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const all = await archivist.all()
    const bw = all.filter(isBoundWitness)
    // TODO: Filter by query payload
    throw new Error('Method not implemented.')
  }
}
