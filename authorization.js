export default class AuthorizationUser {
    constructor (dbInterface, cryptoRoutines, userAuthentication) {
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
        userAuthentication: userAuthentication
       });
    }
   /**authorizate a user and returns a cookie-token
    for the authentication */
    async authorizeUser(usrName="a", password="1") {
      //get private members
      let cryptoInterface  = this.privateMembers.get(this).cryptoProcedures;
      let dbInterface = this.privateMembers.get(this).dbInterface;
      let authentificationInterface = this.privateMembers.get(this).userAuthentication;
      //read info
      let userInfo = await dbInterface.readUserByName(usrName);
     
      if (!userInfo.status) {
         //if user not found-
        return {status:false, msg:"Bad username or password!"}
      }
      //checking a password
      let compareResult = await cryptoInterface.validatePassword(password, userInfo.results.usrPassword.toString('utf-8'))
      if (!compareResult.value ) {
        return {status:false, msg:"Bad username or password!"}
      }
      //if the credantails correct - 
      //generate a cookie
       userInfo.results.token = authentificationInterface.createCookie(userInfo.results.usrId).value;
      //set a session as active
       await dbInterface.setSessionActive(userInfo.results.usrId);
      //returns user data
      return {status:true, msg:'Authorized successfull',results:userInfo.results}

    }

    async logoffUser (usrId=1) {
      let dbInterface = this.privateMembers.get(this).dbInterface;
      let res = await dbInterface.clearSessionActive(usrId)
      return res;
    }
  }