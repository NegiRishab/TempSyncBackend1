// import { Injectable } from '@nestjs/common';
// import { S3, GetObjectCommand, DeleteObjectsCommand, PutObjectCommandInput, ListObjectsV2Command, ListObjectsV2CommandInput, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
// import { ConfigService } from '@nestjs/config';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// @Injectable()
// export class AwsClientService {
// 	private client: S3;

// 	constructor(
// 		private configService: ConfigService,
// 	) {
// 		this.client = new S3({
// 			region: this.configService.get<string>('AWS_REGION'),
// 			credentials: {
// 				accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
// 				secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
// 			},
// 		});
// 	}

// 	/**
// 	 * Create presigned url for s3 object
// 	 * @param key
// 	 * @returns
// 	 */
// 	createPreSignedUrlWithClient = async (key: string) => {
// 		try {
// 			const options = { Bucket: this.configService.get<string>('AWS_BUCKET_NAME'), Key: key };
// 			const command = new GetObjectCommand(options);
// 			return await getSignedUrl(this.client, command, { expiresIn: 3600 });
// 		} catch (error) {
// 			console.error('[AwsClientService]:[createPreSignedUrlWithClient]:', error);
// 			throw error;
// 		}
// 	};

// 	/**
// 	 * Create presigned url for s3 object
// 	 * @param key
// 	 * @returns
// 	 */
// 	createPreSignedUrlWithClientWithBucketName = async (key: string) => {
// 		try {
// 			const options = {
// 				Bucket: 'stubified-assets', Key: key
// 			};
// 			const command = new GetObjectCommand(options);
// 			return await getSignedUrl(this.client, command, { expiresIn: 3600 });
// 		} catch (error) {
// 			console.error('[AwsClientService]:[createPreSignedUrlWithClient]:', error);
// 			throw error;
// 		}
// 	};

// 	/**
// 	 * Delete object
// 	 * @param key
// 	 * @returns
// 	 */
// 	deleteObjects = async (objects: { Key: string; }[]) => {
// 		try {
// 			const options = {
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 				Delete: {
// 					Objects: objects,
// 					Quiet: true,
// 				}
// 			};
// 			const command = new DeleteObjectsCommand(options);
// 			return await this.client.send(command);
// 		} catch (error) {
// 			console.error('[AwsClientService]:[createPreSignedUrlWithClient]:', error);
// 			throw error;
// 		}
// 	};

// 	async upload(params: { fileName: string; file: Buffer; }) {
// 		try {
// 			const uploadOptions: PutObjectCommandInput = {
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 				Key: params.fileName,
// 				Body: params.file,
// 			};

// 			await this.client?.putObject(uploadOptions);
// 		} catch (error) {
// 			console.error('[AwsClientService]:[upload]', error);
// 			throw error;
// 		}
// 	}

// 	//To list images from bucket
// 	async listImagesInBucket() {
// 		try {
// 			const listParams = {
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 			};

// 			const response = { imageKeys: [], contents: [] };

// 			const objectsList = await this.client?.send(new ListObjectsV2Command(listParams));

// 			if (objectsList && objectsList.Contents) {
// 				response.imageKeys = objectsList.Contents.map((object) => object.Key);
// 				response.contents = objectsList.Contents;
// 			}

// 			return response;
// 		} catch (error) {
// 			console.error('[AwsClientService]:[listImagesInBucket]', error);
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * To create empty folder
// 	 * @param folderName
// 	 */
// 	async createFolder(folderName: string) {
// 		try {
// 			const uploadOptions = {
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 				Key: `${folderName}/`,
// 				Body: '',
// 			};

// 			await this.client?.putObject(uploadOptions);
// 		} catch (error) {
// 			console.error('[AwsClientService]:[createFolder]', error);
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * Check object exists
// 	 * @param folderName
// 	 */
// 	async headObjectHandled(fullPath: string) {
// 		try {
// 			const content = await this.client.headObject({
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 				Key: fullPath,
// 			});

// 			return content;
// 		} catch (error) {
// 			return false;
// 		}
// 	}

// 	//To list images from bucket
// 	async listObjectsV2(pathPrefix?: string) {
// 		try {
// 			const listObjectsOptions: ListObjectsV2CommandInput = {
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 			};

// 			if (pathPrefix) {
// 				listObjectsOptions.Prefix = pathPrefix;
// 			}

// 			const content = await this.client.listObjectsV2(listObjectsOptions);
// 			return content;
// 		} catch (error) {
// 			console.error('[AwsClientService]:[listImagesInBucket]', error);
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * Delete file or folder from path
// 	 * @param folderName
// 	 */
// 	async delete(fullPath: string) {
// 		try {
// 			const content = await this.client.deleteObject({
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 				Key: fullPath,
// 			});

// 			return content;
// 		} catch (error) {
// 			console.error('[AwsClientService]:[delete]', error);
// 			return false;
// 		}
// 	}

// 	/**
// 	 * Delete file or folder from path
// 	 * @param folderName
// 	 */
// 	async deleteMany(objects: ListObjectsV2CommandOutput) {
// 		try {

// 			const deleteParams = {
// 				Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
// 				Delete: { Objects: [] }
// 			};

// 			objects.Contents.forEach(({ Key }) => {
// 				deleteParams.Delete.Objects.push({ Key });
// 			});

// 			const content = await this.client.deleteObjects(deleteParams);

// 			return content;
// 		} catch (error) {
// 			console.error('[AwsClientService]:[deleteMany]', error);
// 			return false;
// 		}
// 	}
// }
