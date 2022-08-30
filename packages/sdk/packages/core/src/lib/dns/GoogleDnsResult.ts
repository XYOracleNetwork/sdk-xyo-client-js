import { DnsReturnCode } from './DnsReturnCode'
import { GoogleDnsResultAnswer } from './GoogleDnsResultAnswer'
import { GoogleDnsResultQuestion } from './GoogleDnsResultQuestion'

export interface GoogleDnsResult {
  Status?: DnsReturnCode
  TC?: boolean //Truncated
  RD?: boolean
  RA?: boolean
  AD?: boolean //Validated with DNSSEC
  CD?: boolean //DNSSEC disabled
  Question?: GoogleDnsResultQuestion[]
  Answer?: GoogleDnsResultAnswer[]
  Authority?: GoogleDnsResultAnswer[]
  Comment?: string
  edns_client_subnet?: string
}
