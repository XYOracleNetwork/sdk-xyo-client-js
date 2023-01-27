export interface BaseMongoSdkConfig {
  closeDelay?: number
  collection: string
  dbConnectionString?: string
  dbDomain?: string
  dbName?: string
  dbPassword?: string
  dbUserName?: string
  maxPoolSize?: number
}
