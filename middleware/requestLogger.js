const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      user: req.user?._id,
      ip: req.ip
    });
  });
  
  next();
};

module.exports = requestLogger;
