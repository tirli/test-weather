const fs = require('fs');
const path = require('path');
const { encode } = require('querystring');

const createApi = require('../api');

test('Should return cities list in json from xml data', async () => {
  const citiesXML = fs.readFileSync(path.join(__dirname, '/fixtures/cities.xml'));
  const client = {
    LatLonListCityNames: jest.fn((options, cb) => {
      cb(null, { listLatLonOut: { $value: citiesXML } });
    }),
  };
  const ctx = { body: '' };

  const api = await createApi(client);
  await api.cities(ctx);
  expect(ctx.body).toMatchSnapshot();
});

test('Should return forecast in json from xml data', async () => {
  const forecastXML = fs.readFileSync(path.join(__dirname, '/fixtures/forecast.xml'));
  const normalizedForecast = fs.readFileSync(path.join(__dirname, '/fixtures/normalizedForecast.json'));

  const client = {
    NDFDgenByDay: jest.fn((options, cb) => {
      cb(null, { dwmlByDayOut: { $value: forecastXML } });
    }),
  };
  const query = {
    latitude: 25.80,
    longitude: 80.28,
    start: '2017-04-07T15:04:55.535Z',
    days: '1',
  };
  const ctx = {
    body: '',
    request: { url: `http://example.com/forecast?${encode(query)}` },
  };

  const helpers = require('../helpers'); // eslint-disable-line
  helpers.denormalizeForecast = jest.fn(() => 'denormalized json');
  const api = await createApi(client);
  await api.forecast(ctx);
  expect(helpers.denormalizeForecast).toBeCalledWith(
    JSON.parse(normalizedForecast.toString()),
    query.start,
    query.days,
  );
  expect(ctx.body).toBe('denormalized json');
});

test('Should return error for missing query', async () => {
  const client = {};
  const query = { latitude: 25.80 };
  const ctx = {
    body: '',
    throw: (message) => { throw new Error(message); },
    request: { url: `http://example.com/forecast?${encode(query)}` },
  };

  const api = await createApi(client);
  return api.forecast(ctx).catch((err) => {
    expect(err).toMatchSnapshot();
  });
});
