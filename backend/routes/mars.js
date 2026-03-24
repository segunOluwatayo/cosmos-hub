const express = require('express');
const axios = require('axios');
const cacheMiddleware = require('../middleware/cache');

const router = express.Router();
const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_BASE = 'https://api.nasa.gov';

const VALID_ROVERS = ['curiosity', 'opportunity', 'spirit', 'perseverance'];

// Camera options per rover
const ROVER_CAMERAS = {
  curiosity: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'],
  opportunity: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
  spirit: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
  perseverance: ['EDL_RUCAM', 'EDL_RDCAM', 'EDL_DDCAM', 'EDL_PUCAM1', 'EDL_PUCAM2', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'MCZ_RIGHT', 'MCZ_LEFT', 'FRONT_HAZCAM_LEFT_A', 'FRONT_HAZCAM_RIGHT_A', 'REAR_HAZCAM_LEFT', 'REAR_HAZCAM_RIGHT', 'SKYCAM', 'SHERLOC_WATSON'],
};

/**
 * GET /api/mars/photos
 * Fetch Mars Rover photos
 *
 * Query params:
 *   rover      - curiosity | opportunity | spirit | perseverance (default: curiosity)
 *   sol        - Martian sol (default: 1000)
 *   earth_date - Earth date YYYY-MM-DD (alternative to sol)
 *   camera     - camera abbreviation (optional)
 *   page       - page number (default: 1)
 */
router.get('/photos', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const { rover = 'curiosity', sol, earth_date, camera, page = 1 } = req.query;
    const roverLower = rover.toLowerCase();

    if (!VALID_ROVERS.includes(roverLower)) {
      return res.status(400).json({
        error: 'Invalid rover',
        message: `Rover must be one of: ${VALID_ROVERS.join(', ')}`,
      });
    }

    const params = { api_key: NASA_API_KEY, page };
    if (camera && camera !== 'ALL') params.camera = camera;

    // Prefer earth_date; fall back to sol; default sol to 1000
    if (earth_date) {
      params.earth_date = earth_date;
    } else {
      params.sol = sol || 1000;
    }

    const { data } = await axios.get(
      `${NASA_BASE}/mars-photos/api/v1/rovers/${roverLower}/photos`,
      { params }
    );

    res.json({
      photos: data.photos,
      total: data.photos.length,
      rover: roverLower,
      cameras: ROVER_CAMERAS[roverLower] || [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/mars/rovers
 * Fetch manifest data for all rovers
 */
router.get('/rovers', cacheMiddleware(86400), async (req, res, next) => {
  try {
    const results = await Promise.allSettled(
      VALID_ROVERS.map((rover) =>
        axios
          .get(`${NASA_BASE}/mars-photos/api/v1/rovers/${rover}`, {
            params: { api_key: NASA_API_KEY },
          })
          .then((r) => ({
            name: r.data.rover.name,
            status: r.data.rover.status,
            launchDate: r.data.rover.launch_date,
            landingDate: r.data.rover.landing_date,
            maxSol: r.data.rover.max_sol,
            maxDate: r.data.rover.max_date,
            totalPhotos: r.data.rover.total_photos,
            cameras: r.data.rover.cameras,
          }))
      )
    );

    const rovers = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    res.json({ rovers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;