import { AddressString, SchemaString } from './Config'
import { Module } from './Module'

export type ModuleResolverEventFunc<TModule extends Module = Module> = (event: 'add' | 'remove', module: TModule) => void

export interface ModuleResolver {
  isModuleResolver: boolean
  fromAddress(address: AddressString[]): (Module | null)[]
  fromQuery(schema: SchemaString[]): Module[]
  subscribe(handler: ModuleResolverEventFunc): void
  unsubscribe(handler: ModuleResolverEventFunc): void
}
