import { AbstractModuleInstance, AnyConfigSchema, Module, ModuleConfig, ModuleEventData, ModuleParams } from '@xyo-network/module'

/** @deprecated use AbstractModule which now has this functionality included */
export type ArchivingModuleBaseConfig<T extends ModuleConfig = ModuleConfig> = ModuleConfig<
  {
    archivists?: string[]
    schema: string
  } & T
>

/** @deprecated use AbstractModule which now has this functionality included */
export abstract class AbstractArchivingModule<
    TParams extends ModuleParams<AnyConfigSchema<ArchivingModuleBaseConfig>> = ModuleParams<AnyConfigSchema<ArchivingModuleBaseConfig>>,
    TEventData extends ModuleEventData = ModuleEventData,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements Module<TParams, TEventData> {}
