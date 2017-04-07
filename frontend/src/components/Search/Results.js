import React from 'react';
import cx from 'classnames';
import { compose, branch, renderComponent, withHandlers, renderNothing } from 'recompose';

import './Results.css'

const NoData = ({ className }) => <div className={cx(className)}>No data for this query</div>;

const hasData = branch(
  ({ cities, queryLength }) => queryLength >= 2 && !cities.length,
  renderComponent(NoData),
);

const hasQuery = branch(
  ({ queryLength }) => queryLength < 2,
  renderNothing,
);

const withResultsHandlers = withHandlers({
  onSelect: props => city => () => props.onSelect(city),
});

function Results({ className, cities, onSelect }) {
  return (
    <ul className={cx('result-list', className)}>
      { cities.map(c => <li key={c.city} onClick={onSelect(c)} className="result-item">{c.city}</li>) }
    </ul>
  );
}

export default compose(
  hasData,
  hasQuery,
  withResultsHandlers
)(Results);
