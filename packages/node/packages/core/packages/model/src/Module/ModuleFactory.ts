import { AbstractModule, AnyConfigSchema, ModuleConfig, ModuleParams } from '@xyo-network/module'

export type ParamsModuleFactory<T extends AbstractModule = AbstractModule, TParams extends ModuleParams = ModuleParams> = (
  params: TParams,
) => T | Promise<T>

export type ConfigModuleFactory<
  T extends AbstractModule = AbstractModule,
  TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>,
> = (config: TConfig) => T | Promise<T>

export type ParamsConfigModuleFactory<
  T extends AbstractModule = AbstractModule,
  TParams extends ModuleParams = ModuleParams,
  TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>,
> = (params: TParams) => ConfigModuleFactory<T, TConfig> | Promise<ConfigModuleFactory<T, TConfig>>

export interface ConfigModuleFactoryDictionary {
  [key: string]: ConfigModuleFactory<AbstractModule, AnyConfigSchema<{ schema: typeof key }>>
}
