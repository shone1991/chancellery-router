const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeDepartments(baseUrl) {
  // Fetch pages /1 through /23 in parallel
  const ids = Array.from({ length: 23 }, (_, i) => i + 1);

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const { data } = await axios.get(`${baseUrl}${id}`, {
          timeout: 12000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(data);
        const right = $('div.__user_cards .right');
        const paragraphs = right.find('p');

        // First <p>: "Kafedra nomi mudiri" — strip " mudiri"
        const titleText = $(paragraphs[0]).text().trim();
        const name = titleText.replace(/\s*mudiri\s*$/i, '').trim();

        // Second <p>: head full name
        const head = $(paragraphs[1]).text().replace(/<[^>]+>/g, '').trim();

        if (!name) return null;
        return { id, name, head };
      } catch (err) {
        console.warn(`scraper: skipped ID ${id} — ${err.message}`);
        return null;
      }
    })
  );

  return results.filter(Boolean).sort((a, b) => a.id - b.id);
}

module.exports = { scrapeDepartments };
