import { Hash } from '@xylabs/hex'
import { Payload, WithStorageMeta } from '@xyo-network/payload-model'

import {
  AllArchivistFunctions, ReadArchivistFunctions, StashArchivistFunctions, WriteArchivistFunctions,
} from './ArchivistFunctions.ts'

export interface AllArchivist<
  TReadResponse extends Payload = Payload,
> extends AllArchivistFunctions<WithStorageMeta<TReadResponse>> {}

export interface ReadArchivist<
  TReadResponse extends Payload = Payload,
  TId = Hash,
> extends ReadArchivistFunctions<WithStorageMeta<TReadResponse>, TId> {}

export interface WriteArchivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = TReadResponse,
  TWrite extends Payload = TReadResponse,
  TId = Hash,
> extends WriteArchivistFunctions<WithStorageMeta<TReadResponse>, TWriteResponse, TWrite, TId> {}

export interface ReadWriteArchivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = TReadResponse,
  TWrite extends Payload = TReadResponse,
  TId = Hash,
> extends WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>, ReadArchivist<TReadResponse, TId> {}

export interface StashArchivist<
  TWriteResponse extends Payload = Payload,
> extends StashArchivistFunctions<WithStorageMeta<TWriteResponse>> {}

export interface FullArchivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = TReadResponse,
  TWrite extends Payload = TReadResponse,
  TId = Hash,
> extends ReadWriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>, StashArchivist<TWriteResponse> {}

export interface Archivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId = Hash,
> extends ReadArchivist<WithStorageMeta<TReadResponse>, TId>,
  AllArchivist<WithStorageMeta<TReadResponse>>,
  WriteArchivist<WithStorageMeta<TReadResponse>, WithStorageMeta<TWriteResponse>, TWrite, TId>,
  StashArchivistFunctions<TWriteResponse> {}
