const fs = require('fs');
const https = require('https');
const { promisify } = require('util');

const beThere = require('be-there');
const shell = require('shelljs');
const { start } = require('repl');
const Zip = require('adm-zip');

const { Page } = require('./page');

const downloadMap = {
  1: 'https://www.projectaon.org/en/xhtml/lw/01fftd/01fftd.zip',
};
const fileNameSuffix = '.htm';
const startFileNames = ['sect1.htm'];

async function assureExpandedBook(path) {
  const files = fs.readdirSync(path);
  if (files.length > 1) {
    console.log("more files than source zip are present, expansion skipped");
    return;
  }

  console.log("no extracted files found, extracting...");
  const zip = new Zip(`${path}/source.zip`);
  zip.extractAllTo(path, true);
  console.log("done extracting");
}

function assurePath(path) {
  if (!fs.existsSync(path)) {
    console.log('storage creating path...');
    shell.mkdir('-p', path);
    console.log('path created');
  } else console.log('storage path exists');
}

async function assureZip(bookNum, path) {
  return new Promise((resolve, reject) => {
    if (!downloadMap[bookNum]) {
      reject(new Error(`book number (${bookNum}) does not have a path`));
    }

    if (!fs.existsSync(`${path}/source.zip`)) {
      console.log('downloading zip...');
      https.get(downloadMap[bookNum], (response) =>
      {
        const file = fs.createWriteStream(`${path}/source.zip`);
        response.pipe(file).on('error', (error) => { reject(error); });
        console.log('done');
        resolve();
      });
    } else {
      console.log('zip already downloded');
      resolve();
    }
  });
}

function findStartPath(path) {
  const dirContents = fs.readdirSync(path);
  for (let i = 0; i < dirContents.length; i +=1 ) {
    const entryPath = `${path}/${dirContents[i]}`;
    if (fs.lstatSync(entryPath).isDirectory()) {
      const findResult = findStartPath(entryPath);
      if (findResult) return findResult;
    } else if (startFileNames.indexOf(dirContents[i]) > -1) {
      return entryPath;
    }
  }
}

function loadPages(startPath) {
  const prefixEndIndex = startPath.indexOf(fileNameSuffix) - 1;
  if (prefixEndIndex < 0) {
    throw new Error(`bad starting file path: ${startPath}`);
  }
  const fileNamePrefix = startPath.substring(0, prefixEndIndex);

  const pages = [];
  for (let i = 1; true; i += 1) {
    const nextPagePath = `${fileNamePrefix}${i}${fileNameSuffix}`;

    try {
      const contents = fs.readFileSync(nextPagePath);
      pages.push(Page.fromHtml(contents));
    } catch(err) {
      if (err.code === 'ENOENT') {
        break;
      }
      throw err;
    }
  }
  return pages;
}

module.exports = class Book {
  constructor(bookNum) {
    beThere({ bookNum });

    Object.assign(this, {
      bookNum,
      initialized: false,
      path: `book_contents/${bookNum}`,
    });
  }

  async initialize() {
    if (this.initialized) {
      console.log('already initialized, no further work required');
      return;
    }

    console.log('initialization started');
    assurePath(this.path);
    await assureZip(this.bookNum, this.path);
    await assureExpandedBook(this.path);

    console.log('starting search for pages files...');
    this.startPath = findStartPath(this.path);
    this.pages = loadPages(this.startPath);
    console.log('search page files complete');

    console.log('initialization complete');
  }
};
