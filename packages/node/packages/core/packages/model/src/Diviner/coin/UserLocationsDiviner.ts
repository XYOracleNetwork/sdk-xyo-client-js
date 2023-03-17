import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { Payload } from '@xyo-network/payload-model'

export type CoinUserLocationsDivinerConfigSchema = 'co.coinapp.user.locations'
export const CoinUserLocationsDivinerConfigSchema: CoinUserLocationsDivinerConfigSchema = 'co.coinapp.user.locations'

export type CoinUserLocationsDivinerConfig<S extends string = string, T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: S
  }
>

export type CoinUserLocationsDiviner = AbstractDiviner
