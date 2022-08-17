import DBinterface  from './database.js';
import express from 'express';
import mysql from 'mysql2';
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
    //let res = await databaseLayer.getAllTheChat()
    //let res = await databaseLayer.getAllUsersWithStatus();
    //let res = await databaseLayer.readKey();
    //await databaseLayer.updateKey({pubKey:123,initVect:456})
   //let res = await databaseLayer.readKey();
    //console.log(res.result.pubKey.toString('hex'));
    let cryptoProc = new cryptoProcedures(databaseLayer);
    await cryptoProc.initInstanceKey()
    let res = await cryptoProc.encryptData(Buffer.from([0x01,0x02,0x03]))
    console.log(res);
    //console.log(await cryptoProc.generateSymmetricCryptoKey());
    process.exit(0);
 })



class cryptoProcedures {
    constructor (dbInst) {
        //making a hide property
      this.privateMembers = new WeakMap();
      //assign a 'private' - it may be an object
      this.privateMembers.set(this,{db:dbInst, keyAndVect:{pubKey:0, initVect:0}})    
    }
/***call neccessary to init key and vector  */
    async initInstanceKey () {
        //get a private member
        let priv = this.privateMembers.get(this);
        //read them from the DB
        let result = await priv.db.readKey();
        //asssign
        priv.keyAndVect.pubKey = result.result.pubKey;
        priv.keyAndVect.initVect = result.result.initVect;
    }

   
   async generateSymmetricCryptoKey() {
        //get a private member of class
        let priv = this.privateMembers.get(this);
        let db = priv.db;
    //it will be using for AES256 symm encryption
  //generate a symmetric key  
       let pubKey =  await new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buf) => {
                if (err) { reject(err) }
                 resolve(buf);
              });
        });
    //generate an initialization vector
        let initVect =  await new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) { reject(err) }
                 resolve(buf);
              });
        });
    // save into DB
    let res = await db.updateKey({pubKey:pubKey, initVect:initVect});
    //assign to private members
    priv.keyAndVect.pubKey = pubKey;
    priv.keyAndVect.initVect = initVect;
    return res.result;

    }

    async encryptData (data=Buffer.from([0x30,0x31,0x32])) {
        //create a 
        let init = this.privateMembers.get(this).keyAndVect;
        const cipher = crypto.createCipheriv('aes256', init.pubKey, init.initVect);
        //encrypt
        let encryptedArray = [cipher.update(data)];
        //encrypted message returns a buffer
        encryptedArray.push( cipher.final());
        return Buffer.concat(encryptedArray);
    } 
    async decryptData(){
        
    }
}
 


