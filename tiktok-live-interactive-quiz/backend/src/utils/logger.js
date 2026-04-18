const isDev = process.env.NODE_ENV !== 'production';

const formatLog = (level, msg, data = {}) =>
  JSON.stringify({ time: new Date().toISOString(), level, msg, ...data });

const logger = {
  info: (msg, data) => console.log(formatLog('info', msg, data)),
  error: (msg, data) => console.error(formatLog('error', msg, data)),
  warn: (msg, data) => console.warn(formatLog('warn', msg, data)),
  debug: (msg, data) => {
    if (isDev) console.log(formatLog('debug', msg, data));
  },
};

module.exports = logger;
