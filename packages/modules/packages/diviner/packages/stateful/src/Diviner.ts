import { assertEx } from '@xylabs/assert'
import type { Hash } from '@xylabs/hex'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import type { ModuleState, StateDictionary } from '@xyo-network/module-model'
import { isModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema, WithMeta } from '@xyo-network/payload-model'

import { StatefulDivinerConfigSchema } from './Config.ts'
import type { StatefulDivinerParams } from './Params.ts'

const moduleName = 'StatefulDiviner'

/**
 * A Diviner that maintains state
 */
export abstract class StatefulDiviner<
  TParams extends StatefulDivinerParams = StatefulDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
  TState extends StateDictionary = StateDictionary,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, StatefulDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = StatefulDivinerConfigSchema

  /**
   * The last state
   */
  protected _lastState?: WithMeta<ModuleState<TState>>

  /**
   * Commit the internal state of the Diviner process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   * @param nextState The state to commit
   */
  protected async commitState(nextState: WithMeta<ModuleState<TState>>) {
    // Don't commit state if no state has changed
    if (nextState.state.offset === this._lastState?.state.offset) return
    this._lastState = nextState
    const archivist = await this.getArchivistForStateStore()
    const [bw] = await new BoundWitnessBuilder().payload(nextState).signer(this.account).build()
    await archivist.insert([bw, nextState])
  }

  /**
   * Retrieves the archivist for the specified store
   * @param store The store to retrieve the archivist for
   * @returns The archivist for the specified store
   */
  protected async getArchivistForStateStore() {
    const name = assertEx(this.config?.stateStore.archivist, () => `${moduleName}: Config for stateStore.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve stateStore.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the specified store
   * @param store The store to retrieve the BoundWitness Diviner for
   * @returns The BoundWitness Diviner for the specified store
   */
  protected async getBoundWitnessDivinerForStateStore() {
    const name = assertEx(this.config?.stateStore.boundWitnessDiviner, () => `${moduleName}: Config for stateStore.boundWitnessDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve stateStore.boundWitnessDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the Payload Diviner for the specified store
   * @param store The store to retrieve the Payload Diviner for
   * @returns The Payload Diviner for the specified store
   */
  protected async getPayloadDivinerForStateStore() {
    const name = assertEx(this.config?.stateStore?.payloadDiviner, () => `${moduleName}: Config for stateStore.payloadDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve stateStore.payloadDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the last state of the Diviner process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(): Promise<WithMeta<ModuleState<TState>> | undefined> {
    if (this._lastState) return this._lastState
    let hash: Hash = ''
    const diviner = await this.getBoundWitnessDivinerForStateStore()
    const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({
        address: this.account.address,
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
          .filter(({ address }) => address === this.account.address)
          // eslint-disable-next-line unicorn/no-array-reduce
          .reduce(
            (prev, curr) => (boundWitness.payload_schemas?.[curr?.index] === ModuleStateSchema ? boundWitness.payload_hashes[curr?.index] : prev),
            '' as Hash,
          )
      }
    }

    // If we able to located the last state
    if (hash) {
      // Get last state
      const archivist = await this.getArchivistForStateStore()
      const payload = (await archivist.get([hash])).find(isModuleState<TState>)
      if (payload) {
        return payload as WithMeta<ModuleState<TState>>
      }
    }
    return undefined
  }
}
