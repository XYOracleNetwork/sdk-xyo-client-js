import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { AnyObject } from '@xyo-network/core'
import { AbstractModuleInstance, Module, ModuleConfig, ModuleEventData, ModuleParams, ModuleQueryResult } from '@xyo-network/module'
import { ModuleError, Payload, Query } from '@xyo-network/payload-model'
import compact from 'lodash/compact'

export type ArchivingModuleConfig<T extends AnyObject = AnyObject> = ModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>
// @creatableModule()
export abstract class AbstractArchivingModule<
    TParams extends ModuleParams<ArchivingModuleConfig> = ModuleParams<ArchivingModuleConfig>,
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
    return compact(
      (await Promise.all((await this.resolve({ address: this.config.archivists ?? [] })) ?? [])).map((module) =>
        asArchivistInstance(module, () => `Module failed to cast to Archivist [${module.config.name}]`),
      ),
    )
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
