const express = require('express')
const router = express.Router()
const { pool } = require('../database')

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings WHERE key IN ($1, $2)', ['google_maps_api_key', 'google_maps_place_id'])
    const settings = {}
    result.rows.forEach(r => { settings[r.key] = r.value })

    const apiKey = settings.google_maps_api_key
    const placeId = settings.google_maps_place_id

    if (!apiKey || !placeId) return res.json({ success: true, data: [], fallback: true })

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&language=tr&reviews_sort=newest&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') return res.json({ success: true, data: [], fallback: true })

    const reviews = (data.result.reviews || [])
      .filter(r => r.rating >= 4)
      .slice(0, 6)
      .map(r => {
        const parts = r.author_name.trim().split(' ')
        const lastName = parts.length > 1 ? parts[parts.length - 1][0] + '.' : ''
        return {
          author: lastName ? `${parts[0]} ${lastName}` : parts[0],
          rating: r.rating,
          text: r.text,
          time: r.relative_time_description,
          profile_photo: r.profile_photo_url,
        }
      })

    res.json({ success: true, data: reviews })
  } catch (err) {
    console.error('Reviews error:', err)
    res.json({ success: true, data: [], fallback: true })
  }
})

module.exports = router
