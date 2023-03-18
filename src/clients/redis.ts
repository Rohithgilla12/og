import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: "https://faithful-mouse-33388.upstash.io",
  token:
    "AYJsACQgNTk4NGQ4MGUtY2NjZC00YWM2LTliMDYtNTFmNjIxNjYwNzBiYzkzMDJkOTg3MmIwNDBiZGIxYWQxMGZhZmEyMDU3OWU=",
});

type query = Partial<{
  [key: string]: string | string[];
}>;

export const getCacheKey = (query: query) => {
  const keys = Object.keys(query);
  keys.sort();
  return keys.map(key => `${key}=${query[key]}`).join("&");
};

export const getCache = async (query: query) => {
  const key = getCacheKey(query);
  const cached = await redis.get<string>(key);
  return cached;
};

export const setCache = async (query: query, value: string) => {
  await redis.set(getCacheKey(query), value);
};

export const clearCache = async (query: query) => {
  await redis.del(getCacheKey(query));
};  


