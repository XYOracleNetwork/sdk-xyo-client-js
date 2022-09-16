import { Module } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoDivinerQuery } from './Queries'

export interface Diviner<TDivineResponse extends XyoPayload = XyoPayload> {
  divine(payloads?: XyoPayloads): Promisable<TDivineResponse | null>
}

export interface DivinerModule<
  TDivineResult extends XyoPayload = XyoPayload,
  TQuery extends XyoDivinerQuery<TDivineResult> = XyoDivinerQuery<TDivineResult>,
  TQueryResult extends XyoPayload = XyoPayload,
> extends Module<TQuery, TQueryResult>,
    Diviner<TDivineResult> {}
