import { EmptyObject, WithAdditional } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { Payload, Schema } from '@xyo-network/payload-model'
import { CustomWitnessInstance, WitnessConfig, WitnessInstance, WitnessModuleEventData, WitnessParams } from '@xyo-network/witness-model'
import { Provider } from 'ethers'

export const EvmWitnessConfigSchema = 'network.xyo.evm.witness' as const
export type EvmWitnessConfigSchema = typeof EvmWitnessConfigSchema

export type EvmWitnessConfig<TAdditional extends EmptyObject | Payload | void = void, TSchema extends string | void = void> = WitnessConfig<
  TAdditional,
  TSchema extends void ?
    TAdditional extends Payload ?
      TAdditional['schema']
    : EvmWitnessConfigSchema
  : TSchema
>

export type AdditionalEvmWitnessParams = {
  providers: Provider[]
}

export type EvmWitnessParams<
  TConfig extends AnyConfigSchema<EvmWitnessConfig> = EvmWitnessConfig,
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

creatableModule()
export abstract class AbstractEvmWitness<
    TParams extends EvmWitnessParams<AnyConfigSchema<EvmWitnessConfig>> = EvmWitnessParams,
    TIn extends Payload = Payload,
    TOut extends Payload = Payload,
    TEventData extends WitnessModuleEventData<WitnessInstance<TParams, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
      WitnessInstance<TParams, TIn, TOut>,
      TIn,
      TOut
    >,
  >
  extends AbstractWitness<TParams, TIn, TOut, TEventData>
  implements CustomWitnessInstance<TParams, TIn, TOut, TEventData>
{
  static override readonly configSchemas: Schema[] = [...super.configSchemas, EvmWitnessConfigSchema]
  static override readonly defaultConfigSchema: Schema = EvmWitnessConfigSchema
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

  protected abstract override observeHandler(payloads?: TIn[]): Promisable<TOut[]>
}
