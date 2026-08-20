const Redis = require('ioredis');
const logger = require('../utils/logger');
require('dotenv').config();

let redisClient = null;
let useFallback = false;

// In-memory fallback if Redis is not configured
const memoryCache = new Map();

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis connection failed permanently. Switching to in-memory fallback.');
          useFallback = true;
          return null;
        }
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error: ' + err.message);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis Cache successfully.');
      useFallback = false;
    });
  } catch (error) {
    logger.error('Failed to initialize Redis. Using in-memory fallback.');
    useFallback = true;
  }
} else {
  logger.info('No REDIS_URL provided. Using in-memory fallback cache.');
  useFallback = true;
}

// Wrapper for common Redis commands to seamlessly use fallback when needed
const cacheService = {
  async get(key) {
    if (useFallback) return memoryCache.get(key) || null;
    try {
      return await redisClient.get(key);
    } catch (e) {
      return memoryCache.get(key) || null;
    }
  },

  async set(key, value, expiryInSeconds = 3600) {
    if (useFallback) {
      memoryCache.set(key, value);
      // Auto-delete mock
      setTimeout(() => memoryCache.delete(key), expiryInSeconds * 1000);
      return 'OK';
    }
    try {
      return await redisClient.set(key, value, 'EX', expiryInSeconds);
    } catch (e) {
      memoryCache.set(key, value);
      return 'OK';
    }
  },

  async del(key) {
    if (useFallback) {
      memoryCache.delete(key);
      return 1;
    }
    try {
      return await redisClient.del(key);
    } catch (e) {
      memoryCache.delete(key);
      return 1;
    }
  }
};

/**
 * Factory to create a dedicated RedisStore instance with a unique prefix for express-rate-limit.
 * express-rate-limit strictly disallows sharing the same Store instance across multiple rate limiters.
 *
 * @param {string} prefix - Unique prefix for the rate limiter (e.g., 'api', 'tutor', 'voice')
 * @returns {RedisStore|undefined} - A new RedisStore instance or undefined (falls back to MemoryStore)
 */
function createRateLimitStore(prefix = 'global') {
  if (process.env.NODE_ENV === 'test' || !redisClient) return undefined;
  try {
    const RedisStore = require('rate-limit-redis').default || require('rate-limit-redis');
    return new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: `rl:${prefix}:`,
    });
  } catch (e) {
    logger.error(`Failed to initialize Redis rate-limit store for prefix '${prefix}': ` + e.message);
    return undefined;
  }
}

cacheService.redisClient = redisClient;
cacheService.createRateLimitStore = createRateLimitStore;
// Backwards compatibility: getter that returns a new store instance with a unique prefix if accessed directly
Object.defineProperty(cacheService, 'rateLimitStore', {
  get() {
    return createRateLimitStore('legacy');
  }
});
module.exports = cacheService;
