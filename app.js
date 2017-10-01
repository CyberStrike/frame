'use strict';

// Libraries
const express = require('express');
const path    = require('path');
const multer  = require('multer')
const fs      = require('fs')
const Loki    = require('lokijs')
const logger  = require('morgan');

// Utility
const util    = require('./utils')

// Config Loki; Plaintext DB
const DB_NAME         = 'db.json';
const COLLECTION_NAME = 'images';
const UPLOAD_PATH     = 'uploads';
const upload          = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration
const DB              = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });

const app = express();

//
// view engine setup
//

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//
// Middleware Setup
//

// Logger Setup
app.use(logger('dev'));

// Allow CORS
app.use( function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//
// Controller / Routes
//

app.get('/', function (req, res) {
  res.render('index', {title: 'Frame'})
});

app.get('/photos/new', function (req, res) {
  res.render('photos/new', {title: 'Add A Photo'})
});

app.post('/photos/create', upload.single('photo'), async (req, res) => {
  try {

    const col = await util.loadCollection(COLLECTION_NAME, DB);
    const data = col.insert(req.file);

    DB.saveDatabase();

    res.redirect(`/photo/${data.$loki}`)

  } catch (err) {
    res.sendStatus(400);
  }
})

app.get('/photo/:id', async (req, res) => {
  try {
    const col = await util.loadCollection(COLLECTION_NAME, DB);
    const result = col.get(req.params.id);

    if (!result) return res.sendStatus(404);

    res.setHeader('Content-Type', result.mimetype);
    fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res);
  } catch (err) {
    res.sendStatus(400);
  }
})


//
// Ensure 404 and Show Errors
//

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// Init Server
app.listen(3000, function (err) {
  if (err) throw err;
  console.log('Server started on port 3000')
});

