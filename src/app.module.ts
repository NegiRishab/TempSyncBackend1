import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './controllers/users/users.module';
import { AuthModule } from './controllers/auth/auth.module';
import * as path from 'path';
import * as fs from 'fs-extra';
import { DataSourceOptions } from 'typeorm';
import { ClinicModule } from './controllers/clinic/clinic.module';


@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => {
				console.log('process.env ', process.env);
				const DB_ENTITIES = configService.get('DB_ENTITIES') ?? 'dist/**/*.entity.js';
				const DB_MIGRATIONS = configService.get('DB_MIGRATIONS') ?? 'dist/migrations/*.js';
				let sslConfig = {};
				if (process.env.NODE_ENV === 'local') {
					sslConfig = false;
				} else if (process.env.NODE_ENV === 'development') {
					const certificate = fs.readFileSync(
						path.join('src', 'assets', 'db-certificate-development.crt')
					).toString();
					sslConfig = {
						ca: certificate
					};
				} else if (process.env.NODE_ENV === 'production') {
					const certificate = fs.readFileSync(
						path.join('src', 'assets', 'db-certificate-production.pem')
					);
					sslConfig = {
						rejectUnauthorized: false,
						ca: certificate
					};
					console.log('certificate ', certificate);
				}
				const dbOptions: DataSourceOptions = {
					type: 'postgres',
					url: configService.get<string>('DB_URL'),
					synchronize: false,
					ssl: sslConfig,
					logging: configService.get('DB_LOGGING'),
					entities: [DB_ENTITIES],
					migrations: [DB_MIGRATIONS]
				};
				console.log('dbOptions ', dbOptions);
				return dbOptions;
			},
			inject: [ConfigService],
		}),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		UsersModule,
		AuthModule,
		ClinicModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
