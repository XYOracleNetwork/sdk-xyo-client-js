import { AbstractModule, ModuleConfig, ModuleParams } from '@xyo-network/module'

export type ParamsModuleFactory<T extends AbstractModule = AbstractModule, TParams extends ModuleParams = ModuleParams> = (
  params: TParams,
) => T | Promise<T>

export type ConfigModuleFactory<T extends AbstractModule = AbstractModule, TConfig extends ModuleConfig = ModuleConfig> = (
  config: TConfig,
) => T | Promise<T>

export type ParamsConfigModuleFactory<
  T extends AbstractModule = AbstractModule,
  TParams extends ModuleParams = ModuleParams,
  TConfig extends ModuleConfig = ModuleConfig,
> = (params: TParams) => ConfigModuleFactory<T, TConfig> | Promise<ConfigModuleFactory<T, TConfig>>
