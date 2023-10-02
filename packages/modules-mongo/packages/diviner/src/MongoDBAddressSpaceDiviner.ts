import { exists } from '@xylabs/exists'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import { AddressSpaceDivinerConfigSchema } from '@xyo-network/diviner-models'
import { DefaultMaxTimeMS, MongoDBModuleMixin } from '@xyo-network/module-abstract-mongodb'
import { Payload } from '@xyo-network/payload-model'

const MongoDBDivinerBase = MongoDBModuleMixin(AddressSpaceDiviner)

export class MongoDBAddressSpaceDiviner extends MongoDBDivinerBase {
  static override configSchemas = [AddressSpaceDivinerConfigSchema]

  protected override async divineHandler(_payloads?: Payload[]): Promise<Payload[]> {
    // TODO: Most Recently Used, Most Frequently Used, Addresses of Value/Importance to Me
    const result = await this.boundWitnesses.useCollection(async (collection) => {
      return await collection.distinct('addresses', {}, { maxTimeMS: DefaultMaxTimeMS })
    })
    // Ensure uniqueness on case
    const addresses = new Set<string>(result?.map((address: string) => address?.toLowerCase()).filter(exists))
    return [...addresses].map((address) => {
      return { address, schema: AddressSchema }
    })
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.ensureIndexes()
    return true
  }
}
