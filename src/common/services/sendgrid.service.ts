// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as SendGrid from '@sendgrid/mail';

// @Injectable()
// export class SendgridService {
// 	constructor(private readonly configService: ConfigService) {
// 		// SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_API_KEY'));
// 	}

// 	async send(mail: SendGrid.MailDataRequired): Promise<[SendGrid.ClientResponse, object] | boolean> {
// 		try {
// 			const transport = await SendGrid.send(mail);
// 			return transport;
// 		} catch (error) {
// 			console.error('[SendgridService]:[send]', JSON.stringify(error));
// 			// throw error;
// 			return false;
// 		}
// 	}
// 	async sendMultiple(mails: SendGrid.MailDataRequired[]): Promise<[SendGrid.ClientResponse, object] | boolean> {
// 		try {
// 			const transport = await SendGrid.send(mails);
// 			return transport;
// 		} catch (error) {
// 			console.error('[SendgridService]:[send]', JSON.stringify(error));
// 			// throw error;
// 			return false;
// 		}
// 	}
// }
