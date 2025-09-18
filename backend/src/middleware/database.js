export const databaseMiddleware = async (c, next) => {
  // Attach database to context
  c.set('db', c.env.DB);
  await next();
};