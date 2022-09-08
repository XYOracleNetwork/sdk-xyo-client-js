import { Module, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export interface Node {
  attach(address: string): void
  detatch(address: string): void
  available(): Promisable<string[]>
  attached(): Promisable<string[]>
}

export interface NodeModule<TQuery extends XyoQuery = XyoQuery, TQueryResult extends XyoPayload = XyoPayload>
  extends Node,
    Module<TQuery, TQueryResult> {}
