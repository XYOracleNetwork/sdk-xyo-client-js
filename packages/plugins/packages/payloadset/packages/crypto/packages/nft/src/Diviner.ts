import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { NftSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

type NftScoreDivinerConfigSchema = `${NftSchema}.diviner.config`
const NftScoreDivinerConfigSchema: NftScoreDivinerConfigSchema = `${NftSchema}.diviner.config`

export type NftScoreDivinerConfig = DivinerConfig<{ schema: NftScoreDivinerConfigSchema }>
export type NftScoreDivinerParams = DivinerParams<AnyConfigSchema<NftScoreDivinerConfig>>

export type HuriPayloadDivinerParams<TConfig extends NftScoreDivinerConfig = NftScoreDivinerConfig> = DivinerParams<TConfig>

export class HuriPayloadDiviner<TParams extends HuriPayloadDivinerParams = HuriPayloadDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchema = NftScoreDivinerConfigSchema

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    await Promise.resolve()
    throw new Error('not implemented')
  }
}
