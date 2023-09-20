import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { staticImplements } from '@xylabs/static-implements'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { PayloadHasher } from '@xyo-network/core'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import { AddressSpaceBatchDivinerConfig, AddressSpaceBatchDivinerConfigSchema, DivinerParams } from '@xyo-network/diviner-models'
import { COLLECTIONS, DATABASES, DefaultMaxTimeMS } from '@xyo-network/module-abstract-mongodb'
import { AnyConfigSchema, WithLabels } from '@xyo-network/module-model'
import { MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessPointerPayload, BoundWitnessPointerSchema, BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { difference, union } from '../../Util'

export type MongoDBAddressSpaceBatchDivinerParams<TConfig extends AddressSpaceBatchDivinerConfig = AddressSpaceBatchDivinerConfig> = DivinerParams<
  AnyConfigSchema<TConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

const moduleName = 'MongoDBAddressSpaceBatchDiviner'

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export class MongoDBAddressSpaceBatchDiviner<
  TParams extends MongoDBAddressSpaceBatchDivinerParams = MongoDBAddressSpaceBatchDivinerParams,
> extends AddressSpaceDiviner<TParams> {
  static override configSchemas = [AddressSpaceBatchDivinerConfigSchema]
  static labels = MongoDBStorageClassLabels

  // TODO: Get via config or default
  protected readonly batchSize = 50
  protected currentlyRunning = false
  protected readonly paginationAccount: AccountInstance = Account.randomSync()
  protected response: BoundWitnessPointerPayload | undefined
  protected witnessedAddresses: Set<string> = new Set<string>()

  protected async backgroundDivine(): Promise<void> {
    if (this.currentlyRunning) return
    try {
      this.currentlyRunning = true
      if (await this.initializeArchivist()) {
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
      }
    } catch (error) {
      this.logger?.error(`${moduleName}.BackgroundDivine: ${error}`)
    } finally {
      this.currentlyRunning = false
    }
  }

  protected override divineHandler(_payloads?: Payload[]): Promise<Payload[]> {
    // Restart if not running
    void this.backgroundDivine()
    // Return last calculated response
    return this.response ? Promise.resolve([this.response]) : Promise.resolve([])
  }

  protected async initializeArchivist() {
    try {
      // Create a paginationAccount per archivist
      const archivistMod = await this.writeArchivist()
      assertEx(archivistMod, `${moduleName}.Start: No archivists found`)
      const archivist = ArchivistWrapper.wrap(archivistMod, this.account)
      // Pre-mint response payload pointer for dereferencing results
      const divinedAnswerPointer = new PayloadBuilder<BoundWitnessPointerPayload>({ schema: BoundWitnessPointerSchema })
        .fields({ reference: [[{ address: this.paginationAccount.address }], [{ schema: AddressSchema }]] })
        .build()
      // Ensure the pointer exists in the archivist (but don't insert it twice)
      const divinedAnswerPointerExists = (await archivist.get([await PayloadHasher.hashAsync(divinedAnswerPointer)]))?.length > 0
      if (!divinedAnswerPointerExists) await archivist.insert([divinedAnswerPointer])
      // Save the pointer to return to callers
      this.response = divinedAnswerPointer
      return true
    } catch {
      // Anything preventing us from connecting to the archivist
      // will require a full re-initialization
      this.response = undefined
    }
    return false
  }

  protected override async startHandler() {
    void this.backgroundDivine()
    return await super.startHandler()
  }
}
