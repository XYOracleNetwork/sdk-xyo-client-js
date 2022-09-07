import { Module } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promisable'

export interface Node {
  attach(address: string): void
  detatch(address: string): void
  available(): Promisable<string[]>
  attached(): Promisable<string[]>
}

export interface NodeModule extends Node, Module {}
