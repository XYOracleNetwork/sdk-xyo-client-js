import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { DivinerConfig, DivinerConfigSchema, DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { AnyConfigSchema, isModuleState, ModuleParams, ModuleState, ModuleStateSchema, StateDictionary } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

const StatefulDivinerConfigSchema = 'network.xyo.diviner.stateful.config' as const
export type StatefulDivinerConfigSchema = typeof StatefulDivinerConfigSchema

export type StatefulModuleConfig = DivinerConfig<{
  schema: DivinerConfigSchema
  stateStore: {
    archivist: string
    boundWitnessDiviner: string
    payloadDiviner: string
  }
}>

export type StatefulDivinerParams = ModuleParams<AnyConfigSchema<StatefulModuleConfig>>

type ConfigStore = 'stateStore'

const moduleName = 'StatefulDiviner'

export abstract class StatefulDiviner<
  TParams extends StatefulDivinerParams = StatefulDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
  TState extends StateDictionary = StateDictionary,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: string[] = [DivinerConfigSchema, StatefulDivinerConfigSchema]

  private _lastState?: ModuleState<TState>

  /**
   * Commit the internal state of the Diviner process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   * @param nextState The state to commit
   */
  protected async commitState(nextState: ModuleState<TState>) {
    // Don't commit state if no state has changed
    if (nextState.state.offset === this._lastState?.state.offset) return
    this._lastState = nextState
    const archivist = await this.getArchivistForStore('stateStore')
    const [bw] = await new BoundWitnessBuilder().payload(nextState).witness(this.account).build()
    await archivist.insert([bw, nextState])
  }

  /**
   * Retrieves the archivist for the specified store
   * @param store The store to retrieve the archivist for
   * @returns The archivist for the specified store
   */
  protected async getArchivistForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.archivist, () => `${moduleName}: Config for ${store}.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the specified store
   * @param store The store to retrieve the BoundWitness Diviner for
   * @returns The BoundWitness Diviner for the specified store
   */
  protected async getBoundWitnessDivinerForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.boundWitnessDiviner, () => `${moduleName}: Config for ${store}.boundWitnessDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.boundWitnessDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the Payload Diviner for the specified store
   * @param store The store to retrieve the Payload Diviner for
   * @returns The Payload Diviner for the specified store
   */
  protected async getPayloadDivinerForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.payloadDiviner, () => `${moduleName}: Config for ${store}.payloadDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.payloadDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the last state of the Diviner process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(): Promise<ModuleState<TState> | undefined> {
    if (this._lastState) return this._lastState
    let hash: string = ''
    const diviner = await this.getBoundWitnessDivinerForStore('stateStore')
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
          .reduce(
            (prev, curr) => (boundWitness.payload_schemas?.[curr?.index] === ModuleStateSchema ? boundWitness.payload_hashes[curr?.index] : prev),
            '',
          )
      }
    }

    // If we able to located the last state
    if (hash) {
      // Get last state
      const archivist = await this.getArchivistForStore('stateStore')
      const payload = (await archivist.get([hash])).find(isModuleState<TState>)
      if (payload) {
        return payload
      }
    }
    return undefined
  }
}
