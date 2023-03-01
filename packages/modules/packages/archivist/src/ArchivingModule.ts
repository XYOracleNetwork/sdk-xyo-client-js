import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AbstractModule, Module, ModuleConfig, ModuleParams, ModuleQueryResult } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PromiseEx } from '@xyo-network/promise'

export type ArchivingModuleConfig<T extends AnyObject = AnyObject> = ModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>

export class ArchivingModule<TParams extends ModuleParams<ArchivingModuleConfig> = ModuleParams<ArchivingModuleConfig>>
  extends AbstractModule<TParams>
  implements Module
{
  protected override bindResult(payloads: XyoPayload[], account?: AccountInstance): PromiseEx<ModuleQueryResult, AccountInstance> {
    const promise = new PromiseEx<ModuleQueryResult, AccountInstance>(async (resolve) => {
      const result = this.bindResultInternal(payloads, account)
      await this.storeToArchivists([result[0], ...result[1]])
      resolve?.(result)
    }, account)
    return promise
  }

  protected async resolveArchivists() {
    return (await this.resolve({ address: this.config.archivists ?? [] }))?.map((archivist) => new ArchivistWrapper(archivist)) ?? []
  }

  protected async storeToArchivists(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
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
