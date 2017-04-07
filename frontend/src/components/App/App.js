import React from 'react';
import { compose, lifecycle, withProps, withState, withHandlers, renderComponent, branch } from 'recompose';

import * as api from '../../api';
import Search from '../Search/Search';
import Forecast from '../Forecast/Forecast';

import './App.css';

const withAppCitiesState = withState('cities', 'handleCities', []);
const withAppForecastState = withState('forecast', 'handleForecast', []);
const withAppLoadingState = withState('loading', 'handleLoading', false);
const withAppCityState = withState('city', 'handleCity', {});

const withAppProps = withProps(props => ({
  getCities: api.getCities,
  getForecast: api.getForecast,
}));

const withAppHandlers = withHandlers({
  onSelect: props => async city => {
    props.handleLoading(true);
    props.handleCity(city);
    const forecast = await props.getForecast(city);
    props.handleLoading(false);
    props.handleForecast(forecast);
  }
})

const withLifecycle = lifecycle({
  async componentDidMount() {
    const { getCities, handleCities } = this.props;

    const cities = await getCities();
    handleCities(cities);
  }
})

const Weather = branch(
  ({ loading }) => !loading,
  renderComponent(Forecast),
  renderComponent(() => <div className="spinner" />),
)();

function App({ cities, onSelect, forecast, loading, city }) {
  return (
    <main className="app">
      <Search cities={cities} onSelect={onSelect}/>
      <div className="city-name">{city.city}</div>
      <Weather className="forecast-area" forecast={forecast} loading={loading} />
    </main>
  );
}

export default compose(
  withAppProps,
  withAppCitiesState,
  withAppLoadingState,
  withAppForecastState,
  withAppCityState,
  withAppHandlers,
  withLifecycle,
)(App);
