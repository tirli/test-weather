const fs = require('fs');
const path = require('path');

const { denormalizeForecast } = require('../helpers');

const normalizedForecast = fs.readFileSync(path.join(__dirname, '/fixtures/normalizedForecast.json'));
const forecast = JSON.parse(normalizedForecast);
const days = 1;
const date = '2017-04-07T15:04:55.535Z';

test('Helper "denormalizeForecast" fits needed format', () => {
  expect(denormalizeForecast(forecast, date, days)).toMatchSnapshot();
});
