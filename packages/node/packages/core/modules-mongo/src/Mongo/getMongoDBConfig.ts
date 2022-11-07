export type MongoDbConnectionStringEnvVar = 'MONGO_CONNECTION_STRING'
export type MongoDbEnvVars = 'MONGO_DATABASE' | 'MONGO_DOMAIN' | 'MONGO_PASSWORD' | 'MONGO_USERNAME'

export type MongoEnv = Record<MongoDbEnvVars | MongoDbConnectionStringEnvVar, string | undefined>

export const getMongoDBConfig = (): MongoEnv => {
  const env: MongoEnv = {} as MongoEnv
  if (process.env.MONGO_CONNECTION_STRING) {
    env.MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING
  }
  if (process.env.MONGO_DOMAIN) {
    env.MONGO_DATABASE = process.env.MONGO_DATABASE
    env.MONGO_DOMAIN = process.env.MONGO_DOMAIN
    env.MONGO_PASSWORD = process.env.MONGO_PASSWORD
    env.MONGO_USERNAME = process.env.MONGO_USERNAME
  }
  return env
}
