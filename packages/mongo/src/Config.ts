export interface BaseMongoSdkPublicConfig {
  closeDelay?: number
  collection: string
  maxPoolSize?: number
}

export interface BaseMongoSdkPrivateConfig {
  dbConnectionString?: string
  dbDomain?: string
  dbName?: string
  dbPassword?: string
  dbUserName?: string
}

export type BaseMongoSdkConfig = BaseMongoSdkPublicConfig & BaseMongoSdkPrivateConfig
