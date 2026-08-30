```js
// js/cache.js
// Session storage cache for CosmoLearn topic responses

"use strict";


// ==================================================
// CACHE CONFIG
// ==================================================

const CACHE_PREFIX = "cosmoLearn_topic_";


// ==================================================
// CACHE OBJECT
// ==================================================

const Cache = {

  // ------------------------------------------------
  // GET CACHED TOPIC
  // ------------------------------------------------

  get(topicKey) {

    try {

      if (!topicKey) {
        return null;
      }


      const key =
        CACHE_PREFIX +
        String(topicKey)
          .trim()
          .toLowerCase();


      const raw =
        sessionStorage.getItem(key);


      if (!raw) {
        return null;
      }


      return JSON.parse(raw);

    } catch (err) {

      console.error(
        "Cache read failed:",
        err
      );

      return null;

    }

  },


  // ------------------------------------------------
  // SAVE TOPIC
  // ------------------------------------------------

  set(topicKey, data) {

    try {

      if (!topicKey || !data) {
        return;
      }


      const key =
        CACHE_PREFIX +
        String(topicKey)
          .trim()
          .toLowerCase();


      sessionStorage.setItem(
        key,
        JSON.stringify(data)
      );


    } catch (err) {

      console.error(
        "Cache write failed:",
        err
      );

    }

  },


  // ------------------------------------------------
  // REMOVE ONE TOPIC
  // ------------------------------------------------

  remove(topicKey) {

    try {

      if (!topicKey) {
        return;
      }


      const key =
        CACHE_PREFIX +
        String(topicKey)
          .trim()
          .toLowerCase();


      sessionStorage.removeItem(key);


    } catch (err) {

      console.error(
        "Cache remove failed:",
        err
      );

    }

  },


  // ------------------------------------------------
  // CLEAR ALL COSMOLEARN CACHE
  // ------------------------------------------------

  clear() {

    try {

      const keys = [];

      for (
        let i = 0;
        i < sessionStorage.length;
        i++
      ) {

        const key =
          sessionStorage.key(i);


        if (
          key &&
          key.startsWith(CACHE_PREFIX)
        ) {

          keys.push(key);

        }

      }


      keys.forEach(
        (key) => {
          sessionStorage.removeItem(key);
        }
      );


      console.log(
        "CosmoLearn topic cache cleared."
      );


    } catch (err) {

      console.error(
        "Cache clear failed:",
        err
      );

    }

  }

};


// ==================================================
// EXPOSE CACHE GLOBALLY
// ==================================================

window.Cache = Cache;
```
