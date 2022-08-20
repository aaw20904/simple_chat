export default class UserRegistration {
    constructor(cryptoProcedures, dbInterface) {
       //making a hide property
        this.privateMembers = new WeakMap();
        //assign a 'private' - it may be an object
        this.privateMembers.set(this, {
          cryptoProc: cryptoProcedures,
          dbInterface: dbInterface,
         })
    }
  
   createRegistrationCookieAndCaptcha() {
      let cryptoProc = this.privateMembers.get(this).cryptoProc;
      //generate a Captcha
      let captcha = svgCaptcha.create({size:6, noise:2})
      //captca contains {text:...,data:...}
      //get a data
      let timestamp = BigInt(Date.now());
      let mainBuffer = [Buffer.allocUnsafe(8)];
      //write a timestamp into the array as a Buffer
      mainBuffer[0].writeBigUInt64BE(timestamp);
      //write a string into an Array as a Buffer
      mainBuffer.push(Buffer.from(captcha.text));
      //glue data 
      //#FORMAT:   8 BYTES-TIMESTAMP|6 BYTES-TEXT_CAPTCHA
      mainBuffer = Buffer.concat(mainBuffer);
      //encrypt
      let cookie = cryptoProc.symmEncrypt(mainBuffer);
      //convert to a string
      cookie = cookie.value.toString('hex');
      return {status:true, results:{ cookie:cookie, 
                                     image:captcha.data,
                                     text:captcha.text } }; 
  
    }
  
    async isRegistrationCookieValid (cookie="*", enteredText="*") {
        const CAPTCHA_TOKEN_LIFETIME = 60000;
        let cryptoProc = this.privateMembers.get(this).cryptoProc;
        //decrypt, convert plain text to Buffer 
        let decrypted;
        try{
          decrypted = cryptoProc.symmDecrypt(Buffer.from(cookie,"hex")).value;
        } catch (e) {
          //when a bad encrypted token
          return { status:false, value:false, msg:e.reason }
        }
        
        //get a timestamp
        let timestamp = decrypted.readBigInt64BE(0);
        //how many time has gone since a cookie has been created?
        let ellapsed = Number(Date.now()) - Number(timestamp);
        if(ellapsed > CAPTCHA_TOKEN_LIFETIME) {
          return{status:true, value:false, msg:"Too many time has gone! Try again"}
        }
        //get a string
        let text = decrypted.slice(8);
        text = text.toString('utf-8');
        //compare 
        if (text.localeCompare(enteredText) === 0) {
           return {status:true, value:true }
        } else {
          return {status:true, value:false , msg:"Wrong captcha code!"}
        }     
    }
  
    async registerUserInSystem(arg={usrName:"*", password:"*", avatar:Buffer.from([0x01, 0x02, 0x03])}) {
      let cryptoProc = this.privateMembers.get(this).cryptoProc;
      let dbInterface = this.privateMembers.get(this).dbInterface;
      let recorded;
      try{
        //hash a password 
        let hashed = await cryptoProc.createPasswordHash(arg.password);
        //try to write in the DB
         recorded = await dbInterface.writeNewUser({name:arg.usrName, hashedPassword: hashed.value, avatar:arg.avatar}); 
      }catch(e){
        return {status:false, msg:"Internal server error", err:e}
      }
      //if there an error
      if(!recorded.status) {
        return {status:false, msg:recorded.msg}
      }
      return {status:true, msg:"user registered successfully!"}
  
    }
  
  }