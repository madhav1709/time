const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

//mongoose.connect
mongoose.connect('mongodb://madhav:dragon12@ds033337.mlab.com:33337/new2');

const db=mongoose.connection;
//sports
//const port =3000;
//init app
const app = express();

const admin = require('./admin');

//view setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set the static  folder
app.use(express.static(path.join(__dirname,'public')));

//express messages
app.use(require('connect-flash')());
app.use((req, res, next)=> {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
process.once('SIGUSR2', function () {    //for nodemon when it restarts the server to gracefully shutdown database 
  Shutdown('nodemon restart', function () {  
    process.kill(process.pid, 'SIGUSR2');            
  });
});
process.on('SIGINT', function () {   //for nodemon when it restarts the server to gracefully shutdown database 
  Shutdown('app termination', function () {   
    process.exit(0);                                  
  });
});

process.on('SIGTERM', function() {  //when heroku emits process to gracefully shutdown database   
  Shutdown('Heroku app shutdown', function () { 
    process.exit(0);                                    
  });
});

app.use(logger('dev'));
app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));
app.use(cookieParser());
app.use(flash());
//App level middleware
app.use(session({//session middlewar init
    name: 'CustomCookie',
    secret: 'furydragon', // custom encryption key 
    resave: true,
    httpOnly: true, 
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));

//express validator
app.use(expressValidator({
  errorFormatter:(param,msg,value)=>{
    const namespace = param.split('.')
    ,root = namespace.shift()
    , formparam = root;
    while(namespace.length) {
      formparam+= '['+namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
  }
}));

app.use('/',admin);
app.use('/login',admin);
app.use('/list_employees',admin);


app.listen(process.env.PORT || 3000,()=>{
  console.log('server started on port'+process.env.PORT);
});
