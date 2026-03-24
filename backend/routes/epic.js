const express = require('express');
const axios = require('axios');
const cacheMiddleware = require('../middleware/cache');

const router = express.Router();
const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_BASE = 'https://api.nasa.gov';

// Builds the full image URL for an EPIC image.
const buildImageUrl = (imageName, dateString) => {
  const [year, month, day] = dateString.split(' ')[0].split('-');
  return `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${imageName}.png?api_key=${NASA_API_KEY}`;
};

/**
 * GET /api/epic
 * Fetch Earth imagery from the DSCOVR satellite's EPIC camera
 *
 * Query params:
 *   date - YYYY-MM-DD (optional, defaults to latest available)
 */
router.get('/', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const { date } = req.query;
    const endpoint = date
      ? `${NASA_BASE}/EPIC/api/natural/date/${date}`
      : `${NASA_BASE}/EPIC/api/natural/latest`;

    const { data } = await axios.get(endpoint, {
      params: { api_key: NASA_API_KEY },
    });

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'No images found',
        message: date ? `No EPIC imagery available for ${date}` : 'No recent EPIC imagery available',
      });
    }

    const images = data.map((img) => ({
      identifier: img.identifier,
      caption: img.caption,
      date: img.date,
      centroidCoordinates: img.centroid_coordinates,
      sunJ2000Position: img.sun_j2000_position,
      imageUrl: buildImageUrl(img.image, img.date),
      // Thumbnail using JPEG version
      thumbUrl: buildImageUrl(img.image, img.date).replace('/png/', '/thumbs/').replace('.png', '.jpg'),
    }));

    res.json({ images, date: images[0]?.date?.split(' ')[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/epic/dates
 * Returns the last 30 dates that have available EPIC imagery
 */
router.get('/dates', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const { data } = await axios.get(`${NASA_BASE}/EPIC/api/natural/all`, {
      params: { api_key: NASA_API_KEY },
    });

    // Return the 30 most recent dates in descending order
    const dates = data
      .map((d) => d.date)
      .slice(-30)
      .reverse();

    res.json({ dates });
  } catch (err) {
    next(err);
  }
});

module.exports = router;