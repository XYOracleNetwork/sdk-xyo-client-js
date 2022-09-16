import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'

import { XyoArchivistQuery } from './Queries'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export interface ReadArchivist<
  TReadResponse,
  TId = string,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
  TQueryResult extends XyoPayload = XyoPayload,
> extends Module<TQuery, TQueryResult> {
  get(ids: TId[]): NullablePromisableArray<TReadResponse>
  all?(): NullablePromisableArray<TReadResponse>
}

export interface WriteArchivist<
  TReadResponse,
  TWriteResponse = TReadResponse,
  TWrite = TReadResponse,
  TId = string,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
  TQueryResult extends XyoPayload = XyoPayload,
> extends Module<TQuery, TQueryResult> {
  insert(item: TWrite[]): Promisable<TWriteResponse>
  delete?(ids: TId[]): PromisableArray<boolean>
  clear?(): Promisable<void>
}

export interface FindArchivist<
  TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = unknown,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
  TQueryResult extends XyoPayload = XyoPayload,
> extends Module<TQuery, TQueryResult> {
  find(filter?: TFindFilter): NullablePromisableArray<TFindResponse>
}

export interface StashArchivist<TWriteResponse, TQuery extends XyoArchivistQuery = XyoArchivistQuery, TQueryResult extends XyoPayload = XyoPayload>
  extends Module<TQuery, TQueryResult> {
  commit?(): Promisable<TWriteResponse>
}

export interface Archivist<
  TReadResponse = XyoPayload,
  TWriteResponse = XyoBoundWitness,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = XyoPayloadFindFilter,
  TId = string,
  TQuery extends XyoArchivistQuery = XyoArchivistQuery,
  TQueryResult extends XyoPayload = XyoPayload,
> extends ReadArchivist<TReadResponse, TId, TQuery, TQueryResult>,
    FindArchivist<TReadResponse, TFindResponse, TFindFilter, TQuery, TQueryResult>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId, TQuery, TQueryResult>,
    StashArchivist<TWriteResponse, TQuery, TQueryResult>,
    Module<TQuery, TQueryResult> {}

export type PayloadArchivist<TQuery extends XyoArchivistQuery = XyoArchivistQuery> = Archivist<
  XyoPayload,
  XyoPayload,
  XyoPayload,
  XyoPayload,
  XyoPayloadFindFilter,
  string,
  TQuery,
  XyoPayload
>
