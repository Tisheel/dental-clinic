import client from './client';

const cache = {};

export function getCached(url, ttlMs = 5 * 60 * 1000) {
  const entry = cache[url];
  if (entry && Date.now() - entry.time < ttlMs) {
    return Promise.resolve(entry.data);
  }

  return client.get(url).then((res) => {
    cache[url] = { data: res.data, time: Date.now() };
    return res.data;
  });
}
