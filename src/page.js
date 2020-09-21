const beThere = require('be-there');
const cheerio = require('cheerio');

const treasureIdentifiers = [
  'take',
];

class Page {
  constructor({ bodyText, hasTreasure, number }) {
    Object.assign(this, {
      bodyText,
      hasTreasure,
      number,
    });

    beThere(this);
  }
};

let treasureCount = 0;
Page.fromHtml = (html) => {
  const $ = cheerio.load(html);

  const number = $('.maintext h3').text();

  const paragraphs = $('.maintext p:not(.choice)')
  const bodyText = paragraphs
    .map((_, elem) => $(elem).text())
    .get()
    .join('\n\n');

  const hasTreasure = treasureIdentifiers.some((identifier) =>
    html.indexOf(identifier) > -1,
  );

  if (hasTreasure) {
    treasureCount++;
    console.log(`TREASURE! (${treasureCount}) \n${bodyText}`);
    console.log(`(${number})\n\n`);
  }

  return new Page({ bodyText, hasTreasure, number });
}

module.exports = {
  Page,
};
