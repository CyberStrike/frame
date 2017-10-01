const del  = require('del');
const Loki = require('lokijs');

module.exports.imageFilter = function (req, file, cb) {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

module.exports.loadCollection = function (colName, db) {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const _collection = db.getCollection(colName) || db.addCollection(colName);
      resolve(_collection);
    })
  });
}

module.exports.cleanFolder = function (folderPath) {
  // delete files inside folder but not the folder itself
  del.sync([`${folderPath}/**`, `!${folderPath}`]);
};