import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { hexFromHexString } from '@xylabs/hex'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import {
  AddressHistoryDiviner,
  AddressHistoryDivinerConfigSchema,
  AddressHistoryQueryPayload,
  isAddressHistoryQueryPayload,
} from '@xyo-network/diviner-address-history'
import { DefaultLimit, DefaultMaxTimeMS, MongoDBModuleMixin, removeId } from '@xyo-network/module-abstract-mongodb'
import { Payload } from '@xyo-network/payload-model'
import { BoundWitnessWithMeta } from '@xyo-network/payload-mongodb'
import { Filter } from 'mongodb'

const MongoDBDivinerBase = MongoDBModuleMixin(AddressHistoryDiviner)

export class MongoDBAddressHistoryDiviner extends MongoDBDivinerBase {
  static override configSchemas = [AddressHistoryDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload<BoundWitness>[]> {
    const query = payloads?.find<AddressHistoryQueryPayload>(isAddressHistoryQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { address, schema, limit, offset, order, ...props } = query
    // TODO: The address field seems to be meant for the address
    // of the intended handler but is being used here to filter
    // for the query. This should be fixed to use a separate field.
    const addresses = sanitizeAddress(address)
    assertEx(addresses, 'MongoDBAddressHistoryDiviner: Missing address for query')
    if (offset) assertEx(typeof offset === 'string', 'MongoDBAddressHistoryDiviner: Supplied offset must be a hash')
    const hash: string = offset as string
    const blocks = await this.getBlocks(hash, addresses, limit || DefaultLimit)
    return blocks.map(removeId)
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.ensureIndexes()
    return true
  }

  private getBlocks = async (hash: string, address: string, limit: number): Promise<BoundWitnessWithMeta[]> => {
    let nextHash = hash
    const blocks: BoundWitnessWithMeta[] = []
    for (let i = 0; i < limit; i++) {
      const filter: Filter<BoundWitnessWithMeta> = { addresses: address }
      if (nextHash) filter._hash = nextHash
      const block = (await (await this.boundWitnesses.find(filter)).sort({ _timestamp: -1 }).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()).pop()
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
  return (
    ([] as (string | undefined)[])
      .concat(a)
      .filter(exists)
      .map((x) => x.toLowerCase())
      .map((z) => hexFromHexString(z, { prefix: false }))
      .filter(exists)
      // TODO: We're only taking the last address with this
      .reduce((x) => x)
  )
}
