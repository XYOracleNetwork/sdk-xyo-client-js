import { NodeEnv } from './NodeEnv'

// TODO: Move to Express SDK
export const isTest = () => {
  return (process.env.NODE_ENV as NodeEnv) === 'test'
}
