import { NodeEnv } from './NodeEnv'

// TODO: Move to Express SDK
export const isProduction = () => {
  return (process.env.NODE_ENV as NodeEnv) === 'production'
}
