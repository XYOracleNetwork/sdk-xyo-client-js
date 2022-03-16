import { DnsRecordType } from './DnsRecordType'

export interface GoogleDnsResultAnswer {
  name?: string
  type?: DnsRecordType
  TTL?: number
  data?: string
}
