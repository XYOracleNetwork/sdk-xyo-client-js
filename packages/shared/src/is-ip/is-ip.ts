import { ipRegex } from './ip-regex.ts'

export function isIP(value: string): boolean {
  return ipRegex({ exact: true }).test(value)
}

export function isIPv6(value: string): boolean {
  return ipRegex.v6({ exact: true }).test(value)
}

export function isIPv4(value: string): boolean {
  return ipRegex.v4({ exact: true }).test(value)
}

export function ipVersion(value: string): 6 | 4 | undefined {
  return (
    isIP(value) ?
      isIPv6(value) ? 6
      : 4
    : undefined
  )
}
