// js/cache.js

"use strict";

const CosmoCache = {

  PREFIX: "cosmoLearn_topic_",

  get(topicKey) {
    try {
      if (!topicKey) return null;

      const key =
        this.PREFIX +
        String(topicKey).trim().toLowerCase();

      const raw = sessionStorage.getItem(key);

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);

    } catch (err) {
      console.error("Cache read failed:", err);
      return null;
    }
  },


  set(topicKey, data) {
    try {
      if (!topicKey || !data) return;

      const key =
        this.PREFIX +
        String(topicKey).trim().toLowerCase();

      sessionStorage.setItem(
        key,
        JSON.stringify(data)
      );

    } catch (err) {
      console.error("Cache write failed:", err);
    }
  },


  remove(topicKey) {
    try {
      if (!topicKey) return;

      const key =
        this.PREFIX +
        String(topicKey).trim().toLowerCase();

      sessionStorage.removeItem(key);

    } catch (err) {
      console.error("Cache remove failed:", err);
    }
  },


  clear() {
    try {
      const keys = [];

      for (
        let i = 0;
        i < sessionStorage.length;
        i++
      ) {
        const key = sessionStorage.key(i);

        if (
          key &&
          key.startsWith(this.PREFIX)
        ) {
          keys.push(key);
        }
      }

      keys.forEach((key) => {
        sessionStorage.removeItem(key);
      });

    } catch (err) {
      console.error("Cache clear failed:", err);
    }
  }

};

window.CosmoCache = CosmoCache;