const express = require('express');
const axios = require('axios');
const cacheMiddleware = require('../middleware/cache');

const router = express.Router();
const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_BASE = 'https://api.nasa.gov';

// Returns today's date as YYYY-MM-DD 
const today = () => new Date().toISOString().split('T')[0];

//Returns a date N days from a base date as YYYY-MM-DD 
const offsetDate = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Flattens and enriches the raw Neows feed into a flat array of asteroid objects.
const processAsteroids = (rawData) => {
  const asteroids = [];

  Object.entries(rawData.near_earth_objects).forEach(([date, objects]) => {
    objects.forEach((asteroid) => {
      const approach = asteroid.close_approach_data[0] || {};
      asteroids.push({
        id: asteroid.id,
        name: asteroid.name.replace(/[()]/g, '').trim(),
        date,
        isHazardous: asteroid.is_potentially_hazardous_asteroid,
        diameterMin: +asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(4),
        diameterMax: +asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(4),
        // Miss distance in millions of km for readable chart values
        missDistanceKm: Math.round(parseFloat(approach.miss_distance?.kilometers || 0)),
        missDistanceLunar: parseFloat(approach.miss_distance?.lunar || 0).toFixed(1),
        velocityKph: Math.round(parseFloat(approach.relative_velocity?.kilometers_per_hour || 0)),
        orbitingBody: approach.orbiting_body || 'Earth',
        magnitude: asteroid.absolute_magnitude_h,
        nasaUrl: asteroid.nasa_jpl_url,
      });
    });
  });

  // Sort chronologically
  return asteroids.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * GET /api/asteroids
 * Near Earth Objects feed
 *
 * Query params:
 *   start_date - YYYY-MM-DD (defaults to today)
 *   end_date   - YYYY-MM-DD (defaults to today + 7 days, max 7-day window)
 */
router.get('/', cacheMiddleware(1800), async (req, res, next) => {
  try {
    const startDate = req.query.start_date || today();
    let endDate = req.query.end_date || offsetDate(startDate, 6);

    // NASA NeoWs enforces a maximum 7-day window
    const diffDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      endDate = offsetDate(startDate, 6);
    }

    const { data } = await axios.get(`${NASA_BASE}/neo/rest/v1/feed`, {
      params: {
        api_key: NASA_API_KEY,
        start_date: startDate,
        end_date: endDate,
      },
    });

    const asteroids = processAsteroids(data);

    // Build per day count for bar chart
    const byDay = {};
    asteroids.forEach(({ date, isHazardous }) => {
      if (!byDay[date]) byDay[date] = { date, total: 0, hazardous: 0 };
      byDay[date].total += 1;
      if (isHazardous) byDay[date].hazardous += 1;
    });

    res.json({
      elementCount: data.element_count,
      hazardousCount: asteroids.filter((a) => a.isHazardous).length,
      dateRange: { start: startDate, end: endDate },
      asteroids,
      byDay: Object.values(byDay),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;