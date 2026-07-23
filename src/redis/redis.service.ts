import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) { }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }


  async set(
    key: string,
    value: unknown,
    ttlInSeconds?: number,
  ): Promise<void> {

    const json = JSON.stringify(value);

    if (ttlInSeconds) {
      await this.redis.set(
        key,
        json,
        'EX',
        ttlInSeconds,
      );
      return;
    }

    await this.redis.set(key, json);
  }

  async clearByPattern(pattern: string) {

    const keys =
      await this.redis.keys(pattern);


    if (keys.length) {

      await this.redis.del(
        ...keys
      );

    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }


  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }
}