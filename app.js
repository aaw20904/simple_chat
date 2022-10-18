/*****RETURNED VALUE MUST BE 
   {
      status:Boolean,
      msg:Text,    
      error: Error | Text,
      value: any  //when ONE returned value
      results: {.....}  //when MANY returned values
   }

 */
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
import CleanScheduler from './autocleaner.js'

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
                                                                AUTH_COOKIE_LIFE_TIME:3600000,//all the fields are in  milliseconds
                                                                AUTH_COOKIE_UPDATE_THRESHOLD:30000,//all the fields are in  milliseconds
                                                                AUTH_FAIL_ATTEMPTS:10,
                                                                });
    layers77.authorizeLayer = new AuthorizationUser(layers77.databaseLayer, layers77.cryptoLayer, layers77.authenticationLayer,{AUTH_FAIL_ATTEMPTS:10});
    layers77.registrationLayer = new UserRegistration(layers77.cryptoLayer, layers77.databaseLayer);
    layers77.websocketLayer  = new WebSocketConnectionManager( layers77.databaseLayer,layers77.authenticationLayer,  8080, 15000);
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
    //2 let result = layers77.registrationLayer.createRegistrationCookieAndCaptcha();
    //2 layers77.registrationLayer.isRegistrationCookieValid(result.results.cookie, result.results.text);
    // let newKeys = await layers77.cryptoLayer.generateSymmetricCryptoKey();   
    //layers77.databaseLayer.updateKey(newKeys.results);   
    // console.log(await layers77.databaseLayer.writeNewUser({name:'Bill',hashedPassword:'213456',avatar:"abcdefg"}) ); 
    //console.log(await layers77.databaseLayer.removeUserByID(16));
    // console.log(await layers77.databaseLayer.changeUserPasword({usrId:16, password:123546}) );
    //* console.log(await layers77.databaseLayer.addUserMessage({usrId:18, msg:"helloword!" })); */
     //console.log( await layers77.databaseLayer.removeUserMessage(1) );
    //console.log( await layers77.databaseLayer.editUserMessage({msgId:2,message:'abc'}) );
    //console.log( await layers77.databaseLayer.incrementFailLoginAttempts(17) );
    //console.log( await layers77.databaseLayer.clearUserLocked(17) );
    //console.log( await layers77.databaseLayer.getUserFailLoginAttempts(17) );
    //console.log( await layers77.databaseLayer.clearUserFailLoginAttempts(17) );
    //console.log( await layers77.databaseLayer.setSessionActive(17) );
    //console.log( await layers77.databaseLayer.setUserLocked(17) );
    //console.log( await layers77.databaseLayer.clearSessionActive(17) );
    //console.log( await layers77.databaseLayer.clearUserLocked(17) );
    //console.log( await layers77.databaseLayer.isUserLocked(17) );
    //console.log( await layers77.databaseLayer.isSessionActive(17) );
    // let res = await layers77.databaseLayer.getAllTheChat()
    //let res = await layers77.databaseLayer.getAllUsersWithStatus();
    //let res = await layers77.databaseLayer.readKey();
    //await layers77.databaseLayer.updateKey({pubKey:123,initVect:456})
    //let res = await layers77.databaseLayer.readKey();
     //console.log(res.result.pubKey.toString('hex'));
     //2 let x1 = layers77.cryptoLayer.symmEncrypt(Buffer.from("helloWord"));
     //2 console.log(x1.value.toString('hex'));
     //2 let y1 = layers77.cryptoLayer.symmDecrypt(x1.value);
     //2 console.log(y1.value.toString('utf-8'));
     ///console.log(y1.toString("utf-8"))
     //2 let cookie =  layers77.authenticationLayer.createCookie(17);
     //2 console.log(cookie);
     // console.log(layers77.authenticationLayer.readCookie(cookie.value).results)
     //2 let raw = await layers77.authenticationLayer.authenticateUserByCookie(cookie.value);
     //2 console.log(raw.results, raw.status)
     //await layers77.databaseLayer.readUserShortlyByID(18)
     //let res = await  layers77.authenticationLayer.authenticateUserByCookie(cookie)
     //2 let hash = await layers77.cryptoLayer.createPasswordHash("password");
     //2 console.log(await layers77.databaseLayer.changeUserPasword({usrId:17,password:hash.value}));
     //2 console.log(await layers77.cryptoLayer.validatePassword('psw',hash.value));
     //2console.log(await layers77.authorizeLayer.authorizeUser('Bob',"password"));
     //2 console.log(await layers77.registrationLayer.registerUserInSystem({usrName:'Bob', password:'password',avatar:Buffer.from([0x01,0x03,0x05])}))
     //await layers77.authorizeLayer.logoffUser(19);
     //process.exit(0);
    //console.log(await layers77.databaseLayer.readUserAvatar(25));
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
    res.render('okay.ejs',{status:'text-danger',description:'please call to administrator or create creadantails if you are',time: new Date().toLocaleTimeString(),msg:"Admin not found!"});
   return;
  }
  //when success
  res.render('okay.ejs',{status:'text-success',description:'please jump to any part of the site!',time: new Date().toLocaleTimeString(),msg:"Wellcome!"});
})

/***T E S T I N G ROUTE  */

app.get('/test',async(req,res)=>{
  //get random number
  let rnd = await layers77.cryptoLayer.generateRandomString(4);
  res.render('testwebsocket.ejs',{text:rnd});
})


/*********S T A R T **********/
///start to listen
app.listen(80, ()=>console.log('Listen...'))







/*******   W E B S O C K E T  ****/
// (A) CREATE WEBSOCKET SERVER AT PORT 8080
/*
const wss = new WebSocketServer({ port: 8080 });

function heartbeat() {
  console.log(`beat: ${new Date().toLocaleTimeString()}`)
  this.isAlive = true;
}


// (B) ON CLIENT CONNECT
wss.on("connection", (socket, req) => {
    // (B1) SEND MESSAGE TO CLIENT
     socket.send("Welcome!");
    socket.isAlive = true;
    socket.on('pong', heartbeat);
     //
     console.log(sizeof(socket));
    // (B2) ON RECEIVING MESSAGE FROM CLIENT
    socket.on("message", (msg) => {
        //console.log(JSON.stringify(socket));
        let message = msg.toString(); // MSG IS BUFFER OBJECT
        socket.send(`OK ->> ${Date.now().toString('10')}`,()=>console.log('sent!'));
        let sockcets = [];
        for (let y of wss.clients) {
          sockcets.push(y);
          console.log(y.readyState);
          //при разрыве сетевого соединения (не закрывая браузер)
          //подключение остается.Мало того добавляется новые сокеты 
        }
        console.log(wss.clients);
      console.log(message);
        
    });

    const interval = setInterval(function ping() {
       wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
         ws.isAlive = false;
         ws.ping();
      });
    }, 3000);

    // (B3) ON CLIENT DISCONNECT
    socket.on("close", (code, reason) => {
    console.log(code);
    console.log(reason);
    });
});
// (C) NOT-SO-CRITICAL EVENTS
wss.on("listening", () => { console.log("WS READY and listen on port 8080... "); });

  wss.on('close', function close() {
    clearInterval(interval);
  });

wss.on("error", (err) => { console.log(err); });
*/
