import { exists } from '@xylabs/exists'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { MemoryAddressSpaceDiviner } from '@xyo-network/diviner-address-space-memory'
import { AddressSpaceDivinerConfig, DivinerParams } from '@xyo-network/diviner-models'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta, PayloadRule } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { DefaultMaxTimeMS } from '../../defaults'

export type MongoDBMerkleAddressSpaceDivinerParams<TConfig extends AddressSpaceDivinerConfig = AddressSpaceDivinerConfig> = DivinerParams<
  AnyConfigSchema<TConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

type CollectionPointerSchema = 'network.xyo.collection.pointer'
const CollectionPointerSchema: CollectionPointerSchema = 'network.xyo.collection.pointer'

export type CollectionPointerPayload = Payload<{
  reference: PayloadRule[][]
  schema: CollectionPointerSchema
}>

const moduleName = 'MongoDBSchemaStatsDiviner'

export class MongoDBMerkleAddressSpaceDiviner<
  TParams extends MongoDBMerkleAddressSpaceDivinerParams = MongoDBMerkleAddressSpaceDivinerParams,
> extends MemoryAddressSpaceDiviner<TParams> {
  // TODO: Get via config or default
  protected readonly batchSize = 10
  protected currentlyRunning = false
  protected readonly paginationAccount: AccountInstance = new Account()
  override divine(_payloads?: Payload[]): Promise<Payload[]> {
    void this.backgroundDivine()
    const response = new PayloadBuilder<CollectionPointerPayload>({ schema: CollectionPointerSchema })
      .fields({
        reference: [[{ address: this.paginationAccount.addressValue.hex }], [{ schema: AddressSchema }]],
      })
      .build()
    return Promise.resolve([response])
  }

  override async start() {
    void this.backgroundDivine()
    await super.start()
  }

  protected async backgroundDivine(): Promise<void> {
    if (this.currentlyRunning) return
    try {
      const result = await this.params.boundWitnessSdk.useMongo((db) => {
        return db.db(DATABASES.Archivist).command(
          {
            distinct: COLLECTIONS.BoundWitnesses,
            key: 'addresses',
          },
          { maxTimeMS: DefaultMaxTimeMS },
        )
      })
      // Ensure uniqueness on case
      const addresses = new Set<string>(result?.values?.map((address: string) => address?.toLowerCase()).filter(exists))
      const toStore = [...addresses].map((address) => {
        return { address, schema: AddressSchema }
      })
      // TODO: Filter addresses we've seen before
      const newAddresses = toStore
      if (newAddresses.length === 0) return
      const mods = await this.archivists()
      const archivists = mods.map((mod) => ArchivistWrapper.wrap(mod, this.paginationAccount))
      for (let i = 0; i < newAddresses.length; i += this.batchSize) {
        const batch = newAddresses.slice(i, i + this.batchSize)
        await Promise.all(archivists.map((archivist) => archivist.insert(batch)))
      }
    } catch (error) {
      this.logger?.error(`${moduleName}.BackgroundDivine: ${error}`)
    } finally {
      this.currentlyRunning = false
    }
  }
}
