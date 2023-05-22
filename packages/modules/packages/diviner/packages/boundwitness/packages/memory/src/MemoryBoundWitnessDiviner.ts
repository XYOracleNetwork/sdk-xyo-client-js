import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { normalizeAddress } from '@xyo-network/core'
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
    const archivistMod = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const { addresses, payload_hashes, payload_schemas, limit, offset, order } = filter
    const all = await archivist.all()
    let bws = all.filter(isBoundWitness)
    if (order === 'desc') bws = bws.reverse()
    const allAddresses = addresses?.map(normalizeAddress)
    if (allAddresses?.length) bws = bws.filter((bw) => containsAll(bw.addresses, allAddresses))
    if (payload_hashes?.length) bws = bws.filter((bw) => containsAll(bw.payload_hashes, payload_hashes))
    if (payload_schemas?.length) bws = bws.filter((bw) => containsAll(bw.payload_schemas, payload_schemas))
    const parsedLimit = limit || bws.length
    const parsedOffset = offset || 0
    return bws.slice(parsedOffset, parsedLimit)
  }
}
