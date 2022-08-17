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
    let cryptoProc = new CryptoProcedures(databaseLayer);
    let userAuth = new UserAuthentication(cryptoProc,databaseLayer);
   console.log(await cryptoProc.generateSymmetricCryptoKey());
     await cryptoProc.initInstanceKey();
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
  
     //let x1 = cryptoProc.symmEncrypt(Buffer.from("helloWord"));
     //let y1 = cryptoProc.symmDecrypt(x1);
     //console.log(y1.toString("utf-8"))
   let cookie = userAuth.createCookie(17);
  // let raw = userAuth.readCookie(cookie);
  //await databaseLayer.readUserShortlyByID(18)
   let res = await  userAuth.authenticateUserByCookie(cookie)
  console.log(res);
   

    process.exit(0);
 })


