module.exports = class Configuration {
  constructor() {
    Object.assign(this, {
      bookNum: process.env.BOOK_NUM,
    });
  }
};
