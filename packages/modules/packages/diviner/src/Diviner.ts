import { Module } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

export interface Diviner {
  /* context is the hash of the payload that defines the divining */
  divine: (query: string, payloads?: XyoPayloads) => Promisable<XyoPayloads>
}

export interface DivinerModule extends Module, Diviner {}
