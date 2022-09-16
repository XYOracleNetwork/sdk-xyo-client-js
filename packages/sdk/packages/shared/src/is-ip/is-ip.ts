import { ipRegex } from './ip-regex'

export function isIP(value: string) {
  return ipRegex({ exact: true }).test(value)
}

export function isIPv6(value: string) {
  return ipRegex.v6({ exact: true }).test(value)
}

export function isIPv4(value: string) {
  return ipRegex.v4({ exact: true }).test(value)
}

export function ipVersion(value: string) {
  return isIP(value) ? (isIPv6(value) ? 6 : 4) : undefined
}
