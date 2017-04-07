const get = require('lodash.get');
const isBefore = require('date-fns/is_before');
const isAfter = require('date-fns/is_after');
const addHours = require('date-fns/add_hours');
const addDays = require('date-fns/add_days');
const startOfDay = require('date-fns/start_of_day');

const NO_DATA = null;

function getIndexByTimeAndLayout(timeLayout, time, layoutKey) {
  const layout = timeLayout.find(l => get(l, 'layout-key', []).includes(layoutKey));
  const startDates = get(layout, 'start-valid-time');
  const endDates = get(layout, 'end-valid-time');

  for (let i = 0; i < startDates.length; i += 1) {
    const start = typeof startDates[i] === 'string' ? startDates[i] : get(startDates, `${i}._`);
    const end = typeof endDates[i] === 'string' ? endDates[i] : get(endDates, `${i}._`);

    if (isAfter(time, start) && isBefore(time, end)) {
      return i;
    }
  }

  return -1;
}

function getExtreme(type) {
  return function getTemperature(temperature, timeLayout, time) {
    const extreme = temperature.find(t => t.$.type === type);
    const index = getIndexByTimeAndLayout(timeLayout, time, get(extreme, '$.time-layout'));
    const result = get(extreme, `value[${index}]`);
    return typeof result === 'string' ? result : NO_DATA;
  };
}

const getMinTemperature = getExtreme('minimum');
const getMaxTemperature = getExtreme('maximum');

function getPercipitation(precipitation, timeLayout, time) {
  const index = getIndexByTimeAndLayout(timeLayout, time, get(precipitation, '$.time-layout'));
  const result = get(precipitation, `value[${index}]`);
  return typeof result === 'string' ? result : NO_DATA;
}

function getWeather(weather, timeLayout, time) {
  const index = getIndexByTimeAndLayout(timeLayout, time, get(weather, '$.time-layout'));
  const weatherCondition = get(weather, `weather-conditions[${index}]`);

  if (!weatherCondition || !get(weatherCondition, '$.weather-summary')) return NO_DATA;

  const added = get(weatherCondition, 'value', []);
  console.log(weatherCondition);
  const additional = added.map(w => console.log(w) || w.$);

  return {
    summary: get(weatherCondition, '$.weather-summary'),
    additional,
  };
}

function getIcon(icons, timeLayout, time) {
  const index = getIndexByTimeAndLayout(timeLayout, time, get(icons, '$.time-layout'));
  const icon = get(icons, `icon-link[${index}]`);
  return typeof icon === 'string' ? icon : NO_DATA;
}

function getHazard(hazards, timeLayout, time) {
  const index = getIndexByTimeAndLayout(timeLayout, time, get(hazards, '$.time-layout'));
  const hazard = get(hazards, `hazard-conditions[${index}].hazard[0]`);

  if (!hazard) return NO_DATA;

  return Object.assign(hazard.$, { url: hazard.hazardTextURL[0] });
}

function getWeatherByTime(data, time) {
  const timeLayout = get(data, 'time-layout', []);
  const temperature = get(data, 'parameters[0].temperature');
  const precipitation = get(data, 'parameters[0].probability-of-precipitation[0]');
  const weather = get(data, 'parameters[0].weather[0]');
  const icons = get(data, 'parameters[0].conditions-icon[0]');
  const hazards = get(data, 'parameters[0].hazards[0]');

  return {
    temperature: {
      min: getMinTemperature(temperature, timeLayout, time),
      max: getMaxTemperature(temperature, timeLayout, time),
    },
    precipitation: getPercipitation(precipitation, timeLayout, time),
    weather: getWeather(weather, timeLayout, time),
    icon: getIcon(icons, timeLayout, time),
    hazard: getHazard(hazards, timeLayout, time),
  };
}

function denormalizeForecast(data, start, days) {
  const forecast = [];
  for (let i = 0; i < days; i += 1) {
    const day = {
      date: addDays(startOfDay(start), i),
      forecast: [],
    };
    for (let j = 0; j < 24; j += 1) {
      const time = addHours(day.date, j);
      day.forecast.push(getWeatherByTime(data, time));
    }
    forecast.push(day);
  }

  return forecast;
}

module.exports = {
  denormalizeForecast,
};
