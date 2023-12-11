import { assertEx } from '@xylabs/assert'
import { asDivinerInstance, DivinerInstance } from '@xyo-network/diviner-model'
import { AnyConfigSchema, Labels, ModuleConfig, ModuleInstance, ModuleParams, StateDictionary } from '@xyo-network/module-model'

export interface StatefulStorageClassLabels extends Labels {
  'network.xyo.storage.class': 'Stateful'
}

export const StatefulStorageClassLabels: StatefulStorageClassLabels = {
  'network.xyo.storage.class': 'Stateful',
}

export interface StatefulModuleStatic<T extends StatefulStorageClassLabels = StatefulStorageClassLabels> {
  labels: T
}

export interface StatefulModule<T extends StateDictionary = StateDictionary> {
  getPayloadDivinerForStateStore(): Promise<DivinerInstance>
}

export type StatefulModuleConfig = ModuleConfig<{
  schema: string
  stateStore: {
    archivist: string
    boundWitnessDiviner: string
    payloadDiviner: string
  }
}>

export type StatefulModuleParams = ModuleParams<AnyConfigSchema<StatefulModuleConfig>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyModule<TParams extends StatefulModuleParams = StatefulModuleParams> = new (...args: any[]) => ModuleInstance<TParams>

const moduleName = 'StatefulModuleMixin'

export const StatefulModuleMixin = <
  TParams extends StatefulModuleParams = StatefulModuleParams,
  TModule extends AnyModule<TParams> = AnyModule<TParams>,
>(
  ModuleBase: TModule,
) => {
  abstract class StatefulModuleBase extends ModuleBase implements StatefulModule {
    /**
     * Retrieves the Payload Diviner for the specified store
     * @param store The store to retrieve the Payload Diviner for
     * @returns The Payload Diviner for the specified store
     */
    async getPayloadDivinerForStateStore() {
      const name = assertEx(this.config?.stateStore?.payloadDiviner, () => `${moduleName}: Config for stateStore.payloadDiviner not specified`)
      const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve stateStore.payloadDiviner`)
      // return DivinerWrapper.wrap(mod, this.account)
      const instance = asDivinerInstance(mod)
      return assertEx(instance, () => `${moduleName}: Failed to wrap diviner instance`)
    }
  }
  return StatefulModuleBase
}
