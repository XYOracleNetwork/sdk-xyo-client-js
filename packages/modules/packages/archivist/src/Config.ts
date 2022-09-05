import { Module, XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export interface XyoArchivistParents {
  read?: Record<string, Module | null | undefined>
  write?: Record<string, Module | null | undefined>
  commit?: Record<string, Module | null | undefined>
}

export type XyoArchivistConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    /** @field address of one or more parent archivists to read from */
    parents?: XyoArchivistParents
    cacheParentReads?: boolean
    /** @field address of archivist to write through to */
    writeThrough?: string
  } & TConfig
>

export class XyoArchivistConfigWrapper<C extends XyoArchivistConfig = XyoArchivistConfig> {
  protected config?: C
  constructor(config?: C) {
    this.config = config
  }

  public get parents() {
    return this.config?.parents
  }

  public get account() {
    return this.config?.account
  }

  public get writeThrough() {
    return this.config?.writeThrough
  }

  public get cacheParentReads() {
    return this.config?.cacheParentReads
  }
}
