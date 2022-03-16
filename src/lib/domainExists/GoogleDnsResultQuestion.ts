import { DnsRecordType } from './DnsRecordType'

export interface GoogleDnsResultQuestion {
  name?: string
  type?: DnsRecordType
  cd?: boolean
  ct?: string
  do?: boolean
  edns_client_subnet?: string
  random_padding?: string
}
