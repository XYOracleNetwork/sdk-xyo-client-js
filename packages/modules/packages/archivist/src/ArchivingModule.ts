import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AbstractModule, creatableModule, Module, ModuleConfig, ModuleEventData, ModuleParams, ModuleQueryResult } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PromiseEx } from '@xyo-network/promise'
import compact from 'lodash/compact'

export type ArchivingModuleConfig<T extends AnyObject = AnyObject> = ModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>
@creatableModule()
export class ArchivingModule<
    TParams extends ModuleParams<ArchivingModuleConfig> = ModuleParams<ArchivingModuleConfig>,
    TEventData extends ModuleEventData = ModuleEventData,
  >
  extends AbstractModule<TParams, TEventData>
  implements Module<TParams, TEventData>
{
  protected override bindResult(payloads: Payload[], account?: AccountInstance): PromiseEx<ModuleQueryResult, AccountInstance> {
    const promise = new PromiseEx<ModuleQueryResult, AccountInstance>(async (resolve, reject) => {
      let result: ModuleQueryResult | undefined = undefined
      try {
        result = this.bindResultInternal(payloads, account)
        await this.storeToArchivists([result[0], ...result[1]])
      } catch (ex) {
        //Todo: We need to update PromiseEx to not require a result for reject
        reject?.(result as ModuleQueryResult)
        return
      }
      resolve?.(result)
    }, account)
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
