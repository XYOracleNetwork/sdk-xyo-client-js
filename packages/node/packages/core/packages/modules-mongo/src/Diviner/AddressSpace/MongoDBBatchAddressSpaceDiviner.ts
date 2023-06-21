import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { MemoryAddressSpaceDiviner } from '@xyo-network/diviner-address-space-memory'
import { AddressSpaceDivinerConfig, DivinerParams } from '@xyo-network/diviner-models'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessPointerPayload, BoundWitnessPointerSchema, BoundWitnessWithMeta } from '@xyo-network/node-core-model'
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
  protected readonly paginationAccount: AccountInstance = Account.random()
  protected response: BoundWitnessPointerPayload | undefined
  protected witnessedAddresses: Set<string> = new Set<string>()

  override divine(_payloads?: Payload[]): Promise<Payload[]> {
    void this.backgroundDivine()
    return this.response ? Promise.resolve([this.response]) : Promise.resolve([])
  }

  override async start() {
    // Create a paginationAccount per archivist
    const archivistMod = await this.writeArchivist()
    assertEx(archivistMod, `${moduleName}.Start: No archivists found`)
    // Pre-mint response payloads for dereferencing later
    const response = new PayloadBuilder<BoundWitnessPointerPayload>({ schema: BoundWitnessPointerSchema })
      .fields({ reference: [[{ address: this.paginationAccount.addressValue.hex }], [{ schema: AddressSchema }]] })
      .build()
    // Save the appropriate collection pointer response to the respective archivist
    const archivist = ArchivistWrapper.wrap(archivistMod, this.account)
    await archivist.insert([response])
    this.response = response
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
      const archivistMod = await this.writeArchivist()
      // Save the paginated address response to the respective archivist
      const archivist = ArchivistWrapper.wrap(archivistMod, this.paginationAccount)
      for (let j = 0; j < toStore.length; j += this.batchSize) {
        const batch = toStore.slice(j, j + this.batchSize)
        await archivist.insert(batch)
      }
      this.witnessedAddresses = union(this.witnessedAddresses, newAddresses)
    } catch (error) {
      this.logger?.error(`${moduleName}.BackgroundDivine: ${error}`)
    } finally {
      this.currentlyRunning = false
    }
  }
}
