import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import * as path from 'path';
import { readFileSync } from 'fs';
import * as sharp from 'sharp';
import * as moment from 'moment';

@Injectable()
export class UtilitiesServices {
	constructor(
		private readonly jwtService: JwtService,
		private configService: ConfigService,
	) { }

	/**
	 * Validate User's password
	 * @param password
	 * @param userPassword
	 * @returns
	 */
	isPasswordValid(password: string, userPassword: string): boolean {
		return bcrypt.compareSync(password, userPassword);
	}

	/**
	 * Encode User's password
	 * @param password
	 * @returns
	 */
	encodePassword(password: string): string {
		const salt: string = bcrypt.genSaltSync(10);

		return bcrypt.hashSync(password, salt);
	}

	/**
	 * Generate JWT Access Token
	 * @param user
	 * @returns
	 */
	async generateToken(user: {
		id: string;
		email: string;
		accountId: string;
	}): Promise<string> {
		return this.jwtService.signAsync(
			{
				id: user.id,
				email: user.email,
				accountId: user.accountId,
			},
			{
				secret: this.configService.get<string>('JWT_SECRET'),
				expiresIn: `${this.configService.get<number>('JWT_EXPIRES_IN_HOURS')}h`,
			},
		);
	}

	generateRandomCode(): number {
		// Generate a random number between 100,000 and 999,999
		return Math.floor(Math.random() * 9000) + 1000;
	}

	convertDateToTimeStamp(dateTime: moment.Moment): number {
		return Math.floor(dateTime.unix());
	}

	convertTimeStampToDate(timestamp: number) {
		const date = moment.unix(timestamp).format('YYYY-MM-DD');
		const time = moment.unix(timestamp).format('HH:mm:ss A');
		return { date, time };
	}

	commonTemplateHandler(renderingParams: Record<string, unknown>, templateName: string): string {
		const templatePath = path.resolve(`./src/common/templates/${templateName}`);

		const fileData: string = readFileSync(templatePath, 'utf8');
		const compiledTemplate: _.TemplateExecutor = _.template(fileData);
		const htmlData: string = compiledTemplate(renderingParams);

		return htmlData;
	}

	convertToKebabCase(value: string) {
		// Remove all special characters except -
		let convertedValue = value.replace(/[^a-zA-Z0-9\s-]/g, '');

		// Replace spaces with hyphens
		convertedValue = convertedValue.replace(/\s+/g, '-').toLowerCase();

		// Remove leading hyphen if any in start
		if (convertedValue.startsWith('-')) {
			convertedValue = convertedValue.slice(1);
		}

		// Remove trailing hyphen if any in end
		if (convertedValue.endsWith('-')) {
			convertedValue = convertedValue.slice(0, convertedValue.length - 1);
		}

		// remove consecutive - if any
		convertedValue = convertedValue.replace(/-+/g, '-');

		return convertedValue;
	}

	/**
	 * To convert image in png
	 * @param fileBuffer
	 * @returns
	 */
	async convertImageToPng(fileBuffer) {
		return sharp(fileBuffer)
			.png()
			.toBuffer();
	}

	/**
	 * To remove special characters and underscore
	 * @param name
	 * @returns
	 */
	async removeSpecialCharacters(name: string) {
		// Remove all special characters
		let convertedValue = name.replace(/[^a-zA-Z0-9\s_]/g, '');
		convertedValue = convertedValue.replace(/_+/g, ' ');
		return convertedValue;
	}
}
