
const WebSocketConnectionManager = require( './websock_mgr.js');
const sizeof = require( 'object-sizeof');
const cookieParser = require( "cookie-parser");
const  registerRouter  = require( './routes/register_route.js');
const loginRouter = require( './routes/login_route.js');
const logoffRouter = require( './routes/logoff_route.js');
const adminRouter = require( "./routes/admin_route.js");
const clientRouter = require( "./routes/client_route.js");
const pswChangeRouter = require( "./routes/psw_change_route.js");
const UserRegistration = require( "./registration.js");
const AuthorizationUser = require( './authorization.js');
const DBinterface  = require( './database.js');
const WebSocketServer = require( 'ws').WebSocketServer;
const express = require( 'express');
const mysql = require( 'mysql2');
const fs = require( 'fs');
const svgCaptcha = require( 'svg-captcha');

const CryptoProcedures = require( './cryptoroutines.js');
const UserAuthentication = require( './authentication.js');
const crypto = require( 'crypto');
const { fstat } = require( 'fs');
const CleanScheduler = require( './autocleaner.js');

const https = require( 'https');
 

const rdbmsOptions = {
  key: fs.readFileSync('./for_rdbms.key'),
  ca: fs.readFileSync('./for_rdbms.crt'),
  rejectUnauthorized:false
};

const httpsOptions = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')

}

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
                  let server = https.createServer(httpsOptions, app).listen(443,()=>{
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
        
        ssl:rdbmsOptions,
    
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










