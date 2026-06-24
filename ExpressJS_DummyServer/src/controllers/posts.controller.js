import { readPosts } from "../data/db.js";

export const getPosts = async (req, res) => {
  res.json(await readPosts());
};
