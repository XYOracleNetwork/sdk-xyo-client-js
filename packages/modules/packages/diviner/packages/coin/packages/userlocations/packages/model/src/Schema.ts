export const CoinUserLocationsSchema = 'co.coinapp.user.locations' as const
export type CoinUserLocationsSchema = typeof CoinUserLocationsSchema

export const CoinUserLocationsDivinerSchema = 'co.coinapp.diviner.user.locations' as const
export type CoinUserLocationsDivinerSchema = typeof CoinUserLocationsDivinerSchema

export const CoinUserLocationsDivinerConfigSchema = `${CoinUserLocationsDivinerSchema}.config` as const
export type CoinUserLocationsDivinerConfigSchema = typeof CoinUserLocationsDivinerConfigSchema

export const CoinUserLocationsQuerySchema = `${CoinUserLocationsDivinerSchema}.query` as const
export type CoinUserLocationsQuerySchema = typeof CoinUserLocationsQuerySchema
