import { DnsRecordType } from './DnsRecordType.js'
import { googleDnsOverHttps } from './googleDnsOverHttps.js'

/**
 * Resolves DNS information (resolves using DNS)
 * @param domain - string
 * @returns GoogleDnsResult
 */
const domainResolve = async (domain?: string, type = DnsRecordType.A) => {
  if (domain) {
    return await googleDnsOverHttps(domain, type)
  }
}

export { domainResolve }
