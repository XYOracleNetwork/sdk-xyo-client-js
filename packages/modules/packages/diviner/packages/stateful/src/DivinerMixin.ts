import { assertEx } from '@xylabs/assert'
import { asArchivistInstance } from '@xyo-network/archivist'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import {
  AnyConfigSchema,
  isModuleState,
  ModuleInstance,
  ModuleParams,
  ModuleState,
  ModuleStateSchema,
  StateDictionary,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { StatefulDivinerConfig } from './Config'

export type StatefulModuleParams = ModuleParams<AnyConfigSchema<StatefulDivinerConfig>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyModule<TParams extends StatefulModuleParams = StatefulModuleParams> = new (...args: any[]) => ModuleInstance<TParams>

const moduleName = 'StatefulModuleMixin'

/**
 * @ignore Inherit from StatefulDiviner instead
 * @param ModuleBase
 * @returns
 */
export const StatefulModuleMixin = <
  TParams extends StatefulModuleParams = StatefulModuleParams,
  TModule extends AnyModule<TParams> = AnyModule<TParams>,
  TState extends StateDictionary = StateDictionary,
>(
  ModuleBase: TModule,
) => {
  abstract class StatefulModuleBase extends ModuleBase {
    _lastState?: ModuleState<TState>

    /**
     * Commit the internal state of the Diviner process. This is similar
     * to a transaction completion in a database and should only be called
     * when results have been successfully persisted to the appropriate
     * external stores.
     * @param nextState The state to commit
     */
    async commitState(nextState: ModuleState<TState>) {
      // Don't commit state if no state has changed
      if (nextState.state.offset === this._lastState?.state.offset) return
      this._lastState = nextState
      const archivist = await this.getArchivistForStore()
      // const [bw] = await new BoundWitnessBuilder().payload(nextState).witness(this.account).build()
      const [bw] = await new BoundWitnessBuilder().payload(nextState).build()
      await archivist.insert([bw, nextState])
    }

    /**
     * Retrieves the archivist for the specified store
     * @param store The store to retrieve the archivist for
     * @returns The archivist for the specified store
     */
    async getArchivistForStore() {
      const name = assertEx(this.config?.stateStore?.archivist, () => `${moduleName}: Config for stateStore.archivist not specified`)
      const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve stateStore.archivist`)
      // return ArchivistWrapper.wrap(mod, this.account)
      const instance = asArchivistInstance(mod)
      return assertEx(instance, () => `${moduleName}: Failed to wrap archivist instance`)
    }

    /**
     * Retrieves the BoundWitness Diviner for the specified store
     * @param store The store to retrieve the BoundWitness Diviner for
     * @returns The BoundWitness Diviner for the specified store
     */
    async getBoundWitnessDivinerForStore() {
      const name = assertEx(
        this.config?.stateStore?.boundWitnessDiviner,
        () => `${moduleName}: Config for stateStore.boundWitnessDiviner not specified`,
      )
      const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve stateStore.boundWitnessDiviner`)
      // return DivinerWrapper.wrap(mod, this.account)
      const instance = asDivinerInstance(mod)
      return assertEx(instance, () => `${moduleName}: Failed to wrap diviner instance`)
    }
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
    /**
     * Retrieves the last state of the Diviner process. Used to recover state after
     * preemptions, reboots, etc.
     */
    async retrieveState(): Promise<ModuleState<TState> | undefined> {
      if (this._lastState) return this._lastState
      let hash: string = ''
      const diviner = await this.getBoundWitnessDivinerForStore()
      const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
        .fields({
          // address: this.account.address,
          limit: 1,
          offset: 0,
          order: 'desc',
          payload_schemas: [ModuleStateSchema],
        })
        .build()
      const boundWitnesses = await diviner.divine([query])
      if (boundWitnesses.length > 0) {
        const boundWitness = boundWitnesses[0]
        if (isBoundWitness(boundWitness)) {
          // Find the index for this address in the BoundWitness that is a ModuleState
          hash = boundWitness.addresses
            .map((address, index) => ({ address, index }))
            // .filter(({ address }) => address === this.account.address)
            .reduce(
              (prev, curr) => (boundWitness.payload_schemas?.[curr?.index] === ModuleStateSchema ? boundWitness.payload_hashes[curr?.index] : prev),
              '',
            )
        }
      }

      // If we able to located the last state
      if (hash) {
        // Get last state
        const archivist = await this.getArchivistForStore()
        const payload = (await archivist.get([hash])).find(isModuleState<TState>)
        if (payload) {
          return payload
        }
      }
      return undefined
    }
  }
  return StatefulModuleBase
}
