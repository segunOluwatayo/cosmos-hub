const NodeCache = require('node-cache');

// Global cache instance shared across all routes
const cache = new NodeCache({
  stdTTL: 600,        // default TTL: 10 minutes
  checkperiod: 120,   // check for expired keys every 2 minutes
  useClones: false,   // faster here we don't mutate cached objects
});

/**
 * Express middleware factory for in-memory response caching.
 *
 * @param {number} ttlSeconds - How long to cache the response (in seconds).
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/', cacheMiddleware(3600), handler); // cache for 1 hour
 */
const cacheMiddleware = (ttlSeconds) => (req, res, next) => {
  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached !== undefined) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  // Override res.json to intercept and cache the response body
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      cache.set(key, body, ttlSeconds);
    }
    res.setHeader('X-Cache', 'MISS');
    return originalJson(body);
  };

  next();
};

module.exports = cacheMiddleware;