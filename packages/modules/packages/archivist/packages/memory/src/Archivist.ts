import { StorageClassLabel } from '@xyo-network/archivist-abstract'
import { GenericArchivist, GenericArchivistParams } from '@xyo-network/archivist-generic'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistNextQuerySchema,
  AttachableArchivistInstance,
} from '@xyo-network/archivist-model'
import {
  AnyConfigSchema, AttachableModuleInstance, creatableModule, ModuleInstance,
} from '@xyo-network/module-model'
import { Schema } from '@xyo-network/payload-model'

import { MemoryArchivistConfig, MemoryArchivistConfigSchema } from './Config.ts'
import { MemoryDriver } from './MemoryDriver.ts'

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<MemoryArchivistConfig> = AnyConfigSchema<MemoryArchivistConfig>>
  = GenericArchivistParams<TConfig>
@creatableModule()
export class MemoryArchivist<
  TParams extends MemoryArchivistParams<AnyConfigSchema<MemoryArchivistConfig>> = MemoryArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
>
  extends GenericArchivist<TParams, TEventData>
  implements AttachableArchivistInstance, ModuleInstance {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, MemoryArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = MemoryArchivistConfigSchema
  static override readonly labels = { ...super.labels, [StorageClassLabel]: 'memory' }

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

  static override async paramsHandler<T extends AttachableModuleInstance<MemoryArchivistParams, ArchivistModuleEventData>>(
    inParams?: Partial<T['params']>,
  ): Promise<T['params']> {
    const superParams = await super.paramsHandler(inParams)
    return { ...superParams, driver: superParams.driver ?? await MemoryDriver.create(superParams) }
  }
}
