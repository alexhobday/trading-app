import { Hono } from 'hono';
import { portfolio, stocks, trades } from './api/index.js';

const api = new Hono();

// Mount API routes
api.route('/portfolio', portfolio);
api.route('/stocks', stocks);
api.route('/trades', trades);

export default api;