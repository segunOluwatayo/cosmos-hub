const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');
const cacheMiddleware = require('../middleware/cache');

const router = express.Router();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'AI rate limit reached. Please wait a minute.' },
});
router.use(aiLimiter);

/**
 * POST /api/ai/apod
 * Generate an AI analysis of an Astronomy Picture of the Day
 */
router.post('/apod', cacheMiddleware(86400), async (req, res, next) => {
  try {
    const { title, explanation, date, mediaType } = req.body;
    if (!title || !explanation) {
      return res.status(400).json({ error: 'title and explanation are required' });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are a NASA mission analyst writing a classified briefing document.
        
Analyze this Astronomy Picture of the Day in exactly 3 sentences.
Style: authoritative, precise, slightly poetic.
Avoid repeating the explanation verbatim. Add scientific context and wonder.

TITLE: ${title}
DATE: ${date}
TYPE: ${mediaType === 'video' ? 'Video recording' : 'Photograph'}
NASA EXPLANATION: ${explanation}

Write only the 3-sentence analysis, no preamble.`,
      }],
    });

    res.json({ analysis: message.content[0].text });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/asteroid-briefing
 * Generate a threat briefing for a set of near-Earth asteroids
 */
router.post('/asteroid-briefing', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const { asteroids, dateRange } = req.body;
    if (!asteroids || !asteroids.length) {
      return res.status(400).json({ error: 'asteroids array is required' });
    }

    const hazardous = asteroids.filter(a => a.isHazardous);
    const largest   = [...asteroids].sort((a, b) => b.diameterMax - a.diameterMax)[0];
    const closest   = [...asteroids].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0];

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 350,
      messages: [{
        role: 'user',
        content: `You are a NASA Planetary Defense Coordination Office analyst. Write a concise classified threat briefing.

OBSERVATION WINDOW: ${dateRange?.start} to ${dateRange?.end}
TOTAL OBJECTS TRACKED: ${asteroids.length}
POTENTIALLY HAZARDOUS: ${hazardous.length}
LARGEST OBJECT: ${largest?.name} (${largest?.diameterMax.toFixed(3)} km diameter)
CLOSEST APPROACH: ${closest?.name} at ${(closest?.missDistanceKm / 1000000).toFixed(2)}M km
FASTEST: ${asteroids.sort((a,b) => b.velocityKph - a.velocityKph)[0]?.name} at ${asteroids.sort((a,b) => b.velocityKph - a.velocityKph)[0]?.velocityKph.toLocaleString()} km/h

Write a 3 sentence classified threat assessment. Use the terminology of an actual NASA briefing document. Assess overall threat level (LOW/MODERATE/ELEVATED). No preamble.`,
      }],
    });

    res.json({ briefing: message.content[0].text });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/mars-scene
 * Describe what a Mars rover camera is seeing
 */
router.post('/mars-scene', cacheMiddleware(86400), async (req, res, next) => {
  try {
    const { roverName, cameraFullName, sol, earthDate, imageUrl } = req.body;
    if (!roverName || !sol) {
      return res.status(400).json({ error: 'roverName and sol are required' });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 250,
      messages: [{
        role: 'user',
        content: `You are a NASA rover mission analyst writing a geological field observation log.

ROVER: ${roverName}
CAMERA: ${cameraFullName}
MARTIAN SOL: ${sol}
EARTH DATE: ${earthDate}

Write a 2 sentence field observation log entry describing what this rover camera might be capturing on Mars at this point in the mission. Reference the camera type (hazard avoidance, navigation, science instrument, etc.) to infer what kind of data is being gathered. Be scientifically grounded and evocative. No preamble.`,
      }],
    });

    res.json({ description: message.content[0].text });
  } catch (err) {
    next(err);
  }
});

module.exports = router;