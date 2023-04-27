import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import {
  AddressHistoryDiviner,
  AddressHistoryDivinerConfig,
  AddressHistoryDivinerConfigSchema,
  AddressHistoryQueryPayload,
  DivinerParams,
  isAddressHistoryQueryPayload,
} from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter } from 'mongodb'

import { DefaultLimit, DefaultMaxTimeMS } from '../../defaults'
import { removeId } from '../../Mongo'

export type MongoDBAddressHistoryDivinerParams = DivinerParams<
  AnyConfigSchema<AddressHistoryDivinerConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

export class MongoDBAddressHistoryDiviner<TParams extends MongoDBAddressHistoryDivinerParams = MongoDBAddressHistoryDivinerParams>
  extends AbstractDiviner<TParams>
  implements AddressHistoryDiviner
{
  static override configSchema = AddressHistoryDivinerConfigSchema

  override async divine(payloads?: Payload[]): Promise<Payload<BoundWitness>[]> {
    const query = payloads?.find<AddressHistoryQueryPayload>(isAddressHistoryQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { address, schema, limit, offset, order, ...props } = query
    const addresses = sanitizeAddress(address)
    assertEx(addresses, 'MongoDBAddressHistoryDiviner: Missing address for query')
    if (offset) assertEx(typeof offset === 'string', 'MongoDBAddressHistoryDiviner: Supplied offset must be a hash')
    const hash: string = offset as string
    const blocks = await this.getBlocks(hash, addresses, limit || DefaultLimit)
    return blocks.map(removeId)
  }

  private getBlocks = async (hash: string, address: string, limit: number): Promise<BoundWitnessWithMeta[]> => {
    let nextHash = hash
    const blocks: BoundWitnessWithMeta[] = []
    for (let i = 0; i < limit; i++) {
      const filter: Filter<BoundWitnessWithMeta> = { addresses: address }
      if (nextHash) filter._hash = nextHash
      const block = (
        await (await this.params.boundWitnessSdk.find(filter)).sort({ _timestamp: -1 }).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()
      ).pop()
      if (!block) break
      blocks.push(block)
      const addressIndex = block.addresses.findIndex((value) => value === address)
      const previousHash = block.previous_hashes[addressIndex]
      if (!previousHash) break
      nextHash = previousHash
    }
    return blocks
  }
}

const sanitizeAddress = (a: string | string[] | undefined): string => {
  return ([] as (string | undefined)[])
    .concat(a)
    .filter(exists)
    .map((x) => x.toLowerCase())
    .map((x) => (x.startsWith('0x') ? x.substring(2) : x))
    .reduce((x) => x)
}
