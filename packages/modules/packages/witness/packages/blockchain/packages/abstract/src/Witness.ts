import { BaseProvider } from '@ethersproject/providers'
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
      providers: BaseProvider[]
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
  get provider() {
    const { providers } = this.params
    return providers[Date.now() % providers.length] //pick a random provider
  }
}
