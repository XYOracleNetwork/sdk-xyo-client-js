import { Hash } from '@xylabs/hex'
import { ModuleQueryFunctions } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { Archivist } from './PayloadArchivist.ts'

export interface ArchivistModule<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId = Hash,
> extends Archivist<TReadResponse, TWriteResponse, TWrite, TId>,
  ModuleQueryFunctions {}
