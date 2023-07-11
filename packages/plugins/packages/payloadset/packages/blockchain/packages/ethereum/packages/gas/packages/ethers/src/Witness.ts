import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { EthereumGasEthersPayload, EthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { EthereumGasEthersWitnessConfig } from './Config'
import { getGasFromEthers } from './lib'
import { EthereumGasEthersWitnessConfigSchema } from './Schema'

export type EthereumGasEthersWitnessParams = WitnessParams<
  AnyConfigSchema<EthereumGasEthersWitnessConfig>,
  {
    provider?: Provider
  }
>

export class EthereumGasEthersWitness<
  TParams extends EthereumGasEthersWitnessParams = EthereumGasEthersWitnessParams,
> extends TimestampWitness<TParams> {
  static override configSchemas = [EthereumGasEthersWitnessConfigSchema]

  private _provider?: Provider

  protected get provider() {
    this._provider = this._provider ?? this.params?.provider
    return this._provider
  }

  protected override async observeHandler(): Promise<Payload[]> {
    const payload = new PayloadBuilder<EthereumGasEthersPayload>({ schema: EthereumGasEthersSchema })
      .fields(await getGasFromEthers(assertEx(this.provider, 'Provider Required')))
      .build()
    return super.observeHandler([payload])
  }
}
