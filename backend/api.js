const soap = require('soap');
const xml2js = require('xml2js');
const promisify = require('es6-promisify');
const parseUrl = require('url').parse;
const helpers = require('./helpers');

const createSoapClient = promisify(soap.createClient);
const url = 'https://graphical.weather.gov/xml/SOAP_server/ndfdXMLserver.php?wsdl';

module.exports = async function api(cl) {
  const client = cl || await createSoapClient(url, {});

  async function cities(ctx) {
    const parseXML = promisify(xml2js.parseString);
    const getCityList = promisify(client.LatLonListCityNames);
    const response = await getCityList({ displayLevel: 1234 });
    const res = await parseXML(response.listLatLonOut.$value);
    const cityList = res.dwml.cityNameList[0].split('|');
    const coordinates = res.dwml.latLonList[0].split(' ');

    const result = cityList.map((city, index) => {
      const [latitude, longitude] = coordinates[index].split(',');
      return {
        city,
        latitude,
        longitude,
      };
    });

    ctx.body = result;
  }

  async function forecast(ctx) {
    const parseXML = promisify(xml2js.parseString);
    const getForecast = promisify(client.NDFDgenByDay);
    const { query: {
      latitude,
      longitude,
      start = new Date(),
      days = 1,
      unit = 'm',
      format = '24 hourly',
    } } = parseUrl(ctx.request.url, true);

    if (!latitude || !longitude) {
      ctx.throw('Missing query params. latitude and longitude are required', 422);
    }

    const response = await getForecast({
      latitude,
      longitude,
      startDate: start,
      numDays: days,
      Unit: unit,
      format,
    });

    const result = await parseXML(response.dwmlByDayOut.$value);

    ctx.body = helpers.denormalizeForecast(result.dwml.data[0], start, days);
  }

  return {
    cities,
    forecast,
  };
};
