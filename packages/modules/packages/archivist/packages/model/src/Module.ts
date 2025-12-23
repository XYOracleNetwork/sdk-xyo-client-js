import type { Hash } from '@xylabs/sdk-js'
import type { ModuleQueryFunctions } from '@xyo-network/module-model'
import type { Payload, Sequence } from '@xyo-network/payload-model'

import type { Archivist } from './PayloadArchivist.ts'

export interface ArchivistModule<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId extends string = Hash,
  TCursor extends string = Sequence,
> extends Archivist<TReadResponse, TWriteResponse, TWrite, TId, TCursor>,
  ModuleQueryFunctions {}
