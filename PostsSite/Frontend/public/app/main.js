import { getPosts } from './api.js';
import { initCardResize } from './dom.js';

initCardResize();

console.log('getPosts = ', await getPosts());
