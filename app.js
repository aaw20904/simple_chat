
import WebSocketConnectionManager from './websock_mgr.js'
import sizeof from 'object-sizeof'
import cookieParser from "cookie-parser"
import  registerRouter  from './routes/register_route.js'
import loginRouter from './routes/login_route.js'
import logoffRouter from './routes/logoff_route.js'
import adminRouter from "./routes/admin_route.js"
import clientRouter from "./routes/client_route.js"
import pswChangeRouter from "./routes/psw_change_route.js";
import UserRegistration from "./registration.js";
import AuthorizationUser from './authorization.js';
import DBinterface  from './database.js';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import mysql from 'mysql2';
import fs from 'fs';
import svgCaptcha from 'svg-captcha';

import CryptoProcedures from './cryptoroutines.js';
import UserAuthentication from './authentication.js';
import crypto from 'crypto';
import { fstat } from 'fs'
import CleanScheduler from './autocleaner.js';

import https from 'https';
 

const options = {
  key: fs.readFileSync('./chat.key'),
  cert: fs.readFileSync('./chat.cert'),
  rejectUnauthorized:false
};

const DATABASE_USER='root';
const DATABASE_HOST='localhost';
const DATABASE_PASSWORD='65535258';
const DATABASE_NAME='chat';

let app= express();
/****global Instances of classes */
let layers77= {
    databaseLayer: null,
    cryptoLayer: null,
    authenticationLayer: null,
    authorizeLayer: null,
    registrationLayer: null,
    websocketLayer:null,
    authCookieName: 'sessionInfo',
    lastPageCookie: 'lastURL',
    administratorId: null,
    cleanScheduler: null,
    httpsServerObject: null
}

//init global interfaces in routes
registerRouter._layers77 = layers77;
loginRouter._layers77 = layers77;
adminRouter._layers77 = layers77;
logoffRouter._layers77 = layers77;
pswChangeRouter._layers77 = layers77;
clientRouter._layers77 = layers77;
/*********** */
////when  DB connection had established
let onChatDatabaseConnectedRoutine = async (err) => {
   
  ///
   let cleanSchedulerOpts;
      if (err) {
        console.error('error SQL connecting: ' + err.stack);
        process.exit(-1);
        return;
    }
    layers77.databaseLayer = new DBinterface(connectionDB);
    let keys = await layers77.databaseLayer.readKey(); 
    //get admin id 
    layers77.administratorId = await layers77.databaseLayer.readAdminId();
    if(!layers77.administratorId.status) {
      console.log('Adminisrator not found!');
      layers77.administratorId = null;
    } else {
      layers77.administratorId = layers77.administratorId.value;

    }

    //create an instance init key and vect
    layers77.cryptoLayer = new CryptoProcedures(keys.results );
    layers77.authenticationLayer = new UserAuthentication(layers77.cryptoLayer, layers77.databaseLayer,{
                                                      AUTH_COOKIE_LIFE_TIME: 3600000,//all the fields are in  milliseconds
                                                      AUTH_COOKIE_UPDATE_THRESHOLD: 30000,//all the fields are in  milliseconds
                                                      AUTH_FAIL_ATTEMPTS: 10,
                                                  });
    layers77.authorizeLayer = new AuthorizationUser(layers77.databaseLayer, layers77.cryptoLayer, layers77.authenticationLayer,{AUTH_FAIL_ATTEMPTS:10});
    layers77.registrationLayer = new UserRegistration(layers77.cryptoLayer, layers77.databaseLayer);
    layers77.httpsServerObject = await new Promise((resolve, reject) => {
                  /*********S T A R T **********/
                  let server = https.createServer(options, app).listen(443,()=>{
                                console.log('HTTPS server listen on port :443...');
                                resolve(server)});
                //app.listen(80, ()=>console.log('Listen...'))
                });
    layers77.websocketLayer  = new WebSocketConnectionManager( layers77.databaseLayer,layers77.authenticationLayer,  8080, 15000, layers77.httpsServerObject);
    layers77.cleanScheduler = new CleanScheduler(layers77);
    //reading cleaner options
    cleanSchedulerOpts = await layers77.databaseLayer.getCleanOptions();
    if (cleanSchedulerOpts.results) {
      layers77.cleanScheduler.createCleanerInstance(cleanSchedulerOpts.results);
    }
   ///when a crypto key must be updated:
    if ( (process.argv.length > 2) && (process.argv[2] === 'KEYGEN') ) {
          let key = await layers77.cryptoLayer.generateSymmetricCryptoKey();
          let recordStatus = await layers77.databaseLayer.updateKey(key.results);
          console.log('Key updated successfully!');
          console.log(recordStatus);
    }
    
}
/********** */

    const connectionDB = mysql.createConnection({
        user: DATABASE_USER,
        password: DATABASE_PASSWORD,
        host: DATABASE_HOST,
        database: DATABASE_NAME,
        
        /* ssl:{
                ca: fs.readFileSync(...),
                /*You can also connect to a MySQL server
                without properly providing the appropriate CA to trust.
                You should not do this.*/
                //rejectUnauthorized: FALSE,
        // } */
    
     });
 ///DATABASE EVENT HANDLER onConnectDB
 connectionDB.connect(onChatDatabaseConnectedRoutine);




    /***server intialization**** */
  // set the view engine to ejs
//app.set('view engine', 'ejs');
///routes registration
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logoff", logoffRouter);
app.use("/admin", adminRouter);
app.use("/changepassword", pswChangeRouter);
app.use("/client", clientRouter);

app.use(express.json({extended:true}));
app.use(express.static('public'));
app.use(cookieParser());



app.get('/',(req, res)=>{
  if(!layers77.administratorId) {
    //when Admin hasn`t been found
    res.render('index.ejs',{status:'text-danger',description:'please call to administrator or create creadantails if you are',time: new Date().toString(),msg:"Admin not found!"});
   return;
  }
  //when success
  res.render('index.ejs',{status:'text-success',description:'please jump to any part of the site!',time: new Date().toString(),msg:"Wellcome!"});
})

/***T E S T I N G ROUTE  */

app.get('/test',async(req,res)=>{
  //get random number
  let rnd = await layers77.cryptoLayer.generateRandomString(4);
  res.render('testwebsocket.ejs',{text:rnd});
})










