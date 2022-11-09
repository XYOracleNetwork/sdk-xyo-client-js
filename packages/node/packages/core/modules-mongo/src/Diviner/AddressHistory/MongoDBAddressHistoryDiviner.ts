import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoArchivistPayloadDivinerConfig, XyoDiviner } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import {
  AddressHistoryDiviner,
  AddressHistoryQueryPayload,
  Initializable,
  isAddressHistoryQueryPayload,
  XyoBoundWitnessWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayloads } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { Filter } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultMaxTimeMS } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

export class MongoDBAddressHistoryDiviner extends XyoDiviner implements AddressHistoryDiviner, Initializable, JobProvider {
  protected readonly sdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)

  get jobs(): Job[] {
    return []
  }

  static override async create(params?: Partial<XyoModuleParams<XyoArchivistPayloadDivinerConfig>>): Promise<MongoDBAddressHistoryDiviner> {
    return (await super.create(params)) as MongoDBAddressHistoryDiviner
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads<XyoBoundWitness>> {
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

  async initialize(): Promise<void> {
    await this.start()
  }

  private getBlocks = async (hash: string, address: string, limit: number): Promise<XyoBoundWitnessWithMeta[]> => {
    let nextHash = hash
    const blocks: XyoBoundWitnessWithMeta[] = []
    for (let i = 0; i < limit; i++) {
      const filter: Filter<XyoBoundWitnessWithMeta> = { addresses: address }
      if (nextHash) filter._hash = nextHash
      const block = (await (await this.sdk.find(filter)).sort({ _timestamp: -1 }).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()).pop()
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
