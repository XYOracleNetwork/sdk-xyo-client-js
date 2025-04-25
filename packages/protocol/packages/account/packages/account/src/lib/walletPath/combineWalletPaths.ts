import { formatWalletPath } from './formatWalletPath.ts'

export const combineWalletPaths = (path1: string, path2: string) => {
  const parts1 = formatWalletPath(path1).split('/')
  const parts2 = formatWalletPath(path2).split('/')
  return [...parts1, ...parts2].join('/')
}
