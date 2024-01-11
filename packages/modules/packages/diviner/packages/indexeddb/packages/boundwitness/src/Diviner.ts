import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { hexFromHexString } from '@xylabs/hex'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { isBoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { IndexedDbBoundWitnessDivinerConfigSchema } from './Config'
import { IndexedDbBoundWitnessDivinerParams } from './Params'

export class IndexedDbBoundWitnessDiviner<
  TParams extends IndexedDbBoundWitnessDivinerParams = IndexedDbBoundWitnessDivinerParams,
> extends BoundWitnessDiviner<TParams> {
  static override configSchemas = [IndexedDbBoundWitnessDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const filter = assertEx(payloads?.filter(isBoundWitnessDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { addresses, payload_hashes, payload_schemas, limit, offset, order } = filter
    // TODO: Implement via schema index
    // Index on schema_payload_schemas
    // let bws = ((await archivist?.all?.()) ?? []).filter(isBoundWitness)
    // if (order === 'desc') bws = bws.reverse()
    // const allAddresses = addresses?.map((address) => hexFromHexString(address)).filter(exists)
    // if (allAddresses?.length) bws = bws.filter((bw) => containsAll(bw.addresses, allAddresses))
    // if (payload_hashes?.length) bws = bws.filter((bw) => containsAll(bw.payload_hashes, payload_hashes))
    // if (payload_schemas?.length) bws = bws.filter((bw) => containsAll(bw.payload_schemas, payload_schemas))
    // const parsedLimit = limit ?? bws.length
    // const parsedOffset = offset ?? 0
    // return bws.slice(parsedOffset, parsedLimit)
    await Promise.resolve()
    return []
  }
}
