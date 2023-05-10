import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import {
  AbstractModule,
  creatableModule,
  Module,
  ModuleConfig,
  ModuleEventData,
  ModuleParams,
  ModuleQueryBase,
  ModuleQueryResult,
  Query,
} from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromiseEx } from '@xyo-network/promise'
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
  protected override bindQueryResult<T extends Query | PayloadWrapper<Query>>(
    query: T,
    payloads: Payload[],
    additionalWitnesses: AccountInstance[] = [],
  ): PromiseEx<ModuleQueryResult, AccountInstance[]> {
    const promise = new PromiseEx<ModuleQueryResult, AccountInstance[]>(async (resolve, reject) => {
      let result: ModuleQueryResult | undefined = undefined
      try {
        result = await super.bindQueryResult(query, payloads, additionalWitnesses)
        await this.storeToArchivists([result[0], ...result[1]])
      } catch (ex) {
        //Todo: We need to update PromiseEx to not require a result for reject
        reject?.(result as ModuleQueryResult)
        return
      }
      resolve?.(result)
    }, additionalWitnesses)
    return promise
  }

  protected async resolveArchivists() {
    return compact(
      (await this.resolve({ address: this.config.archivists ?? [] }))?.map((archivist) => ArchivistWrapper.tryWrap(archivist, this.account)) ?? [],
    )
  }

  protected async storeToArchivists(payloads: Payload[]): Promise<BoundWitness[]> {
    const archivists = await this.resolveArchivists()
    return (
      await Promise.all(
        archivists.map((archivist) => {
          return archivist.insert(payloads)
        }),
      )
    ).map(([bw]) => bw)
  }
}
