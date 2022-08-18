//in mSeconds
const AUTH_COOKIE_LIFE_TIME = 36000;
const AUTH_COOKIE_UPDATE_THRESHOLD = 1800;
export default class UserAuthentication {
    constructor (CryptoProcedures, DBinterface) {
        //making a hide property
      this.privateMembers = new WeakMap();
      //assign a 'private' - it may be an object
      this.privateMembers.set(this, {
        //an instance of the CryptoProcedures class
        cryproProcedures: CryptoProcedures,
        dbInterface:  DBinterface,
       });
    }

    createCookie (usrId=1) {
        //get a private member
        let cryptoProc = this.privateMembers.get(this).cryproProcedures;
        //get current date in ms
        let currentTime = BigInt( Date.now());
        //allocate a Buffer
        let bufDate = Buffer.allocUnsafe(8);
        //convert a Number to a Buffer
        bufDate.writeBigInt64BE(BigInt(currentTime),0);
        //convert a usrId to a Buffer
        let bufUsrId = Buffer.allocUnsafe(4);
        bufUsrId.writeInt32BE(usrId);
        //concat
        let dataForEncription = [bufDate];
        dataForEncription.push(bufUsrId);
        dataForEncription = Buffer.concat(dataForEncription);
        let encrypted = cryptoProc.symmEncrypt(dataForEncription);
        return encrypted.toString('hex');
    }

    readCookie (encryptCookie="hex") {
        //get a private member
        let cryptoProc = this.privateMembers.get(this).cryproProcedures;
        //convert to a Buffer
        let encrypted = Buffer.from(encryptCookie,'hex');
        let decrypted = cryptoProc.symmDecrypt(encrypted);
        //parse on parts
        let date = Number(decrypted.readBigInt64BE(0));
        let name = decrypted.subarray(8);
        return {usrId:name.readInt32BE(0), timestamp:date};
    }
  /***HIGH_LEVEL_METHOD: CONTROL a cookie   */
    async authenticateUserByCookie (arg="123") {
        let newCookie = null;
        //get a private member
        let cryptoProc = this.privateMembers.get(this).cryproProcedures;
        let dbInterface = this.privateMembers.get(this).dbInterface;
        if(!arg){
             //RETURTN ->@ C) unauthorized.
            return {status:false,result:{msg:"Cookie is null",sw:'NL'}}
        }
        //decrypt a token 
        let token = this.readCookie(arg);
        //1)read user info from the DB
        let userInfo = await dbInterface.readUserShortlyByID(token.usrId)
        //is a user exists?
        if (!userInfo.status) {
            //RETURTN ->@ C) unauthorized.
            return {status:false, result:{msg:'User not found!',sw:'NF'}}
        }
        //2)is a user locked?
        if (userInfo.result.locked) {
             //RETURTN ->@ C) unauthorized.
            return {status:false, result:{msg:'User blocked!Please call to the Admin',sw:"LK"}}
        }
        //3)is a session active?
        if (!userInfo.result.session) {
             //RETURTN ->@ C) unauthorized.
            return {status:false, result:{msg:'Session is closed!',sw:"SC"}}
        }
       //4)checking a lifetime of the token
       let currentTime = Number(Date.now());
       //calc difference in milliSeconds
       let ellapsed = currentTime - token.timestamp;
       //5) has a token`s lifetime gone?
       if (ellapsed > AUTH_COOKIE_LIFE_TIME) {
            //clear sessoin
            await dbInterface.clearSessionActive(token.usrId);
            //RETURTN ->@ C) unauthorized.
            return {status: false, result:{msg:'Lifetime has gone!',sw:"TD"} }
       }
       //6) Can a token been updated?
       if (ellapsed > AUTH_COOKIE_UPDATE_THRESHOLD) {
        //generate a new auth cookie
        newCookie = this.createCookie(token.usrId)
        //RETURN->@ A) authorized, update cokie(token)  needed 
        return {status:true, result:{msg:"Successfully authenticated ", mustUpdated:true, info:userInfo.result, cookie:newCookie}}
       } else {
        //RETURN->@ B) authorized, update cokie(token) not needed 
        return {status:true, result:{msg:"Successfully authenticated", mustUpdated:false, info:userInfo.result} }
       }
        
    }



}