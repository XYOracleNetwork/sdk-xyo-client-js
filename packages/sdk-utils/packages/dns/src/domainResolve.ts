import { DnsRecordType } from './DnsRecordType.js'
import { googleDnsOverHttps } from './googleDnsOverHttps.js'

/**
 * Resolves DNS information (resolves using DNS)
 * @param domain - string
 * @returns GoogleDnsResult
 */
const domainResolve = async (domain?: string, type = DnsRecordType.A) => {
  if (domain) {
    const dnsResult = await googleDnsOverHttps(domain, type)
    return dnsResult
  }
}

export { domainResolve }
