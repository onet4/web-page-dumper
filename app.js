// Express generated dependencies
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require( 'compression' );

const username = require( 'username' );
const getDate  = require( './utility/getDate' );

const cleanUserData = require( './tasks/cleanUserData' );

// Additional dependencies

const tempDirectory = require('temp-dir');
var fs = require('fs');

/// To parse POST
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var routerIndex = require( './routes/index' );
var routerWWW   = require( './routes/www/www.js' );
// var usersRouter = require('./routes/users'); // @deprecated

var app = express();
app.use(compression({}));
app.enable( 'trust proxy' );  // for Heroku environments to detect whether the scheme is https or not.

// Custom Data
var projectData = {
  'system': {
    'node.js': process.version,
  },
  'project': {
    'name' : 'Web Page Dumper',
    'author': 'Michael Uno',
    'url': 'https://github.com/michaeluno/web-page-dumper',
    'licenseURL': 'http://opensource.org/licenses/mit-license.php',
  },
  'package': require('./package.json'),
  'labels': {
    'reload'              : 'Reload',
    'userAgent'           : 'User Agent',
    'urlPlaceholder'      : 'Type URL here',
    'advanced'            : 'Advanced',
    'proxy'               : 'Proxy',
    'viewport'            : 'Viewport',
    'width'               : 'Width',
    'height'              : 'Height',
    'clip'                : 'Clip',
    'position'            : 'Position',
    'basicAuthentication' : 'Basic Authentication Credentials',
    'userName'            : 'User Name',
    'password'            : 'Password',
    'pdf'                 : 'PDF',
    'scale'               : 'Scale',
    'displayHeaderFooter' : 'Display the header and footer.',
    'headerTemplate'      : 'Header Template',
    'footerTemplate'      : 'Footer Template',
    'printBackground'     : 'Print background graphics.',
    'landscape'           : 'Landscape',
    'pageRanges'          : 'Page Ranges',
    'format'              : 'Format',
    'dimensions'          : 'Dimensions',
    'margins'             : 'Margins',
    'top'                 : 'Top',
    'right'               : 'Right',
    'bottom'              : 'Bottom',
    'left'                : 'Left',
    'deviceScaleFactor'   : 'Device Scale Factor',
    'mobile'              : 'Mobile',
    'dpr'                 : 'DPR',
    'screenshot'          : 'Screenshot',
    'quality'             : 'Quality',
    'fullPage'            : 'Full Page',
    'omitBackground'      : 'Omit background',
  }
};
app.set( 'config', projectData );

/// Temporary directories
const tempDirPath = tempDirectory + path.sep + 'web-page-dumper';
app.set( 'tempDirPath', tempDirPath );
if ( ! fs.existsSync( tempDirPath ) ){
    fs.mkdirSync( tempDirPath, { recursive: true } );
}
const tempDirPathCache = tempDirPath + path.sep + 'caches';
app.set( 'tempDirPathCache', tempDirPathCache );
if ( ! fs.existsSync( tempDirPathCache ) ){
    fs.mkdirSync( tempDirPathCache, { recursive: true } );
}
const tempDirPathUserData = tempDirPath + path.sep + 'user-data' + path.sep + username.sync();
const tempDirPathUserDataByDay = tempDirPathUserData + path.sep + getDate();
app.set( 'tempDirPathUserDataByDay', tempDirPathUserDataByDay );
if ( ! fs.existsSync( tempDirPathUserDataByDay ) ){
    fs.mkdirSync( tempDirPathUserDataByDay, { recursive: true } );
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Dependencies to handle forms
// @see
/// for parsing application/json
app.use(bodyParser.json());

/// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
///form-urlencoded

/// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static('public'));

app.use( '*', require( './routes/any' ) );
app.use( '/', routerIndex );
app.use( '/www', routerWWW );
app.use( '/nodejsinfo', require( './routes/nodejsinfo' ) );
app.use( '/usage', require( './routes/usage' ) );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.status  = err.status || 500;
  res.locals.message = 500 === res.locals.status
    ? 'Internal Server Error'
    : err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status( res.locals.status );
  res.render( 'error', req.app.get( 'config' ) );

});

// Periodical routines.
cleanUserData( tempDirPathUserData );

module.exports = app;