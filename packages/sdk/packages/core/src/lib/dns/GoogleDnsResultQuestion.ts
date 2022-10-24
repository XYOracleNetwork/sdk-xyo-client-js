import { DnsRecordType } from './DnsRecordType'

export interface GoogleDnsResultQuestion {
  cd?: boolean
  ct?: string
  do?: boolean
  edns_client_subnet?: string
  name?: string
  random_padding?: string
  type?: DnsRecordType
}
