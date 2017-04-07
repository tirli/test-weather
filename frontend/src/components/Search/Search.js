import React from 'react';
import cx from 'classnames';
import { compose, withState, withHandlers, withProps } from 'recompose';

import Results from './Results';
import './Search.css';

const withSearchState = withState('query', 'onQueryChange', '');
const withSearchHandlers = withHandlers({
  handleChange: props => event => props.onQueryChange(event.target.value),
  onSelect: props => city => {
    props.onQueryChange('');
    props.onSelect(city);
  }
});
const withSearchProps = withProps(props => ({
  cities: props.cities.filter(c => c.city.toLowerCase().includes(props.query.toLowerCase())),
}));

function Search({ className, cities, handleChange, query, onSelect }) {
  return (
    <section className={cx('search', className)}>
      <input type="text" className="search-input" value={query} onChange={handleChange} placeholder="Search" />
      <Results queryLength={query.length} cities={cities} onSelect={onSelect} className="results-area" />
    </section>
  );
}

export default compose(
  withSearchState,
  withSearchHandlers,
  withSearchProps,
)(Search);
