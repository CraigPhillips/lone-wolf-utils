const Book = require('./book');
const Configuration = require('./config');

(async function() {
  try {
    const config = new Configuration();
    const book = new Book(config.bookNum);

    await book.initialize();
  } catch (error) {
    console.log('something horrible happened');
    console.log(error);
  }
})();
