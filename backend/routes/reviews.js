const express = require('express');
const router = express.Router();
const { db } = require('../database');

router.get('/', async (req, res) => {
  try {
    const settings = {};
    db.prepare('SELECT key, value FROM settings').all().forEach(r => { settings[r.key] = r.value; });

    const apiKey = settings.google_maps_api_key;
    const placeId = settings.google_maps_place_id;

    if (!apiKey || !placeId) {
      return res.json({ success: true, data: [], fallback: true });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&language=tr&reviews_sort=newest&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.json({ success: true, data: [], fallback: true });
    }

    const reviews = (data.result.reviews || []).slice(0, 6).map(r => {
      const nameParts = r.author_name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] + '.' : '';
      const displayName = lastName ? `${firstName} ${lastName}` : firstName;

      return {
        author: displayName,
        rating: r.rating,
        text: r.text,
        time: r.relative_time_description,
        profile_photo: r.profile_photo_url,
      };
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('Reviews error:', err);
    res.json({ success: true, data: [], fallback: true });
  }
});

module.exports = router;
