export default {
  host: process.env.HOST || 'localhost',
  isBrowser: typeof window !== 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  port: Number(process.env.PORT || 1234),
};
