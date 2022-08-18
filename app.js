/*****RETURNED VALUE MUST BE 
   {
    status:Boolean,
    msg:Text,    
    error: Error | Text,
    value: any  //when ONE returned value
    results: {.....}  //when MANY returned values

   }


 */
import AuthorizationUser from './authorization.js';
import DBinterface  from './database.js';
import express from 'express';
import mysql from 'mysql2';
import CryptoProcedures from './cryptoroutines.js';
import UserAuthentication from './authentication.js';
import crypto from 'crypto';

const DATABASE_USER='root';
const DATABASE_HOST='localhost';
const DATABASE_PASSWORD='65535258';
const DATABASE_NAME='chat';

let app= express();
let databaseLayer = 0;


 
// set the view engine to ejs
app.set('view engine', 'ejs');

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
        // }
    
     });
 
 connectionDB.connect( async function(err) {
    if (err) {
        console.error('error SQL connecting: ' + err.stack);
        process.exit(-1);
        return;
    }
    databaseLayer = new DBinterface(connectionDB);
    let keys = await databaseLayer.readKey(); 
      //create an instance init key and vect
    let cryptoProc = new CryptoProcedures(keys.results );
    let userAuth = new UserAuthentication(cryptoProc, databaseLayer);
   let authorizeLayer = new AuthorizationUser(databaseLayer,cryptoProc,userAuth);
   // let newKeys = await cryptoProc.generateSymmetricCryptoKey();   
    //   databaseLayer.updateKey(newKeys.results);   
     // console.log(await databaseLayer.writeNewUser({name:'Bill',hashedPassword:'213456',avatar:"abcdefg"}) ); 
    //console.log(await databaseLayer.removeUserByID(16));
   // console.log(await databaseLayer.changeUserPasword({usrId:16, password:123546}) );
    /* console.log(await databaseLayer.addUserMessage({
                                                    usrId:18, 
                                                    msg:"helloword!"
                                                    })); */
    //console.log( await databaseLayer.removeUserMessage(1) );
    //console.log( await databaseLayer.editUserMessage({msgId:2,message:'abc'}) );
    //console.log( await databaseLayer.incrementFailLoginAttempts(17) );
    //console.log( await databaseLayer.clearUserLocked(17) );
    //console.log( await databaseLayer.getUserFailLoginAttempts(17) );
    //console.log( await databaseLayer.clearUserFailLoginAttempts(17) );
   //console.log( await databaseLayer.setSessionActive(17) );
    //console.log( await databaseLayer.setUserLocked(17) );
   //console.log( await databaseLayer.clearSessionActive(17) );
    //console.log( await databaseLayer.clearUserLocked(17) );
    //console.log( await databaseLayer.isUserLocked(17) );
    //console.log( await databaseLayer.isSessionActive(17) );
  // let res = await databaseLayer.getAllTheChat()
    //let res = await databaseLayer.getAllUsersWithStatus();
    //let res = await databaseLayer.readKey();
    //await databaseLayer.updateKey({pubKey:123,initVect:456})
   //let res = await databaseLayer.readKey();
    //console.log(res.result.pubKey.toString('hex'));
  
     //2 let x1 = cryptoProc.symmEncrypt(Buffer.from("helloWord"));
     //2 console.log(x1.value.toString('hex'));
     //2 let y1 = cryptoProc.symmDecrypt(x1.value);
     //2 console.log(y1.value.toString('utf-8'));
    ///console.log(y1.toString("utf-8"))
     //2 let cookie =  userAuth.createCookie(17);
     //2 console.log(cookie);
    //2 console.log(userAuth.readCookie(cookie.value).results)
   //2 let raw = await userAuth.authenticateUserByCookie(cookie.value);
   //2 console.log(raw.results, raw.status)
  //await databaseLayer.readUserShortlyByID(18)
   //let res = await  userAuth.authenticateUserByCookie(cookie)
    let hash = await cryptoProc.createPasswordHash("password");
    //console.log(await databaseLayer.changeUserPasword({usrId:17,password:hash.value}));
    
  //2 console.log(await cryptoProc.validatePassword('psw',hash.value));
  
  
  console.log(await authorizeLayer.authorizeUser('Bill',"password"));
    process.exit(0);
 })



  /**************** */