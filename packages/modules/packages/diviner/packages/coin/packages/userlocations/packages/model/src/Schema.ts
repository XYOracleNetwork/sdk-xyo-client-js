import { asSchema } from '@xyo-network/payload-model'

export const CoinUserLocationsSchema = asSchema('co.coinapp.user.locations', true)
export type CoinUserLocationsSchema = typeof CoinUserLocationsSchema

export const CoinUserLocationsDivinerSchema = asSchema('co.coinapp.diviner.user.locations', true)
export type CoinUserLocationsDivinerSchema = typeof CoinUserLocationsDivinerSchema

export const CoinUserLocationsDivinerConfigSchema = asSchema(`${CoinUserLocationsDivinerSchema}.config`, true)
export type CoinUserLocationsDivinerConfigSchema = typeof CoinUserLocationsDivinerConfigSchema

export const CoinUserLocationsQuerySchema = asSchema(`${CoinUserLocationsDivinerSchema}.query`, true)
export type CoinUserLocationsQuerySchema = typeof CoinUserLocationsQuerySchema
