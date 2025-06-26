import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";
import { WorkplaceUser } from "src/controllers/workplace/entities/workplace-user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public client: Redis;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(WorkplaceUser)
    private readonly wpUserRepo: Repository<WorkplaceUser>,
  ) {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {
      const redisUrl = this.getRedisUrl();

      const redisConfig = {
        retryDelayOnFailover: 100,
        retryDelayOnClusterDown: 300,
        retryDelayOnReady: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      };

      this.client = new Redis(redisUrl, redisConfig);

      this.setupEventListeners();
    } catch (error) {
      this.logger.error("Failed to initialize Redis:", error);
      throw error;
    }
  }

  private getRedisUrl(): string {
    const redisUrl = this.configService.get<string>("REDIS_URL");
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is not configured");
    }
    return redisUrl;
  }

  private setupEventListeners(): void {
    this.client.on("connect", () => {
      this.logger.log("Redis connected successfully");
    });

    this.client.on("error", (error) => {
      this.logger.error("Redis connection error:", error);
    });

    this.client.on("close", () => {
      this.logger.warn("Redis connection closed");
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log("Redis connected on module init");
    } catch (error) {
      this.logger.error("Failed to connect to Redis on module init", error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, stringValue, "EX", ttlSeconds);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      this.logger.error("Error flushing all keys:", error);
      return false;
    }
  }

  async cacheUser(
    userId: string,
    userData: any,
    ttlSeconds: number = 3600,
  ): Promise<boolean> {
    return this.set(`user:${userId}`, userData, ttlSeconds);
  }

  async getCachedUser<T>(userId: string): Promise<T | null> {
    return this.get<T>(`user:${userId}`);
  }

  async invalidateUserCache(userId: string): Promise<boolean> {
    return this.del(`user:${userId}`);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        return await this.client.del(...keys);
      }
      return 0;
    } catch (error) {
      this.logger.error(`Error invalidating pattern ${pattern}:`, error);
      return 0;
    }
  }

  async invalidateWorkplaceUsersCache(workplaceId: string): Promise<number> {
    try {
      const wpUsers = await this.wpUserRepo.find({
        where: { workplace: { id: workplaceId } },
        relations: ["user"],
      });

      let deletedCount = 0;
      for (const wpUser of wpUsers) {
        const deleted = await this.del(`workplaceUser:${wpUser.user.id}`);
        if (deleted) deletedCount++;
      }

      this.logger.log(
        `Invalidated cache for ${deletedCount} users in workplace ${workplaceId}`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error(
        `Error invalidating cache for workplace ${workplaceId}:`,
        error,
      );
      return 0;
    }
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
