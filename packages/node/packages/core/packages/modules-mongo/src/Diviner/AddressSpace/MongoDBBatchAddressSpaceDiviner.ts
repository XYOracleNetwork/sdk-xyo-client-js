import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { MemoryAddressSpaceDiviner } from '@xyo-network/diviner-address-space-memory'
import { AddressSpaceDivinerConfig, DivinerParams } from '@xyo-network/diviner-models'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta, CollectionPointerPayload, CollectionPointerSchema } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { DefaultMaxTimeMS } from '../../defaults'
import { difference, union } from '../../Util'

export type MongoDBBatchAddressSpaceDivinerParams<TConfig extends AddressSpaceDivinerConfig = AddressSpaceDivinerConfig> = DivinerParams<
  AnyConfigSchema<TConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

const moduleName = 'MongoDBBatchAddressSpaceDiviner'

export class MongoDBBatchAddressSpaceDiviner<
  TParams extends MongoDBBatchAddressSpaceDivinerParams = MongoDBBatchAddressSpaceDivinerParams,
> extends MemoryAddressSpaceDiviner<TParams> {
  // TODO: Get via config or default
  protected readonly batchSize = 50
  protected currentlyRunning = false
  protected readonly paginationAccount: AccountInstance[] = []
  protected readonly responses: CollectionPointerPayload[] = []
  protected witnessedAddresses: Set<string> = new Set<string>()

  override divine(_payloads?: Payload[]): Promise<Payload[]> {
    void this.backgroundDivine()
    return Promise.resolve(this.responses)
  }

  override async start() {
    // Create a paginationAccount per archivist
    const archivists = await this.archivists()
    assertEx(archivists.length > 0, `${moduleName}.Start: No archivists found`)
    this.paginationAccount.push(...archivists.map(() => new Account()))
    // Pre-mint response payloads for dereferencing later
    const responses = this.paginationAccount.map((account) => {
      return new PayloadBuilder<CollectionPointerPayload>({ schema: CollectionPointerSchema })
        .fields({ reference: [[{ address: account.addressValue.hex }], [{ schema: AddressSchema }]] })
        .build()
    })
    // Save the appropriate collection pointer response to the respective archivist
    for (let i = 0; i < archivists.length; i++) {
      const archivist = ArchivistWrapper.wrap(archivists[i])
      await archivist.insert([responses[i]])
    }
    this.responses.push(...responses)
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
      const toStore = [...newAddresses].map((address) => {
        return { address, schema: AddressSchema }
      })
      const archivists = await this.archivists()
      // Save the appropriate paginated address response to the respective archivist
      for (let i = 0; i < archivists.length; i++) {
        const archivist = ArchivistWrapper.wrap(archivists[i], this.paginationAccount[i])
        for (let j = 0; j < toStore.length; j += this.batchSize) {
          const batch = toStore.slice(j, j + this.batchSize)
          await archivist.insert(batch)
        }
      }
      this.witnessedAddresses = union(this.witnessedAddresses, newAddresses)
    } catch (error) {
      this.logger?.error(`${moduleName}.BackgroundDivine: ${error}`)
    } finally {
      this.currentlyRunning = false
    }
  }
}
