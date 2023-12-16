import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { EmptyObject, WithAdditional } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessInstance, WitnessModuleEventData, WitnessParams } from '@xyo-network/witness-model'
import { Provider } from 'ethers'

export const BlockchainWitnessConfigSchema = 'network.xyo.blockchain.witness'
export type BlockchainWitnessConfigSchema = typeof BlockchainWitnessConfigSchema

export type BlockchainWitnessConfig<TAdditional extends EmptyObject | Payload | void = void, TSchema extends string | void = void> = WitnessConfig<
  TAdditional,
  TSchema extends void ? (TAdditional extends Payload ? TAdditional['schema'] : BlockchainWitnessConfigSchema) : TSchema
>

export type AdditionalBlockchainWitnessParams = {
  providers: Provider[]
}

export type BlockchainWitnessParams<
  TConfig extends AnyConfigSchema<BlockchainWitnessConfig> = BlockchainWitnessConfig,
  TAdditionalParams extends EmptyObject | void = void,
> = WitnessParams<
  TConfig,
  WithAdditional<
    {
      providers: () => Promisable<Provider[]>
    },
    TAdditionalParams
  >
>

export abstract class AbstractBlockchainWitness<
  TParams extends BlockchainWitnessParams<AnyConfigSchema<BlockchainWitnessConfig>> = BlockchainWitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends WitnessModuleEventData<WitnessInstance<TParams, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractWitness<TParams, TIn, TOut, TEventData> {
  private _providers: Provider[] | undefined = undefined

  async getProvider(cache?: boolean): Promise<Provider | undefined>
  async getProvider(cache: boolean, error: string | true): Promise<Provider>
  async getProvider(cache = false, error?: string | boolean): Promise<Provider | undefined> {
    const providers = await this.getProviders(cache)
    if (providers.length === 0) {
      if (error) {
        throw new Error(typeof error === 'string' ? error : 'No providers available')
      }
      return undefined
    }
    return providers[Date.now() % providers.length] //pick a random provider
  }

  async getProviders(cache = false): Promise<Provider[]> {
    const cachedProviders = cache ? this._providers : undefined
    this._providers = cachedProviders ?? (await this.params.providers())
    return this._providers
  }
}
