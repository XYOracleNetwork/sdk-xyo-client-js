import { DnsRecordType } from './DnsRecordType'

export interface GoogleDnsResultAnswer {
  TTL?: number
  data?: string
  name?: string
  type?: DnsRecordType
}
