import { CryptoContractFunctionCallResult } from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'

import { ContractInfo, CryptoContractDiviner, OmittedContractInfo } from './CryptoContractDiviner'

export const CryptoContractErc721DivinerConfigSchema = 'network.xyo.crypto.contract.erc721.info.diviner.config'
export type CryptoContractErc721DivinerConfigSchema = typeof CryptoContractErc721DivinerConfigSchema

export type CryptoContractErc721DivinerConfig = DivinerConfig
export type CryptoContractErc721DivinerParams = DivinerParams<CryptoContractErc721DivinerConfig>

export const Erc721ContractInfoSchema = 'network.xyo.crypto.contract.erc721.info'
export type Erc721ContractInfoSchema = typeof Erc721ContractInfoSchema

export type Erc721ContractInfo = ContractInfo<
  {
    name?: string
    symbol?: string
    totalSupply?: string
  },
  Erc721ContractInfoSchema
>

export class CryptoContractErc721Diviner<
  TParams extends CryptoContractErc721DivinerParams = CryptoContractErc721DivinerParams,
> extends CryptoContractDiviner<Erc721ContractInfo, TParams> {
  static override configSchemas = [CryptoContractErc721DivinerConfigSchema]

  protected override async reduceResults(
    address: string,
    callResults: CryptoContractFunctionCallResult[],
  ): Promise<OmittedContractInfo<Erc721ContractInfo>> {
    const name = await CryptoContractErc721Diviner.findCallResult(address, 'name', [], callResults)
    const symbol = await CryptoContractErc721Diviner.findCallResult(address, 'symbol', [], callResults)
    return {
      name,
      schema: Erc721ContractInfoSchema,
      symbol,
    }
  }
}
