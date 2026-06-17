import { readPosts, addPost } from "../data/store.js";

export function sendResponse(res, data, statusCode, contentType) {
  res.setHeader('Content-Type', contentType);
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export async function getPosts(res) {
  try {
    const posts = await readPosts();
    sendResponse(res, posts, 200, 'application/json');
  } catch (error) {
    const errorMessage = {
      error: 'Internal Server Error',
      message: 'Unable to retrieve data'
    };
    sendResponse(res, errorMessage, 500, 'application/json');
  }
}
