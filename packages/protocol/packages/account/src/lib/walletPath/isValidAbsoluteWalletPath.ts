const pathSegmentRegex = /^[0-9]+[']?$/

export const isValidAbsoluteWalletPath = (path?: string): boolean => {
  if (!path) return false
  if (!path.startsWith('m')) return false
  const parts = path.split('/')
  // If any empty parts, return invalid
  if (parts.some((p) => !p)) return false
  if (parts.every((p) => pathSegmentRegex.test(p))) return true
  return false
}
