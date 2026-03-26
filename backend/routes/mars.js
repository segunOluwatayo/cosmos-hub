const express = require('express');
const axios = require('axios');
const cacheMiddleware = require('../middleware/cache');

const router = express.Router();
// NASA Image and Video Library — no API key required, stable service.
const IMAGE_LIB_BASE = 'https://images-api.nasa.gov';

/**
 * GET /api/mars
 * Search NASA's Image and Video Library for Mars imagery.
 *
 * Query params:
 *   q    - search query (default: "mars rover")
 *   page - page number  (default: 1)
 */
router.get('/', cacheMiddleware(1800), async (req, res, next) => {
  try {
    const q    = req.query.q    || 'mars rover';
    const page = parseInt(req.query.page, 10) || 1;

    const { data } = await axios.get(`${IMAGE_LIB_BASE}/search`, {
      params: { q, media_type: 'image', page },
    });

    const collection = data.collection;
    const items = (collection.items || []).map((item) => {
      const meta  = item.data?.[0] || {};
      const thumb = item.links?.find((l) => l.rel === 'preview')?.href || '';
      const full  = item.links?.find((l) => l.rel === 'alternate')?.href || thumb;
      return {
        id:          meta.nasa_id,
        title:       meta.title,
        description: meta.description,
        date:        meta.date_created?.split('T')[0] || '',
        keywords:    meta.keywords || [],
        center:      meta.center  || '',
        imageUrl:    full,
        thumbUrl:    thumb,
      };
    });

    res.json({
      items,
      total: collection.metadata?.total_hits || 0,
      page,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
