import { compact } from '@xylabs/lodash'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { AbstractModuleInstance, AnyConfigSchema, Module, ModuleConfig, ModuleEventData, ModuleParams, ModuleQueryResult } from '@xyo-network/module'
import { ModuleError, Payload, Query } from '@xyo-network/payload-model'

export type ArchivingModuleConfig<T extends ModuleConfig = ModuleConfig> = ModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>
// @creatableModule()
export abstract class AbstractArchivingModule<
    TParams extends ModuleParams<AnyConfigSchema<ArchivingModuleConfig>> = ModuleParams<AnyConfigSchema<ArchivingModuleConfig>>,
    TEventData extends ModuleEventData = ModuleEventData,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements Module<TParams, TEventData>
{
  protected override async bindQueryResult<T extends Query>(
    query: T,
    payloads: Payload[],
    additionalWitnesses: AccountInstance[] = [],
    errorPayloads: ModuleError[] = [],
  ): Promise<ModuleQueryResult> {
    const result = await super.bindQueryResult(query, payloads, additionalWitnesses, errorPayloads)
    await this.storeToArchivists(result.flat())
    return result
  }

  protected async resolveArchivists(): Promise<ArchivistInstance[]> {
    const archivists = this.config.archivists
    if (!archivists) return []
    const resolved = await Promise.all(archivists.map((archivist) => this.resolve(archivist)))
    return compact(resolved.map((mod) => asArchivistInstance(mod)))
  }

  protected async storeToArchivists(payloads: Payload[]): Promise<Payload[]> {
    const archivists = await this.resolveArchivists()
    return (
      await Promise.all(
        archivists.map((archivist) => {
          return archivist.insert?.(payloads)
        }),
      )
    ).map(([bw]) => bw)
  }
}
