import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { EmptyObject } from '@xyo-network/core'
import { AbstractModule, AbstractModuleConfig, Module, ModuleQueryResult } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PromiseEx } from '@xyo-network/promise'

export type ArchivingModuleConfig<T extends EmptyObject = EmptyObject> = AbstractModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>

export class ArchivingModule<TConfig extends ArchivingModuleConfig = ArchivingModuleConfig> extends AbstractModule<TConfig> implements Module {
  protected bindResult(payloads: XyoPayload[], account?: Account): PromiseEx<ModuleQueryResult, Account> {
    const promise = new PromiseEx<ModuleQueryResult, Account>(async (resolve) => {
      const result = this.bindResultInternal(payloads, account)
      await this.storeToArchivists([result[0], ...result[1]])
      resolve?.(result)
    }, account)
    return promise
  }

  protected async resolveArchivists() {
    return (await this.resolver?.resolve({ address: this.config.archivists ?? [] }))?.map((archivist) => new ArchivistWrapper(archivist)) ?? []
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
