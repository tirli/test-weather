import React from 'react';
import { compose, renderComponent, branch, withState, withHandlers } from 'recompose';
import format from 'date-fns/format';
import cx from 'classnames';

import './Forecast.css';

function detectHazard(forecast) {
  const hazards = {};
  forecast.forEach((f, index) => {
    if(!f.hazard) return;
    if(!hazards[f.hazard.hazardCode]) hazards[f.hazard.hazardCode] = {};

    const { start, end } = hazards[f.hazard.hazardCode]
    hazards[f.hazard.hazardCode].start = start > index || !start
      ? index
      : start;
    hazards[f.hazard.hazardCode].end = end < index || !end
      ? index
      : end;

    Object.assign(hazards[f.hazard.hazardCode], f.hazard);
  });

  return Object.values(hazards).map(h =>
    <a href={h.url} key={h.hazardCode} className="hazard-link">
      <br/>{h.phenomena}, {h.hazardType}. {h.significance} from {h.start} till {h.end}
    </a>
  );
}

function ExtendedDayForecast({ className, forecast, onSelect }) {
  const morning = forecast.forecast[6];
  const evening = forecast.forecast[18];
  const weather = morning.weather || evening.weather;
  let weatherAdditional = '';

  if (weather.additional.length) {
    const str = weather.additional.map(add =>
      `${add.additive || ''} ${add.coverage} ${add.intensity} ${add['weather-type']}`
    ).join(' ').trim();
    weatherAdditional = str[0].toUpperCase() + str.substring(1);
  }
  const hazard = detectHazard(forecast.forecast);

  return (
    <li className={cx('forecast-item', 'forecast-active', className)} onClick={onSelect}>
      <div className="forecast-left">
        <img src={morning.icon || evening.icon} alt="Weather icon"/>
      </div>
      <div className="forecast-right">
        <strong className="forecast-date">{format(forecast.date, 'ddd, MMM Do')}</strong>
        <div className="forecast-temperature">
          {morning.temperature.max || evening.temperature.max} &#8451;
          &nbsp;|&nbsp;
          {morning.temperature.min || evening.temperature.min} &#8451;
        </div>
        <div>
          {weather.summary}
          <br />
          <sup> {weatherAdditional} </sup>
        </div>
        <div className="forecast-precipitation">
          Precipitation: <br/>
          {morning.precipitation || 0} %
          &nbsp;|&nbsp;
          {evening.precipitation || 0} %
        </div>
        <div>
          Hazard:
          {hazard.length ? hazard : 'no'}
        </div>
      </div>
    </li>
  );
}

function DayForecast({ className, forecast, onSelect }) {
  const morning = forecast.forecast[6];
  const evening = forecast.forecast[18];
  const weather = morning.weather || evening.weather;

  return (
    <li className={cx('forecast-item', className)} onClick={onSelect}>
      <div className="forecast-left">
        <img src={morning.icon || evening.icon} alt="Weather icon"/>
      </div>
      <div className="forecast-right">
        <strong className="forecast-date">{format(forecast.date, 'ddd, MMM Do')}</strong>
        <div className="forecast-temperature">
          {morning.temperature.max || evening.temperature.max} &#8451;
          &nbsp;|&nbsp;
          {morning.temperature.min || evening.temperature.min} &#8451;
        </div>
        <div>{weather.summary} </div>
      </div>
    </li>
  );
}

const Day = branch(
  ({ isActive }) => isActive,
  renderComponent(ExtendedDayForecast),
  renderComponent(DayForecast),
)();

const withForecastState = withState('activeDay', 'handleActiveDay', 0);
const withForecastHandlers = withHandlers({
  handleActiveDay: (props) => (index) => () => props.handleActiveDay(index),
})

function Forecast({ className, forecast, activeDay, handleActiveDay}) {
  return(
    <ol className={cx('forecast-list', className)}>
      {forecast.map((f, index) =>
        <Day
          key={f.date}
          forecast={f}
          isActive={index === activeDay}
          onSelect={handleActiveDay(index)}
        />
      )}
    </ol>
  );
}

export default compose(
  withForecastState,
  withForecastHandlers,
)(Forecast);
