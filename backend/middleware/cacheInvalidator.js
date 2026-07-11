import { dashboardCache } from '../utils/cache.js';

export const invalidateOnWrite = (req, res, next) => {
  // Listen for the response finish event to ensure cache invalidation happens only on successful requests
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
      if (isWrite && req.storeId) {
        dashboardCache.invalidate(req.storeId);
      }
    }
  });
  next();
};
