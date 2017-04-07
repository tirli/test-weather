import { encode } from 'querystring';

export function getCities() {
  return fetch('/api/cities').then(r => r.json());
}

export function getForecast(options) {
  return fetch(`/api/forecast?${encode(options)}`).then(r => r.json());
}
