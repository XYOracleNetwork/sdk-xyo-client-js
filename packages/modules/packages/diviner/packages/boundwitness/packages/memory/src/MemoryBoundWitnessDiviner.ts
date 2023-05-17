import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
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
    const { address, addresses, payload_hashes, payload_schemas, limit, offset, order } = filter
    const all = await archivist.all()
    let bws = all.filter(isBoundWitness)
    if (order === 'desc') bws = bws.reverse()
    const allAddresses = concatAddressArrays(address, addresses)
    if (allAddresses?.length) {
      bws = bws.filter((bw) => arrayContainsAll(bw.addresses, allAddresses))
    }
    if (payload_hashes?.length) {
      bws = bws.filter((bw) => arrayContainsAll(bw.payload_hashes, payload_hashes))
    }
    if (payload_schemas?.length) {
      bws = bws.filter((bw) => arrayContainsAll(bw.payload_schemas, payload_schemas))
    }
    const parsedLimit = limit || bws.length
    const parsedOffset = offset || 0
    return bws.slice(parsedOffset, parsedLimit)
  }
}
const arrayContainsAll = (source: string[], target: string[]) => target.every((i) => source.includes(i))

const concatAddressArrays = (a: string | string[] | undefined, b: string | string[] | undefined): string[] => {
  return ([] as (string | undefined)[])
    .concat(a)
    .concat(b)
    .filter(exists)
    .map((x) => x.toLowerCase())
    .map((x) => (x.startsWith('0x') ? x.substring(2) : x))
}