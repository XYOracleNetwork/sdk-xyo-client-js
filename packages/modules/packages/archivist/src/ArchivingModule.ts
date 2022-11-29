import { XyoAccount } from '@xyo-network/account'
import { EmptyObject } from '@xyo-network/core'
import { Module, ModuleQueryResult, XyoModule, XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { PromiseEx } from '@xyo-network/promise'

import { ArchivistWrapper } from './ArchivistWrapper'

export type ArchivingModuleConfig<T extends EmptyObject = EmptyObject> = XyoModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>

export class ArchivingModule<TConfig extends ArchivingModuleConfig = ArchivingModuleConfig> extends XyoModule<TConfig> implements Module {
  protected bindResult(payloads: XyoPayload[], account?: XyoAccount): PromiseEx<ModuleQueryResult, XyoAccount> {
    const promise = new PromiseEx<ModuleQueryResult, XyoAccount>(async (resolve) => {
      const result = this.bindResultInternal(payloads, account)
      const archivists = (await this.resolveArchivists()) ?? []
      await Promise.all(
        archivists.map((archivist) => {
          return archivist.insert(payloads)
        }),
      )
      resolve?.(result)
    }, account)
    return promise
  }

  protected async resolveArchivists() {
    return (await this.resolver?.resolve({ address: this.config.archivists ?? [] }))?.map((archivist) => new ArchivistWrapper(archivist))
  }
}
