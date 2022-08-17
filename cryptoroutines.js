import crypto from 'crypto';

export default class CryptoProcedures {
    constructor  (dbInst) {
        //making a hide property
      this.privateMembers = new WeakMap();
      let pubKey, initVect;

      //assign a 'private' - it may be an object
      this.privateMembers.set(this, { 
        db:dbInst,
        keyAndVect:{pubKey:0, initVect:0},
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
/***call neccessary to init key and vector.MUST BE call after a constructor  */
    async initInstanceKey () {
        //get a private member
        let priv = this.privateMembers.get(this);
        //read them from the DB
        let result = await priv.db.readKey();
        //asssign
        if (!result.status) {
            throw new Error(result.result)
        }
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

        // save into DB
        let res = await db.updateKey({pubKey:pubKey, initVect:iv});
        //assign to private members
        priv.keyAndVect.pubKey = pubKey;
        priv.keyAndVect.initVect = iv;
        return res.result;

    }
 //input and output are buffers - symmetrical encription
     symmEncrypt(data=Buffer.from([0x30,0x31,0x32])) {
        
        let init = this.privateMembers.get(this);
        return init._encryptData(data);
    } 

 //input and output are buffers - symmetrical decryption
     symmDecrypt(encrypted=Buffer.from([0x01,0x02,0x03])){
               
        let init = this.privateMembers.get(this);
       return init._decryptData(encrypted);
    }


}