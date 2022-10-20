import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Module } from '@xyo-network/module'
import { XyoPayload, XyoPayloadFindFilter } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'

export interface ReadArchivist<TReadResponse, TId = string> {
  get(ids: TId[]): NullablePromisableArray<TReadResponse>
  all?(): PromisableArray<TReadResponse>
}

export interface WriteArchivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
  delete?(ids: TId[]): PromisableArray<boolean>
  clear?(): Promisable<void>
}

export interface FindArchivist<TReadResponse, TFindResponse = TReadResponse, TFindFilter = unknown> {
  find(filter?: TFindFilter): PromisableArray<TFindResponse>
}

export interface StashArchivist<TWriteResponse> {
  commit?(): Promisable<TWriteResponse[]>
}

export interface Archivist<
  TReadResponse = XyoPayload,
  TWriteResponse = XyoBoundWitness,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = XyoPayloadFindFilter,
  TId = string,
> extends ReadArchivist<TReadResponse, TId>,
    FindArchivist<TReadResponse, TFindResponse, TFindFilter>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TWriteResponse> {}

export type PayloadArchivist = Module & Archivist<XyoPayload, XyoPayload, XyoPayload, XyoPayload, XyoPayloadFindFilter, string>
