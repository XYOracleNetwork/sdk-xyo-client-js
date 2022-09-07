import { Module } from '@xyo-network/module'

export interface Node<TModule extends Module = Module> {
  attach(module: TModule): void
  remove(address: string): void
  list(): string[]
  get(address: string): TModule | undefined
}
