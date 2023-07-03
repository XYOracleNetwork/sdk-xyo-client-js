export const formatWalletPath = (path: string) => {
  return path
    .trimStart()
    .trimEnd()
    .split('/')
    .filter((p) => p)
    .join('/')
}
