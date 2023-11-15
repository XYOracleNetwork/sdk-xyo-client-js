import { BaseProvider } from '@ethersproject/providers'
import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyObject, WithAdditional } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessInstance, WitnessModuleEventData, WitnessParams } from '@xyo-network/witness-model'

export const BlockchainWitnessConfigSchema = 'network.xyo.blockchain.witness'
export type BlockchainWitnessConfigSchema = typeof BlockchainWitnessConfigSchema

export type BlockchainWitnessConfig<TAdditional extends Omit<Payload, 'schema'> | void = void, TSchema extends string | void = void> = WitnessConfig<
  TAdditional & { schema: TSchema extends void ? (TAdditional extends void ? string : BlockchainWitnessConfigSchema) : TSchema }
>

export type AdditionalBlockchainWitnessParams = {
  providers: BaseProvider[]
}

export type BlockchainWitnessParams<
  TConfig extends BlockchainWitnessConfig = BlockchainWitnessConfig,
  TAdditionalParams extends AnyObject | void = void,
> = WitnessParams<
  TConfig,
  WithAdditional<
    {
      providers: () => Promisable<BaseProvider[]>
    },
    TAdditionalParams
  >
>

export abstract class AbstractBlockchainWitness<
  TParams extends BlockchainWitnessParams = BlockchainWitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends WitnessModuleEventData<WitnessInstance<TParams, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractWitness<TParams, TIn, TOut, TEventData> {
  private _providers: BaseProvider[] | undefined = undefined

  async getProvider(cache?: boolean): Promise<BaseProvider | undefined>
  async getProvider(cache: boolean, error: string | true): Promise<BaseProvider>
  async getProvider(cache = false, error?: string | boolean): Promise<BaseProvider | undefined> {
    const providers = await this.getProviders(cache)
    if (providers.length === 0) {
      if (error) {
        throw Error(typeof error === 'string' ? error : 'No providers available')
      }
      return undefined
    }
    return providers[Date.now() % providers.length] //pick a random provider
  }

  async getProviders(cache = false): Promise<BaseProvider[]> {
    const cachedProviders = cache ? this._providers : undefined
    this._providers = cachedProviders ?? (await this.params.providers())
    return this._providers
  }
}
