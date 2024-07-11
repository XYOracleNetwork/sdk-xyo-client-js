import { formatWalletPath } from './formatWalletPath.js'

export const combineWalletPaths = (path1: string, path2: string) => {
  const parts1 = formatWalletPath(path1).split('/')
  const parts2 = formatWalletPath(path2).split('/')
  return [...parts1, ...parts2].join('/')
}
