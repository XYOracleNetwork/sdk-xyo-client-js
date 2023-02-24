import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'

export interface ReadArchivist<TReadResponse, TId = string> {
  all?(): PromisableArray<TReadResponse>
  get(ids: TId[]): NullablePromisableArray<TReadResponse>
}

export interface WriteArchivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  clear?(): Promisable<void>
  delete?(ids: TId[]): PromisableArray<boolean>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface StashArchivist<TWriteResponse> {
  commit?(): Promisable<TWriteResponse[]>
}

export interface Archivist<TReadResponse = XyoPayload, TWriteResponse = XyoBoundWitness, TWrite = TReadResponse, TId = string>
  extends ReadArchivist<TReadResponse, TId>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TWriteResponse> {}

export type ArchivistModule = Module & Archivist<XyoPayload, XyoPayload, XyoPayload, string>

/** @deprecated use ArchivistModule instead */
export type PayloadArchivist = ArchivistModule
