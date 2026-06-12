import { data } from '../data/data.js';

export default async function getDataFromDB() {
  return data; // wrapped in a resolved promise
}
