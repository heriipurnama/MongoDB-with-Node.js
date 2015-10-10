var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

mongoose.connect('mongodb://127.0.0.1/mydbs', function(err){
  if(err){
    console.log("Connect gagal  :" +err)
  }else{
    console.log("Connect Successfully")
  }
});
var books = new mongoose.Schema({
  name : String,
  isbn : String,
  author: String,
  pages : Number
}), books = mongoose.model('books', books);

//show all document books
app.get("/book", function(req,res){
  books.find({}, function(err, result){
    res.render('books/allbook',{books:result});
  })
});

//routes untuk new data
app.get("/book/newbook", function(req, res){
  res.render("books/newbook");
});

app.post("/books", function(req, res){
  var r = req.body;
  new  books({
    name : r.name,
    isbn : r.isbn,
    author : r.author,
    pages  : r.pages
  }).save(function(err){
        if(err) res.json(err);
        res.redirect('/book');
      });
});

//set parameter
app.param('isbn', function(req,res, next, isbn){
  books.find({isbn : isbn}, function(err, docs){
    req.books = docs[0];
    next();
  });
});

//show book profile
app.get('/books/:isbn', function(req, res){
  res.render("books/profile", {
    books : req.books
  })
})

//edit
app.get("/books/:isbn/update", function(req,res){
       res.render("books/update", {
         books : req.books
       });
});

//prosess update disini
app.post("/books/:isbn", function(req,res){
      var p = req.body;
  books.update({isbn : req.params.isbn},
      {
        name   : p.name,
        isbn   : p.isbn,
        author : p.author,
        pages  : p.pages
      }, function(err){
        res.redirect("/book/"); // Update suksess.. kembli kehalaman book

      });
});

// Delete Book
app.get("/books/:isbn/delete", function(req, res){
  books.remove({isbn : req.params.isbn}, function(err){
    res.redirect("/book");
  })
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);mongo
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
app.listen(1922);
console.log("Server Berjalan di port 1922")