import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'

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
  insert(item: TWrite[]): Promisable<TWriteResponse>
  delete?(ids: TId[]): PromisableArray<boolean>
  clear?(): Promisable<void>
}

export interface FindArchivist<
  TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = unknown,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
> extends Module<TQuery> {
  find(filter?: TFindFilter): PromisableArray<TFindResponse>
}

export interface StashArchivist<TWriteResponse, TQuery extends XyoArchivistQuery = XyoArchivistQuery> extends Module<TQuery> {
  commit?(): Promisable<TWriteResponse>
}

export interface Archivist<
  TReadResponse = XyoPayload | null,
  TWriteResponse = XyoBoundWitness | null,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse | null,
  TFindFilter = XyoPayloadFindFilter,
  TId = string,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
> extends ReadArchivist<TReadResponse, TId, TQuery>,
    FindArchivist<TReadResponse, TFindResponse, TFindFilter, TQuery>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId, TQuery>,
    StashArchivist<TWriteResponse, TQuery> {}
