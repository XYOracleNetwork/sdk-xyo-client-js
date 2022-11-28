import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

export type CoinUserLocationsDivinerConfigSchema = 'co.coinapp.user.locations'
export const CoinUserLocationsDivinerConfigSchema: CoinUserLocationsDivinerConfigSchema = 'co.coinapp.user.locations'

export type CoinUserLocationsDivinerConfig<S extends string = string, T extends XyoPayload = XyoPayload> = DivinerConfig<
  T & {
    schema: S
  }
>

export type CoinUserLocationsDiviner = AbstractDiviner
