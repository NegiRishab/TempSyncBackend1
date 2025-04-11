// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { LogService } from 'src/controllers/log/log.service';
// import { LogEventEnum } from '../enums/log.enum';
// import axios, { AxiosRequestConfig } from 'axios'; // Import axios and AxiosRequestConfig

// @Injectable()
// export class CloudFlareService {
//     constructor(
//         private readonly configService: ConfigService,
//         private readonly logService: LogService,
//     ) {}

//     async createSubDomain(subDomain: string, accountId) {
//         const ipAddress = this.configService.get('CLOUDFLARE_IP_ADDRESS');
//         const authEmail = this.configService.get('CLOUDFLARE_EMAIL');
//         const authKey = this.configService.get('CLOUDFLARE_API_KEY');
//         const zoneId = this.configService.get('CLOUDFLARE_ZONE_ID');
//         const options: AxiosRequestConfig = {
//             method: 'POST',
//             url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-Auth-Email': authEmail,
//                 'X-Auth-Key': authKey
//             },
//             data: {
//                 content: ipAddress,
//                 name: subDomain,
//                 proxied: true,
//                 type: 'CNAME',
//                 comment: 'Domain verification record',
//                 ttl: 3600
//             }
//         };

//         try {
//             const res = await axios.request(options);
//             await this.logService.logSuccessCloudFlare(LogEventEnum.CLOUDFLARE_API, res?.data, accountId);
//             return true;
//         } catch (error) {
//             console.error('[CloudService]:[createSubDomain]:', error.response.data);
//             await this.logService.logErrorCloudFlare(
//                 LogEventEnum.CLOUDFLARE_API,
//                 {
//                     error: error.response.data,
//                 },
//                 accountId
//             );
//             throw error;
//         }
//     }
// }
