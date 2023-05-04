import { AbstractModule, ModuleParams } from '@xyo-network/module'

export type ModuleFactory<T extends AbstractModule = AbstractModule, TParams extends ModuleParams = ModuleParams> = (
  params: TParams,
) => T | Promise<T>

export interface ModuleFactoryDictionary {
  [key: string]: ModuleFactory<AbstractModule, ModuleParams>
}
