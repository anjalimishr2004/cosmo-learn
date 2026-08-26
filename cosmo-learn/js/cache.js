// js/cache.js — thin wrapper around sessionStorage for caching topic responses

const Cache = {
  get(topicKey) {
    try {
      const raw = sessionStorage.getItem(CONFIG.CACHE_PREFIX + topicKey);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error("Cache read failed:", err);
      return null;
    }
  },

  set(topicKey, data) {
    try {
      sessionStorage.setItem(CONFIG.CACHE_PREFIX + topicKey, JSON.stringify(data));
    } catch (err) {
      console.error("Cache write failed:", err);
    }
  }
};
