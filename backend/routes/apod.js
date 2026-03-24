const express = require('express');
const axios = require('axios');
const cacheMiddleware = require('../middleware/cache');

const router = express.Router();
const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_BASE = 'https://api.nasa.gov';

/**
 * Astronomy Picture of the Day
 *
 * Query params:
 *   date        - specific date (YYYY-MM-DD), defaults to today
 *   start_date  - start of date range (YYYY-MM-DD)
 *   end_date    - end of date range (YYYY-MM-DD)
 *   count       - return N random APODs
 */
router.get('/', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const { date, start_date, end_date, count } = req.query;
    const params = { api_key: NASA_API_KEY };

    if (date) params.date = date;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    if (count) params.count = Math.min(parseInt(count, 10), 20); // cap at 20

    const { data } = await axios.get(`${NASA_BASE}/planetary/apod`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;