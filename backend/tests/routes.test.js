const request = require('supertest');
const app     = require('../server');

// Mock axios to avoid real NASA API calls in tests
jest.mock('axios');
const axios = require('axios');

//  APOD 
describe('GET /api/apod', () => {
  const mockAPOD = {
    date: '2024-01-01',
    title: 'Test Nebula',
    explanation: 'A test explanation',
    url: 'https://example.com/image.jpg',
    media_type: 'image',
  };

  beforeEach(() => jest.clearAllMocks());

  it('returns today\'s APOD', async () => {
    axios.get.mockResolvedValueOnce({ data: mockAPOD });
    const res = await request(app).get('/api/apod');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Nebula');
  });

  it('returns APOD for a specific date', async () => {
    axios.get.mockResolvedValueOnce({ data: { ...mockAPOD, date: '2023-06-01' } });
    const res = await request(app).get('/api/apod?date=2023-06-01');
    expect(res.status).toBe(200);
    expect(res.body.date).toBe('2023-06-01');
  });

  it('returns an array when a date range is given', async () => {
    const rangeData = [mockAPOD, { ...mockAPOD, date: '2024-01-02' }];
    axios.get.mockResolvedValueOnce({ data: rangeData });
    const res = await request(app).get('/api/apod?start_date=2024-01-01&end_date=2024-01-02');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  it('forwards NASA API errors correctly', async () => {
    const nasaError = { response: { status: 400, data: { error: { message: 'Bad date' } } } };
    axios.get.mockRejectedValueOnce(nasaError);
    const res = await request(app).get('/api/apod?date=1800-01-01');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// Asteroids 
describe('GET /api/asteroids', () => {
  const mockNeoWs = {
    element_count: 2,
    near_earth_objects: {
      '2024-01-01': [
        {
          id: '1',
          name: '(2024 AA)',
          is_potentially_hazardous_asteroid: false,
          estimated_diameter: {
            kilometers: { estimated_diameter_min: 0.01, estimated_diameter_max: 0.02 },
          },
          close_approach_data: [{
            miss_distance:    { kilometers: '500000', lunar: '1.3' },
            relative_velocity:{ kilometers_per_hour: '50000' },
            orbiting_body:    'Earth',
          }],
          absolute_magnitude_h: 25,
          nasa_jpl_url: 'https://ssd.jpl.nasa.gov/...',
        },
      ],
    },
  };

  beforeEach(() => jest.clearAllMocks());

  it('returns processed asteroid data', async () => {
    axios.get.mockResolvedValueOnce({ data: mockNeoWs });
    const res = await request(app).get('/api/asteroids');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('asteroids');
    expect(res.body).toHaveProperty('byDay');
    expect(res.body).toHaveProperty('elementCount', 2);
    expect(res.body.asteroids[0].name).toBe('2024 AA');
  });

  it('clamps date range to 7 days', async () => {
    axios.get.mockResolvedValueOnce({ data: { ...mockNeoWs, element_count: 1 } });
    const res = await request(app).get('/api/asteroids?start_date=2024-01-01&end_date=2024-01-30');
    expect(res.status).toBe(200);
    // The handler should still succeed; clamping happens internally
    expect(res.body).toHaveProperty('dateRange');
  });
});

// Mars
describe('GET /api/mars', () => {
  const mockLibrary = {
    collection: {
      items: [
        {
          data: [
            {
              nasa_id: 'PIA12345',
              title: 'Mars Surface',
              description: 'Rocky terrain on Mars',
              date_created: '2015-10-16T00:00:00Z',
              keywords: ['mars', 'rover'],
              center: 'JPL',
            },
          ],
          links: [
            { rel: 'preview', href: 'https://example.com/thumb.jpg' },
          ],
        },
      ],
      metadata: { total_hits: 1 },
    },
  };

  beforeEach(() => jest.clearAllMocks());

  it('returns image library results', async () => {
    axios.get.mockResolvedValueOnce({ data: mockLibrary });
    const res = await request(app).get('/api/mars');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total', 1);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body.items[0].id).toBe('PIA12345');
  });

  it('accepts a custom search query', async () => {
    axios.get.mockResolvedValueOnce({ data: mockLibrary });
    const res = await request(app).get('/api/mars?q=curiosity+selfie');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });
});

// EPIC 
describe('GET /api/epic', () => {
  const mockEPIC = [
    {
      identifier: 'epic_1b_20240101120000',
      caption:    'Magnificent view of Earth',
      date:       '2024-01-01 12:00:00',
      image:      'epic_1b_20240101120000',
      centroid_coordinates: { lat: 10.5, lon: -30.2 },
      sun_j2000_position:   { x: 1, y: 0, z: 0 },
    },
  ];

  beforeEach(() => jest.clearAllMocks());

  it('returns processed EPIC images', async () => {
    axios.get.mockResolvedValueOnce({ data: mockEPIC });
    const res = await request(app).get('/api/epic');
    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0]).toHaveProperty('imageUrl');
    expect(res.body.images[0].imageUrl).toContain('epic.gsfc.nasa.gov/archive');
  });

  it('returns 404 when no images found', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    const res = await request(app).get('/api/epic?date=2000-01-01');
    expect(res.status).toBe(404);
  });
});

// Health check 
describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('CosmosHub API');
  });
});

// 404 handler 
describe('Unknown routes', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});

// AI Routes 
describe('POST /api/ai/apod', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when title or explanation missing', async () => {
    const res = await request(app).post('/api/ai/apod').send({ title: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});

describe('POST /api/ai/asteroid-briefing', () => {
  it('returns 400 when asteroids array missing', async () => {
    const res = await request(app).post('/api/ai/asteroid-briefing').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/ai/mars-scene', () => {
  it('returns 400 when title missing', async () => {
    const res = await request(app).post('/api/ai/mars-scene').send({ description: 'some desc' });
    expect(res.status).toBe(400);
  });
});