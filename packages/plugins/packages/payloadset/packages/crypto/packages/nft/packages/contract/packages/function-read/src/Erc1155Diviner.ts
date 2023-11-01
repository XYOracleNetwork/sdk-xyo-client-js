import { CryptoContractFunctionCallResult } from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'

import { ContractInfo, CryptoContractDiviner, OmittedContractInfo } from './CryptoContractDiviner'

export const CryptoContractErc1155DivinerConfigSchema = 'network.xyo.crypto.contract.erc1155.info.diviner.config'
export type CryptoContractErc1155DivinerConfigSchema = typeof CryptoContractErc1155DivinerConfigSchema

export type CryptoContractErc1155DivinerConfig = DivinerConfig
export type CryptoContractErc1155DivinerParams = DivinerParams<CryptoContractErc1155DivinerConfig>

export const Erc1155ContractInfoSchema = 'network.xyo.crypto.contract.erc1155.info'
export type Erc1155ContractInfoSchema = typeof Erc1155ContractInfoSchema

export type Erc1155ContractInfo = ContractInfo<
  {
    uri?: string
  },
  Erc1155ContractInfoSchema
>

export class CryptoContractErc1155Diviner<
  TParams extends CryptoContractErc1155DivinerParams = CryptoContractErc1155DivinerParams,
> extends CryptoContractDiviner<Erc1155ContractInfo, TParams> {
  static override configSchemas = [CryptoContractErc1155DivinerConfigSchema]

  protected override async reduceResults(
    address: string,
    callResults: CryptoContractFunctionCallResult[],
  ): Promise<OmittedContractInfo<Erc1155ContractInfo>> {
    const uri = await CryptoContractErc1155Diviner.findCallResult(address, 'uri', [], callResults)
    return {
      schema: Erc1155ContractInfoSchema,
      uri,
    }
  }
}
