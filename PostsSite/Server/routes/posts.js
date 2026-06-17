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
    console.error('getPosts error:', error);
    sendResponse(res, { error: 'Internal Server Error', message: 'Unable to retrieve data' }, 500, 'application/json');
  }
}

export function createPost(req, res) {
  let body = '';

  req.on('error', (error) => {
    console.error('Request stream error:', error);
    sendResponse(res, { error: 'Bad Request', message: 'Failed to read request body' }, 400, 'application/json');
  });

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const post = JSON.parse(body);
      const savedPost = await addPost(post);
      sendResponse(res, savedPost, 201, 'application/json');
    } catch (error) {
      console.error('createPost error:', error);
      const isJsonError = error instanceof SyntaxError;
      sendResponse(
        res,
        {
          error: isJsonError ? 'Bad Request' : 'Internal Server Error',
          message: isJsonError ? 'Invalid JSON body' : 'Unable to create new post',
        },
        isJsonError ? 400 : 500,
        'application/json'
      );
    }
  });
}
