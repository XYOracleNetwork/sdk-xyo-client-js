// Originally from https://github.com/sindresorhus/is-ip under MIT license
// Copied here because it didn't support CommonJS style require

/*

MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import { ipRegex } from './ip-regex'

/**
Check if `string` is IPv6 or IPv4.
@example
```
import {isIP} from 'is-ip';
isIP('1:2:3:4:5:6:7:8');
//=> true
isIP('192.168.0.1');
//=> true
```
*/
export function isIP(string: string): boolean {
  return ipRegex({ exact: true }).test(string)
}

/**
Check if `string` is IPv6.
@example
```
import {isIPv6} from 'is-ip';
isIPv6('1:2:3:4:5:6:7:8');
//=> true
```
*/
export function isIPv6(string: string): boolean {
  return ipRegex.v6({ exact: true }).test(string)
}

/**
Check if `string` is IPv4.
@example
```
import {isIPv4} from 'is-ip';
isIPv4('192.168.0.1');
//=> true
```
*/
export function isIPv4(string: string): boolean {
  return ipRegex.v4({ exact: true }).test(string)
}

/**
@returns `6` if `string` is IPv6, `4` if `string` is IPv4, or `undefined` if `string` is neither.
@example
```
import {ipVersion} from 'is-ip';
ipVersion('1:2:3:4:5:6:7:8');
//=> 6
ipVersion('192.168.0.1');
//=> 4
ipVersion('abc');
//=> undefined
```
*/
export function ipVersion(string: string): 6 | 4 | undefined {
  return isIP(string) ? (isIPv6(string) ? 6 : 4) : undefined
}
