import { AddressString, ModuleConfig } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

export interface ArchivistParents {
  commit?: AddressString[]
  read?: AddressString[]
  write?: AddressString[]
}

export type ArchivistConfig<TConfig extends XyoPayload = XyoPayload> = ModuleConfig<
  {
    /** @field address of one or more parent archivists to read from */
    parents?: ArchivistParents
    /** @field should child store all reads from parents? */
    storeParentReads?: boolean
  } & TConfig
>
