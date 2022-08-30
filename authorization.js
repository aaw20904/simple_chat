export default class AuthorizationUser {
    constructor (dbInterface, cryptoRoutines, userAuthentication, userConstraints) {
          //making a hide property
        this.privateMembers = new WeakMap();
          //assign a 'private' - it may be an object
        this.privateMembers.set(this, {
          //an instance of the CryptoProcedures class
          //instances off:
          //class CryptoProcedures
        cryptoProcedures: cryptoRoutines,
          //class DBinterface
        dbInterface:  dbInterface,
          //class UserAuthentication
        userAuthentication: userAuthentication,
        //max attempts 
        
         userConstraints: userConstraints,
       });
    }
   /**authorizate a user and returns a cookie-token
    for the authentication */
    async authorizeUser(usrName="a", password="1") {
      //get private members
      let cryptoInterface  = this.privateMembers.get(this).cryptoProcedures;
      let dbInterface = this.privateMembers.get(this).dbInterface;
      let authentificationInterface = this.privateMembers.get(this).userAuthentication;
      let userConstraints = this.privateMembers.get(this).userConstraints;
    
      //reading user info
      let userInfo = await dbInterface.readUserByName(usrName);
     
      if (!userInfo.status) {
         //if user not found-
        return {status:false, msg:"Bad username or password!", results:null}
      }
      
      //checking a password, maximum fail logins attempts of a user and  'is a user locked?'
      let compareResult = await cryptoInterface.validatePassword(password, userInfo.results.usrPassword.toString('utf-8'))
        if (!compareResult.value ) {
          //when a password is wrong:
          //C H E C K I NG:
          //a)Is a user locked?
           if (userInfo.results.locked) {
             //return an error
                  return {ststus:false, msg:'You are locked!Please call to the Admministrator',results:null};
           }

          //b) has a fail attempt limit been achived?
          if (userInfo.results.failLogins > userConstraints.AUTH_FAIL_ATTEMPTS) {
            //lock a user
                await  dbInterface.setUserLocked(userInfo.results.usrId);
            //return an error
              return {ststus:false, msg:'You are locked!Please call to the Admministrator',results:null};
          } 
          ///when a password is wrong (and wrong login limit isn`t exceed) - increment fail attempts
              await dbInterface.incrementFailLoginAttempts(userInfo.results.usrId);
            
          return {status:false, msg:"Bad an username or a password!", results:userInfo.results.usrId}
        }
      //if the credantails correct - 
      //generate a cookie
       userInfo.results.token = authentificationInterface.createCookie(userInfo.results.usrId).value;
      //set a session as active
       await dbInterface.setSessionActive(userInfo.results.usrId);
      //returns user data
      return {status:true, msg: 'Authorized successfull', results: userInfo.results}

    }

    async logoffUser (usrId=1) {
      let dbInterface = this.privateMembers.get(this).dbInterface;
      let res = await dbInterface.clearSessionActive(usrId)
      return res;
    }
  }