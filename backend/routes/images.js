const express = require('express');
const router = express.Router();
const axios = require('axios');

// Note: You'll need to get a free API key from Unsplash
// Sign up at https://unsplash.com/developers

// @route   GET /api/images/search?query=keyword
// @desc    Search images from Unsplash
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ msg: 'Search query required' });
  }

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: query,
        per_page: 20,
        client_id: process.env.UNSPLASH_ACCESS_KEY,
      },
    });

    const images = response.data.results.map(img => ({
      id: img.id,
      url: img.urls.small,
      fullUrl: img.urls.regular,
      thumbnail: img.urls.thumb,
      description: img.description || img.alt_description,
    }));

    res.json(images);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;