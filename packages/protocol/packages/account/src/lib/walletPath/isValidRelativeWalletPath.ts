import { formatWalletPath } from './formatWalletPath'

export const isValidRelativeWalletPath = (path: string): boolean => {
  const formatted = formatWalletPath(path)
  return formatted.length > 0 && formatted[0] !== 'm'
}
