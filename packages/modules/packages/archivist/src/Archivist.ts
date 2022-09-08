import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promisable'

import { XyoArchivistQuery } from './Queries'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export interface ReadArchivist<TReadResponse, TId = string, TQuery extends XyoArchivistQuery = XyoArchivistQuery> extends Module<TQuery> {
  get(ids: TId[]): NullablePromisableArray<TReadResponse>
  all?(): PromisableArray<TReadResponse>
}

export interface WriteArchivist<
  TReadResponse,
  TWriteResponse = TReadResponse,
  TWrite = TReadResponse,
  TId = string,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
> extends Module<TQuery> {
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
  delete?(ids: TId[]): PromisableArray<boolean>
  clear?(): Promisable<void>
}

export interface FindArchivist<
  TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = unknown,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
> extends Module<TQuery> {
  find(filter: TFindFilter): PromisableArray<TFindResponse>
}

export interface StashArchivist<TReadResponse, TQuery extends XyoArchivistQuery = XyoArchivistQuery> extends Module<TQuery> {
  commit?(): PromisableArray<TReadResponse>
}

export interface Archivist<
  TReadResponse = XyoPayload | null,
  TWriteResponse = TReadResponse | null,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse | null,
  TFindFilter = XyoPayloadFindFilter,
  TId = string,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
> extends ReadArchivist<TReadResponse, TId, TQuery>,
    FindArchivist<TReadResponse, TFindResponse, TFindFilter, TQuery>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId, TQuery>,
    StashArchivist<TReadResponse, TQuery> {}
