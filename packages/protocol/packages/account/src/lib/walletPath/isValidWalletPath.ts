const pathSegmentRegex = /^\d+'?$/

export const isValidAbsoluteWalletPath = (path?: string): boolean => {
  if (!path) return false
  if (!path.startsWith('m')) return false
  return path === 'm' ? true : isValidRelativeWalletPath(path.slice(2))
}

export const isValidRelativeWalletPath = (path?: string): boolean => {
  if (!path) return false
  if (path.length === 0 || path[0] === 'm') return false
  const parts = path.split('/')
  // If any empty parts, return invalid
  if (parts.some((p) => !p)) return false
  // If all the segments after the first are not valid HD paths, return invalid
  if (!parts.slice(1).every((p) => pathSegmentRegex.test(p))) return false
  return true
}
