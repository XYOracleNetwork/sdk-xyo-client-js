import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { hexFromHexString } from '@xylabs/hex'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import {
  BoundWitnessDivinerConfigSchema,
  BoundWitnessDivinerParams,
  isBoundWitnessDivinerQueryPayload,
} from '@xyo-network/diviner-boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export class MemoryBoundWitnessDiviner<TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams> extends BoundWitnessDiviner<TParams> {
  static override configSchemas = [BoundWitnessDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const filter = assertEx(payloads?.filter(isBoundWitnessDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.getArchivist(), 'Unable to resolve archivist')
    const { addresses, payload_hashes, payload_schemas, limit, offset, order, sourceQuery } = filter
    let bws = ((await archivist?.all?.()) ?? []).filter(isBoundWitness)
    if (order === 'desc') bws = bws.reverse()
    const allAddresses = addresses?.map((address) => hexFromHexString(address)).filter(exists)
    if (allAddresses?.length) bws = bws.filter((bw) => containsAll(bw.addresses, allAddresses))
    if (payload_hashes?.length) bws = bws.filter((bw) => containsAll(bw.payload_hashes, payload_hashes))
    if (payload_schemas?.length) bws = bws.filter((bw) => containsAll(bw.payload_schemas, payload_schemas))
    if (sourceQuery) bws = bws.filter((bw) => (bw?.$meta as Partial<{ sourceQuery: string }>)?.sourceQuery === sourceQuery)
    const parsedLimit = limit ?? bws.length
    const parsedOffset = offset ?? 0
    return bws.slice(parsedOffset, parsedLimit)
  }
}
