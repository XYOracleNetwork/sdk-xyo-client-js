import { AbstractModule, ModuleConfig } from '@xyo-network/module'

export type ModuleFactory = (config: ModuleConfig) => AbstractModule | Promise<AbstractModule>
