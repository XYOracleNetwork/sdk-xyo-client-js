import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash } from '@xylabs/hex'
import { fulfilled, PromisableArray } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AbstractArchivist, StorageClassLabel } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuerySchema,
  ArchivistParams,
  ArchivistSnapshotPayload,
  AttachableArchivistInstance,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import {
  AnyConfigSchema, creatableModule, ModuleInstance,
} from '@xyo-network/module-model'
import {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'

import { ArchivistDriver } from './ArchivistDriver.ts'
import { GenericArchivistConfig, GenericArchivistConfigSchema } from './Config.ts'

export type GenericArchivistParams<TConfig extends AnyConfigSchema<GenericArchivistConfig> = AnyConfigSchema<GenericArchivistConfig>>
  = ArchivistParams<TConfig, {
    driver?: ArchivistDriver<Hash, Payload, WithStorageMeta<Payload>, TConfig>
  }>

@creatableModule()
export class GenericArchivist<
  TParams extends GenericArchivistParams<AnyConfigSchema<GenericArchivistConfig>> = GenericArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
>
  extends AbstractArchivist<TParams, TEventData>
  implements AttachableArchivistInstance, ModuleInstance {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, GenericArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = GenericArchivistConfigSchema
  static override readonly labels = { ...super.labels, [StorageClassLabel]: 'generic' }

  override get queries() {
    return [
      ArchivistAllQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistInsertQuerySchema,
      ArchivistCommitQuerySchema,
      ArchivistNextQuerySchema,
      ...super.queries,
    ]
  }

  protected get driver() {
    return assertEx(this.params.driver, () => 'Driver is not set')
  }

  static async from(payloads: Payload[], account?: AccountInstance): Promise<GenericArchivist> {
    const archivist = await GenericArchivist.create({ account: account ?? await Account.random() })
    await archivist.insert(payloads)
    return archivist
  }

  protected override allHandler() {
    return this.driver.all()
  }

  protected override clearHandler() {
    return this.driver.clear()
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    const payloads = assertEx(await this.allHandler(), () => 'Nothing to commit')
    const settled = await Promise.allSettled(
      Object.values((await this.parentArchivists()).commit ?? [])?.map(async (parent) => {
        const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
        const query = await this.bindQuery(queryPayload, payloads)
        return (await parent?.query(query[0], query[1]))?.[0]
      }).filter(exists),
    )
    await this.clearHandler()
    return settled.filter(fulfilled).map(result => result.value).filter(exists)
  }

  protected override deleteHandler(hashes: Hash[]) {
    return this.driver.delete(hashes)
  }

  protected override getHandler(hashes: Hash[]) {
    return this.driver.get(hashes)
  }

  protected override insertHandler(payloads: WithStorageMeta<Payload>[]) {
    return this.driver.insert(payloads)
  }

  protected override nextHandler(options?: ArchivistNextOptions) {
    return this.driver.next(options)
  }

  protected override payloadCountHandler() {
    return this.driver.count()
  }

  protected override snapshotHandler(): PromisableArray<ArchivistSnapshotPayload<WithStorageMeta<Payload>, Hash>> {
    throw new Error('Snapshot is not supported by GenericArchivist')
  }
}
