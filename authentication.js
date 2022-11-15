

module.exports =  class UserAuthentication {
    constructor (CryptoProcedures, DBinterface, userConstraints={ //in milliseconds
                                                                AUTH_COOKIE_LIFE_TIME:600000,
                                                                AUTH_COOKIE_UPDATE_THRESHOLD:30000,
                                                                AUTH_FAIL_ATTEMPTS:10,
                                                                }) {
             //making a hide property
         this.privateMembers = new WeakMap();
             //assign a 'private' - it may be an object
        this.privateMembers.set(this, {
             //an instance of the CryptoProcedures class
        cryproProcedures: CryptoProcedures,
        dbInterface:  DBinterface,
        userConstraints: userConstraints,
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
        let encrypted = cryptoProc.symmEncrypt(dataForEncription).value;
        return {status:true, value:encrypted.toString('hex')};
    }

    readCookie (encryptCookie="hex") {
            //get a private member
        let cryptoProc = this.privateMembers.get(this).cryproProcedures;
            //convert to a Buffer
        let encrypted = Buffer.from(encryptCookie,'hex');
        let decrypted;
        try {
             decrypted = cryptoProc.symmDecrypt(encrypted).value;
        } catch(e) {
            return {status:false, msg:e.reason}
        }
            //parse on parts
        let date = Number(decrypted.readBigInt64BE(0));
        let name = decrypted.subarray(8);
        return {status:true, results:{usrId:name.readInt32BE(0), timestamp:date}};
    }
  /***HIGH_LEVEL_METHOD: CONTROL a cookie   */
    async authenticateUserByCookie (arg="123") {
         
        let newCookie = null;
            //get a private member
        let cryptoProc = this.privateMembers.get(this).cryproProcedures;
        let dbInterface = this.privateMembers.get(this).dbInterface;
        let userConstraints = this.privateMembers.get(this).userConstraints;
        if(!arg){
             //RETURTN ->@ C) unauthorized.
            return {status:false, msg:"Cookie is null", error:'NL'}
        }
             //decrypt a token 
        let token = this.readCookie(arg);
            //has a token been correct encrypted?
        if (!token.status) {
            //RETURN - bad encrypted!
             
            return {status:false, msg:'Bad token!', error:"BT"}
        }
            //1)read user info from the DB
        let userInfo = await dbInterface.readUserShortlyByID(token.results.usrId)
            //is a user exists?
        if (!userInfo.status) {
            //RETURTN ->@ C) unauthorized.
            return {status:false, msg:'User not found!', error:'NF'}
        }
             //2)is a user locked?
        if (userInfo.results.locked) {
             //RETURTN ->@ C) unauthorized.
            return {status:false, msg:'User blocked!Please call to the Admin', error:"LK"}
        }
             //3)is a session active?
        if (!userInfo.results.session) {
             //RETURTN ->@ C) unauthorized.
            return {status:false, msg:'Session is closed!', error:"SC"}
        }
            //4)checking a lifetime of the token
       let currentTime = Number(Date.now());
            //calc difference in milliSeconds
       let ellapsed = currentTime - token.results.timestamp;
            //5) has a token`s lifetime gone?
       if (ellapsed > userConstraints.AUTH_COOKIE_LIFE_TIME) {
            //clear sessoin
            await dbInterface.clearSessionActive(token.results.usrId);
            //RETURTN ->@ C) unauthorized.
            return {status: false, msg:'Lifetime has gone!', error:"TD" }
       }
            //6) Has a user achived maximum fail attempts?
        if (userInfo.results.fail > userConstraints.AUTH_FAIL_ATTEMPTS) {
            return {status: false, msg:'Too many fail login attempts!You are cocked! Please call to the Admin', error:"AF" }
        }
            //7) Can a token been updated?
       if (ellapsed > userConstraints.AUTH_COOKIE_UPDATE_THRESHOLD) {
            //generate a new auth cookie
            newCookie = this.createCookie(token.results.usrId).value;
            //RETURN->@ A) authorized, update cokie(token)  needed 
        return {status:true, msg:"Successfully authenticated", results:{ mustUpdated:true, info:userInfo.results, cookie:newCookie}}
       } else {
            //RETURN->@ B) authorized, update cokie(token) not needed 
        return {status:true, msg:"Successfully authenticated", results:{mustUpdated:false, mustUpdated:false, info:userInfo.results} }
       }
        
    }
    ///main procedure high level authentication
    ///when authentication cookie is old - update the one.
    ///when authentication cookie lifetime has gone - redirect to http://domainName/login
    async mainHttpAuthentication (req, res, authCookieName) {
        
    }

}