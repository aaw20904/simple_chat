import crypto from 'crypto';
import bcrypt from 'bcrypt';

export default class CryptoProcedures {
    constructor  (arg={pubKey:Buffer.from([0x01]), initVect:Buffer.from([0x01])}) {
        //making a hide property
      this.privateMembers = new WeakMap();
    
      //assign a 'private' - it may be an object
      this.privateMembers.set(this, { 
        keyAndVect:{pubKey:arg.pubKey, initVect:arg.initVect},
         //input and output are buffers - symmetrical encription
        _encryptData:    (data=Buffer.from([0x30,0x31,0x32]))=> {
            
            let init = this.privateMembers.get(this).keyAndVect;
            const cipher = crypto.createCipheriv('aes256', init.pubKey, init.initVect);
                 //encrypt
            let encryptedArray = [cipher.update(data)];
                //encrypted message returns a buffer
            encryptedArray.push( cipher.final());
            return Buffer.concat(encryptedArray);
        },
        //input and output are buffers - symmetrical decryption
            _decryptData:  (encrypted=Buffer.from([0x01,0x02,0x03]))=>{
                
            let init = this.privateMembers.get(this).keyAndVect;
            const decipher = crypto.createDecipheriv('aes256', init.pubKey, init.initVect);
            let decryptedMessage = [decipher.update(encrypted)];
            decryptedMessage.push(decipher.final( ));
            return Buffer.concat(decryptedMessage);
        },

        })    
    }
/*** */
     updateInstanceKey (arg={pubKey:null,initVect:null}) {
      if(!pubKey) {
        throw new Error('Bad crypto key or vector!')
      }
        priv.keyAndVect.pubKey = arg.pubKey;
        priv.keyAndVect.initVect = arg.initVect;
    }

    async generateRandomString (len) {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(len, (err,buf)=>{
                if (err) {reject(err) }
                resolve(buf.toString('hex'));
            })
        });
    }
   
   async generateSymmetricCryptoKey() {
            //get a private member of class
        let priv = this.privateMembers.get(this);
        


    //it will be using for AES256 symm encryption
  //generate a symmetric key  
       let pubKey =  await new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buf) => {
                if (err) { reject(err) }
                 resolve(buf);
              });
        });
            //generate salt
        let salt =  await new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) { reject(err) }
                 resolve(buf);
              });
        });
            //generate IV

        let iv = await  new Promise((resolve, reject) => {
            crypto.pbkdf2(pubKey, salt, 100000, 16, 'sha512', (err, derivedKey)=>{
                if (err) { reject(err) }
                resolve(derivedKey);
            })
        });

            
            //assign to private members
        priv.keyAndVect.pubKey = pubKey;
        priv.keyAndVect.initVect = iv;
        return {status:true, results:{pubKey:pubKey, initVect:iv} };

    }
        //input and output are buffers - symmetrical encription
     symmEncrypt(data=Buffer.from([0x30,0x31,0x32])) {
        
        let init = this.privateMembers.get(this);
        return {status:true, value:init._encryptData(data)};
    } 

        //input and output are buffers - symmetrical decryption
     symmDecrypt(encrypted=Buffer.from([0x01,0x02,0x03])){   
        let init = this.privateMembers.get(this);
       return {status:true, value:init._decryptData(encrypted)};
    }

    async   createPasswordHash (psw="*") {
         const saltRounds = 10;
         return new Promise((resolve, reject) => {
            //*********encoding********
            bcrypt.hash(psw, saltRounds, function(err, hash) {
                if (err) { reject(err) }
                //@RETURN
                resolve({status:true, value:hash});
            });
        });
    }

    async validatePassword (psw="*", hashed="abcd") {
        return new Promise((resolve, reject) => {
            bcrypt.compare(psw, hashed, function(err, result) {
                // result == true
                if(err) { reject(err) }
                resolve ({status:true, value:result});
            });
        });
    }

}