import { DnsReturnCode } from './DnsReturnCode.js'
import { domainResolve } from './domainResolve.js'

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
