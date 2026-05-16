const axios = require('axios');
const fs = require('fs');
const dishes = [
  'Kikliko', 'Chvishtari', 'Nadugi', 'Chikhirtma', 'Pkhali', 'Badrijani', 'Lobio',
  'Shkmeruli', 'Ojakhuri', 'Chashushuli', 'Chakapuli', 'Adjarian Khachapuri', 'Pelamushi', 'Churchkhela', 'Medovik'
];

async function run() {
  const results = {};
  for (const dish of dishes) {
    try {
      const res = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(dish)}&prop=pageimages&format=json&pithumbsize=800`);
      const pages = res.data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pages[pageId] && pages[pageId].thumbnail) {
        results[dish] = pages[pageId].thumbnail.source;
      } else {
        results[dish] = "Not found";
      }
    } catch (e) {
      results[dish] = "Error";
    }
  }
  fs.writeFileSync('wiki_images.json', JSON.stringify(results, null, 2));
}
run();
