import type { Hash } from '@xylabs/hex'
import type {
  Payload, PayloadHashMap, Sequence, WithStorageMeta,
} from '@xyo-network/payload-model'

import type {
  AllArchivistFunctions, ReadArchivistFunctions, StashArchivistFunctions, WriteArchivistFunctions,
} from './ArchivistFunctions.ts'

export interface AllArchivist<
  TReadResponse extends Payload = Payload,
  TId extends string = Hash,
> extends AllArchivistFunctions<WithStorageMeta<TReadResponse>, PayloadHashMap<WithStorageMeta<TReadResponse>, TId>> {}

export interface ReadArchivist<
  TReadResponse extends Payload = Payload,
  TId extends string = Hash,
  TCursor extends string = Sequence,
> extends ReadArchivistFunctions<WithStorageMeta<TReadResponse>, TId, TCursor> {}

export interface WriteArchivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = TReadResponse,
  TWrite extends Payload = TReadResponse,
  TId extends string = Hash,
> extends WriteArchivistFunctions<WithStorageMeta<TReadResponse>, WithStorageMeta<TWriteResponse>, TWrite, TId> {}

export interface ReadWriteArchivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = TReadResponse,
  TWrite extends Payload = TReadResponse,
  TId extends string = Hash,
> extends WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>, ReadArchivist<TReadResponse, TId> {}

export interface StashArchivist<
  TWriteResponse extends Payload = Payload,
> extends StashArchivistFunctions<WithStorageMeta<TWriteResponse>> {}

export interface FullArchivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = TReadResponse,
  TWrite extends Payload = TReadResponse,
  TId extends string = Hash,
> extends ReadWriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>, StashArchivist<TWriteResponse> {}

export interface Archivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId extends string = Hash,
  TCursor extends string = Sequence,
> extends ReadArchivist<WithStorageMeta<TReadResponse>, TId, TCursor>,
  AllArchivist<WithStorageMeta<TReadResponse>, TId>,
  WriteArchivist<WithStorageMeta<TReadResponse>, WithStorageMeta<TWriteResponse>, TWrite, TId>,
  StashArchivistFunctions<TWriteResponse> {}
