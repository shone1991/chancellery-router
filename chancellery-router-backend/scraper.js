const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeDepartments(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const departments = [];

  $('div.__user_cards .right').each((i, el) => {
    const name = $(el).find('p').first().text().trim();

    if (name) {
      departments.push(name);
    }
  });

  return departments;
}

module.exports = { scrapeDepartments };