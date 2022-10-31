import { DnsReturnCode } from './DnsReturnCode'
import { GoogleDnsResultAnswer } from './GoogleDnsResultAnswer'
import { GoogleDnsResultQuestion } from './GoogleDnsResultQuestion'

export interface GoogleDnsResult {
  AD?: boolean //Validated with DNSSEC
  Answer?: GoogleDnsResultAnswer[]
  Authority?: GoogleDnsResultAnswer[]
  CD?: boolean //DNSSEC disabled
  Comment?: string
  Question?: GoogleDnsResultQuestion[]
  RA?: boolean
  RD?: boolean
  Status?: DnsReturnCode
  TC?: boolean //Truncated
  edns_client_subnet?: string
}
