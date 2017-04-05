const get = require('lodash.get');
const isBefore = require('date-fns/is_before');
const isAfter = require('date-fns/is_after');

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

function getTemperature(temperature, timeLayout, time) {
  const min = temperature.find(t => t.$.type === 'minimum');
  const max = temperature.find(t => t.$.type === 'maximum');

  const minValueIndex = getIndexByTimeAndLayout(timeLayout, time, get(min, '$.time-layout'));
  const maxValueIndex = getIndexByTimeAndLayout(timeLayout, time, get(max, '$.time-layout'));

  return {
    min: min.value[minValueIndex],
    max: max.value[maxValueIndex],
  };
}

function getWeatherByTime(data, time) {
  const timeLayout = get(data, 'time-layout', []);
  const temperature = get(data, 'parameters[0].temperature');

  return {
    temperature: getTemperature(temperature, timeLayout, time),
    // precipitation,
    // weather,
    // icon,
    // hazard,
  };
}

module.exports = {
  getWeatherByTime,
};
