import type { Hash } from '@xylabs/hex'
import type { ModuleQueryFunctions } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { Archivist } from './PayloadArchivist.ts'

export interface ArchivistModule<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId extends string = Hash,
> extends Archivist<TReadResponse, TWriteResponse, TWrite, TId>,
  ModuleQueryFunctions {}
