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
import { difference } from '../../Util'

export type MongoDBBatchAddressSpaceDivinerParams<TConfig extends AddressSpaceDivinerConfig = AddressSpaceDivinerConfig> = DivinerParams<
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

export class MongoDBBatchAddressSpaceDiviner<
  TParams extends MongoDBBatchAddressSpaceDivinerParams = MongoDBBatchAddressSpaceDivinerParams,
> extends MemoryAddressSpaceDiviner<TParams> {
  // TODO: Get via config or default
  protected readonly batchSize = 10
  protected currentlyRunning = false
  protected readonly paginationAccount: AccountInstance = new Account()
  protected readonly witnessedAddresses: Set<string> = new Set<string>()

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
      // Filter addresses we've seen before
      const newAddresses = difference(addresses, this.witnessedAddresses)
      if (newAddresses.size === 0) return
      const mod = (await this.archivists()).pop()
      if (!mod) {
        this.logger?.error(`${moduleName}.BackgroundDivine: No archivists found`)
        return
      }
      const toStore = [...newAddresses].map((address) => {
        return { address, schema: AddressSchema }
      })
      const archivist = ArchivistWrapper.wrap(mod, this.paginationAccount)
      for (let i = 0; i < toStore.length; i += this.batchSize) {
        const batch = toStore.slice(i, i + this.batchSize)
        await archivist.insert(batch)
      }
    } catch (error) {
      this.logger?.error(`${moduleName}.BackgroundDivine: ${error}`)
    } finally {
      this.currentlyRunning = false
    }
  }
}
