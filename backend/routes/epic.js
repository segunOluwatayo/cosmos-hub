const express = require('express');
const axios = require('axios');
const cacheMiddleware = require('../middleware/cache');

const router = express.Router();
// Use epic.gsfc.nasa.gov directly — the api.nasa.gov/EPIC proxy is unreliable.
// The GSFC endpoint requires no API key.
const EPIC_BASE = 'https://epic.gsfc.nasa.gov';

// Builds the full image URL for an EPIC image.
const buildImageUrl = (imageName, dateString) => {
  const [year, month, day] = dateString.split(' ')[0].split('-');
  return `${EPIC_BASE}/archive/natural/${year}/${month}/${day}/png/${imageName}.png`;
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
      ? `${EPIC_BASE}/api/natural/date/${date}`
      : `${EPIC_BASE}/api/natural`;

    const { data } = await axios.get(endpoint);

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
    const { data } = await axios.get(`${EPIC_BASE}/api/natural/all`);

    // GSFC returns dates newest-first; take the 30 most recent
    const dates = data
      .map((d) => d.date)
      .slice(0, 30);

    res.json({ dates });
  } catch (err) {
    next(err);
  }
});

module.exports = router;