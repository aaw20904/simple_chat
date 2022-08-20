/*****RETURNED VALUE MUST BE 
   {
    status:Boolean,
    msg:Text,    
    error: Error | Text,
    value: any  //when ONE returned value
    results: {.....}  //when MANY returned values

   }

 */
import apiRouter from './routes/api_route.js'
import UserRegistration from "./registration.js";
import AuthorizationUser from './authorization.js';
import DBinterface  from './database.js';
import express from 'express';
import mysql from 'mysql2';
import svgCaptcha from 'svg-captcha';

import CryptoProcedures from './cryptoroutines.js';
import UserAuthentication from './authentication.js';
import crypto from 'crypto';

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
  registratonLayer: null,
}

 


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
 
 connectionDB.connect( async function(err) {
    if (err) {
        console.error('error SQL connecting: ' + err.stack);
        process.exit(-1);
        return;
    }
    layers77.databaseLayer = new DBinterface(connectionDB);
    let keys = await layers77.databaseLayer.readKey(); 
      //create an instance init key and vect
      layers77.cryptoLayer = new CryptoProcedures(keys.results );
      layers77.authenticationLayer = new UserAuthentication(layers77.cryptoLayer, layers77.databaseLayer);
     layers77.authorizeLayer = new AuthorizationUser(layers77.databaseLayer, layers77.cryptoLayer, layers77.authenticationLayer);
     layers77.registratonLayer = new UserRegistration(layers77.cryptoLayer, layers77.databaseLayer);
   //2 let result = layers77.registratonLayer.createRegistrationCookieAndCaptcha();
   //2 layers77.registratonLayer.isRegistrationCookieValid(result.results.cookie, result.results.text);
   // let newKeys = await layers77.cryptoLayer.generateSymmetricCryptoKey();   
   //   layers77.databaseLayer.updateKey(newKeys.results);   
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
    //2 console.log(layers77.authenticationLayer.readCookie(cookie.value).results)
   //2 let raw = await layers77.authenticationLayer.authenticateUserByCookie(cookie.value);
   //2 console.log(raw.results, raw.status)
  //await layers77.databaseLayer.readUserShortlyByID(18)
   //let res = await  layers77.authenticationLayer.authenticateUserByCookie(cookie)
    //2 let hash = await layers77.cryptoLayer.createPasswordHash("password");
    //2 console.log(await layers77.databaseLayer.changeUserPasword({usrId:17,password:hash.value}));
  //2 console.log(await layers77.cryptoLayer.validatePassword('psw',hash.value));
   //2console.log(await layers77.authorizeLayer.authorizeUser('Bob',"password"));
  //2 console.log(await layers77.registratonLayer.registerUserInSystem({usrName:'Bob', password:'password',avatar:Buffer.from([0x01,0x03,0x05])}))
  //await layers77.authorizeLayer.logoffUser(19);


  //process.exit(0);
 });



    /***server intialization**** */
  // set the view engine to ejs
//app.set('view engine', 'ejs');
app.use("/api", apiRouter);
app.listen(80,()=>console.log('Listen...'))