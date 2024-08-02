import { DnsReturnCode } from './DnsReturnCode.ts'
import { domainResolve } from './domainResolve.ts'

/**
 * Checks if a domain exists (resolves using DNS)
 * @param domain - string
 * @returns boolean
 */
const domainExists = async (domain?: string) => {
  if (domain === undefined) return false
  const dnsResult = await domainResolve(domain)
  return dnsResult?.Status === DnsReturnCode.NoError
}

export { domainExists }
