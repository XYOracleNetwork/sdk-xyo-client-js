import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistModule, asArchivistModule, isArchivistInstance } from '@xyo-network/archivist-model'
import { IndirectArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AbstractModule, Module, ModuleConfig, ModuleEventData, ModuleParams, ModuleQueryResult } from '@xyo-network/module'
import { ModuleError, Payload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import compact from 'lodash/compact'

export type ArchivingModuleConfig<T extends AnyObject = AnyObject> = ModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>
// @creatableModule()
export abstract class ArchivingModule<
    TParams extends ModuleParams<ArchivingModuleConfig> = ModuleParams<ArchivingModuleConfig>,
    TEventData extends ModuleEventData = ModuleEventData,
  >
  extends AbstractModule<TParams, TEventData>
  implements Module<TParams, TEventData>
{
  protected override async bindQueryResult<T extends Query | PayloadWrapper<Query>>(
    query: T,
    payloads: Payload[],
    additionalWitnesses: AccountInstance[] = [],
    errorPayloads: ModuleError[] = [],
  ): Promise<[ModuleQueryResult, AccountInstance[]]> {
    const [result, witnesses] = await super.bindQueryResult(query, payloads, additionalWitnesses, errorPayloads)
    await this.storeToArchivists([result[0], ...result[1]])
    return [result, witnesses]
  }

  protected async resolveArchivists(): Promise<ArchivistModule[]> {
    return compact(
      (await Promise.all((await this.resolve({ address: this.config.archivists ?? [] })) ?? [])).map((module) => asArchivistModule(module)),
    )
  }

  protected async storeToArchivists(payloads: Payload[]): Promise<BoundWitness[]> {
    const archivists = await this.resolveArchivists()
    return (
      await Promise.all(
        archivists.map((archivist) => {
          return isArchivistInstance(archivist) ? archivist.insert(payloads) : IndirectArchivistWrapper.wrap(archivist, this.account).insert(payloads)
        }),
      )
    ).map(([bw]) => bw)
  }
}
