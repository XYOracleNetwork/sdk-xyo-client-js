import { NodeEnv } from './NodeEnv'

// TODO: Move to Express SDK
export const isDevelopment = () => {
  return (process.env.NODE_ENV as NodeEnv) === 'development'
}
