
import  express from "express"
import cookieParser from "cookie-parser"
let adminRouter = express.Router();

adminRouter.use(cookieParser({extended:true}));
adminRouter.use(express.json({extended:true}));

//**--------checking authentication------- */
adminRouter.use( async function (req, resp, next) {
  console.log(`COOKIES: ${req.cookies.sessionInfo}`);
 
        next();  
    

})

/*functions for converting */
adminRouter.convertTimeToInteger = (timeToConv)=>{
        let result=0;
        let substrings = timeToConv.split(':');
        //minuts
        result = Number(substrings[1])|0;
        ///hours
        result |= ((Number(substrings[0])|0) << 6);
        return result;
}

adminRouter.convertIntegerToTime = (intToConv) =>{
        let hours = (intToConv & 0xfc0) >> 6;
        let minutes = intToConv & 0x3f;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
}
/********  USERS r o u t e*****/
adminRouter.get('/users', async(req,res)=>{
  
  //set a cookie to coming back 
    res.cookie(adminRouter._layers77.lastPageCookie,`${req.protocol}://${ req.hostname}/admin/users`, {  sameSite: 'None', secure: true });
  /**checking credantails */
  let authResult = await adminRouter._layers77
  .authenticationLayer.authenticateUserByCookie(req.cookies.sessionInfo);
  //has a user been authenticated successfully?
  if (!authResult.status) {
    
    let redirectLoginURI = encodeURI(`${req.protocol}://${ req.hostname}/login/`);//?addr=${req.protocol}://${req.hostname}${req.baseUrl}/&curTime=${new Date().toLocaleTimeString()}`);
    //whe authentication has fail - redirect to LogIn page
    res.redirect(redirectLoginURI);
  } else {
        //when authentication has been passed successfully
         //is a user admin?
       if ( authResult.results.info.usrId !== adminRouter._layers77.administratorId) {
          //when he/she isn`t - goes away!
          res.status(403);
          res.render('okay.ejs',{status:'text-danger',description:'please log in as administrator!',time: new Date().toLocaleTimeString(),msg:"Forbidden!"});
          return;
       }
       //must a cookie been updated?
        if (authResult.results.mustUpdated) {
           //when a cookie must updated
          //set a new cookie value
          res.cookie( adminRouter._layers77.authCookieName, authResult.results.cookie, { sameSite: 'None', secure:true });
        }
        //when success
        res.render('admin_usr.ejs',{status:'text-success',text:'User`s Admin panel'});
  }
})
/*******ROOT r o u t e */
adminRouter.get('/', async (req, res)=>{
  //set a cookie to coming back 
    res.cookie(adminRouter._layers77.lastPageCookie,`${req.protocol}://${ req.hostname}/admin/`, {  sameSite: 'None', secure: true });
  /**checking credantails */
  let authResult = await adminRouter._layers77
  .authenticationLayer.authenticateUserByCookie(req.cookies.sessionInfo);
  //has a user been authenticated successfully?
  if (!authResult.status) {
    //when fail
    let redirectLoginURI = encodeURI(`${req.protocol}://${ req.hostname}/login/`);//?addr=${req.protocol}://${req.hostname}${req.baseUrl}/&curTime=${new Date().toLocaleTimeString()}`);
    //whe authentication has fail - redirect to LogIn page
    res.redirect(redirectLoginURI);
  } else {
        //when authentication has been passed successfully
         //is a user admin?
       if ( authResult.results.info.usrId !== adminRouter._layers77.administratorId) {
          //when he/she isn`t - goes away!
          res.status(403);
          res.render('okay.ejs',{status:'text-danger',description:'please log in as administrator!',time: new Date().toLocaleTimeString(),msg:"Forbidden!"});
          return;
       }
       //must a cookie been updated?
        if (authResult.results.mustUpdated) {
           //when a cookie must updated
          //set a new cookie value
          res.cookie( adminRouter._layers77.authCookieName, authResult.results.cookie, { sameSite: 'None', secure:true });
        }
        //when success
        res.render('admin.ejs',{status:'text-success',text:''});
  }
  
})

 /*********COMMAND r o u t e */

adminRouter.post('/command', async (req,res)=>{
  //on command server handlers
  let onCln_goCommand = async (req,res) =>{
    let result;
    try {
        //has a service been started?
        result = await adminRouter._layers77.databaseLayer.readAutoCleanStatus();
        if (result.results.running === true) {
          //when a sheduler already running
          res.json({status:false,msg:"The scheduler has been already running!"});
          return;
        }
        result = await adminRouter._layers77.databaseLayer.writeAutoCleanStatus();
    } catch (e) {
      res.json({status:false, msg: e})
    }
     res.json({status:true, msg:"Service started successfully!"});
      
    
  }

  let onCln_stopCommand = async (req, res) =>{
     let result;
    try {
        //has a service been started?
           result = await adminRouter._layers77.databaseLayer.readAutoCleanStatus();
        if (result.results.running === false) {
          //when a sheduler already running
          res.json({status:false,msg:"The scheduler has been already stopped!"});
          return;
        }
        result = await adminRouter._layers77.databaseLayer.clearAutoCleanStatus();
    } catch (e) {
      res.json({status:false, msg: e})
    }
     res.json({status:true, msg:'SERVER:Auto Clean Process stopped!'})
  }

  let onLockCommand = async (req,res) =>{
    //is a user admin?
       if ( (Number(req.body.data)|0)  === adminRouter._layers77.administratorId) {
          //Admin can`t lock himself! 
          res.json({status:false,msg:'Admin can`t lock himself'});
          return;
       }
          try {//try to lock a user
               let result = await adminRouter._layers77
                        .databaseLayer.setUserLocked(req.body.data);
                if (result.status) {
                  //when success
                    res.json({status:true, msg:result.msg})
                    return;
                } else {
                  //when fail
                    res.json({status:false, msg:result.msg})
                    return
                }
          } catch (e) {
            res.status(500);
            res.end();
          }

  }

  let onUnlockCommand = async (req,res) =>{
     //is a user admin?
        if ( (Number(req.body.data)|0)  === adminRouter._layers77.administratorId) {
        //Admin can`t lock himself! 
        res.json({status:false,msg:'Admin can`t lock himself'});
        return
        }
             try {
              let  result = await adminRouter._layers77
                        .databaseLayer.clearUserLocked(req.body.data);
                if (result.status) {
                    res.json({status:true, msg:result.msg})
                    return
                } else {
                    res.json({status:false, msg:result.msg})
                    return
                }
          } catch (e) {
            res.status(500);
            res.end();
          }
  }

  let onDeleteCommand = async (req,res) =>{
    //is a user admin?
     if ( (Number(req.body.data)|0)  === adminRouter._layers77.administratorId) {
        //Admin can`t lock himself! 
        res.json({status:false,msg:'Admin can`t delete himself'});
        return
     }
             try {
              let  result = await adminRouter._layers77
                        .databaseLayer.removeUserByID(req.body.data);
                if (result.status) {
                    res.json({status:true, msg:result.msg})
                    return
                } else {
                    res.json({status:false, msg:result.msg})
                    return
                }
          } catch (e) {
            res.status(500);
            res.end();
          }
  }

  let onDelmsgCommand = async (req,res) =>{
     try{
             let  result = await adminRouter._layers77
                        .databaseLayer.removeUserMessage(req.body.data);
              if (result.status) {
                  res.json({status:true, msg:result.msg})
                  return
              } else {
                  res.json({status:false, msg:result.msg})
                  return
              }
          } catch(e) {
            res.status(500);
            res.end();
          }
  }

  let onClearCommand = async (req,res) =>{
     try {
              let  result = await adminRouter._layers77
                        .databaseLayer.clearUserFailLoginAttempts(req.body.data);
                if (result.status) {
                    res.json({status:true, msg:result.msg})
                    return
                } else {
                    res.json({status:false, msg:result.msg})
                    return
                }
          } catch (e) {
            res.status(500);
            res.end();
          }
  }

  let onRemoldCommand = async (req,res) =>{
      try {
                //there can be seconds!
                let cleanPeriodInSeconds = Number(req.body.data);
                //try o clean
              let result = await adminRouter._layers77
                            .databaseLayer.removeOlderThat(cleanPeriodInSeconds);
                if (result.status) {
                  res.json({status:true, msg: result.msg})
                }
              } catch (e) {
                 res.json({status:false, msg:e});
                 return;
              }
  }

  let onClnoptCommand = async (req,res) =>{
      // req.body.data.cln_start = adminRouter.convertTimeToInteger(req.body.data.cln_start);
       req.body.data.cln_start = `${req.body.data.cln_start}:00`;
            try {
              let result = await adminRouter._layers77
                        .databaseLayer.saveCleanOptions({
                          cln_period: req.body.data.cln_period,
                          cln_threshold: req.body.data.cln_threshold,
                          cln_start: req.body.data.cln_start,
                          service_stat: req.body.data.service_stat,
                          cln_period_unit: req.body.data.cln_period_unit,
                          cln_threshold_unit: req.body.data.cln_threshold_unit
                        });
              if (result.status) {
                res.json({status:true, msg:`Updated ${result.results.affectedRows} row`})
              }
            } catch(e) {
              res.json({status:false, msg:e.message})

            }
  }

  let onKeyCommand = async (req, res) => {
      try{
                let key = await adminRouter._layers77
                           .cryptoLayer.generateSymmetricCryptoKey();
                let recordStatus = await adminRouter._layers77
                            .databaseLayer.updateKey(key.results);
                let decorationString = await adminRouter._layers77
                  .cryptoLayer.generateRandomString(8);
                if (recordStatus.status) {
                    res.json({status:true, msg:'Key updated successfully!', value:decorationString});
                    return;
                }
                    res.json({status:false, msg:recordStatus.msg});
                    return;
                           
             } catch(e){
                 res.json({status:false, msg:e});
                 return;
            }
  }


    /**checking credantails */
  let authResult = await adminRouter._layers77
      .authenticationLayer.authenticateUserByCookie(req.cookies.sessionInfo);
      //authenticateUserByCookie() => @ {status:true , results:{ mustUpdated:true, info:userInfo.results, cookie:newCookie}
    //has a user authenticated successfull?
  if (!authResult.status) {
    //when forbidden
    let redirectLoginURI = encodeURI(`${req.protocol}://${ req.hostname}/login/`);//?addr=${req.protocol}://${req.hostname}${req.baseUrl}/&curTime=${new Date().toLocaleTimeString()}`);
    res.status(403);
    res.end();
    return;
  }  
  //when a user has been authenticatied successfully
   //is a user admin?
       if ( authResult.results.info.usrId !== adminRouter._layers77.administratorId) {
          //when he/she isn`t - goes away!
          res.status(403);
          return;
       }
     //must a cookie been updated?
    if (authResult.results.mustUpdated) {
        //update  cookie
      res.cookie( adminRouter._layers77.authCookieName, authResult.results.cookie, { sameSite: 'None', secure:true });
    }
       
         
  
    switch (req.body.command) {
        //locking user
        case 'lock':
           onLockCommand (req, res);
            break;
        //unlocking user
        case 'unlock':
            onUnlockCommand (req, res);
        break;
        //remove user
        case 'delete':
            onDeleteCommand (req, res);
        break;
        //clear fail attempts 
        case 'clear':
            onClearCommand (req, res);
        break;
        //remove a message
        case 'delmsg':
           onDelmsgCommand (req, res);
        break;
        //update a symmetric key
        case 'key':
            onKeyCommand (req, res);  
        break;
          //remove messages older that
        case 'remold':
            onRemoldCommand (req, res);     
        break;
           
        case 'cln_opt':
            //save all the clean options to DB
            //convert time to integer
            onClnoptCommand (req, res);
        break;

        case 'cln_go':
             ///on start auto-clean scheduler
                onCln_goCommand(req, res);
                
        break;
        case 'cln_stop':
              //on stop auto-clean scheduler
              onCln_stopCommand(req, res);
        break;
        case 'debug':
        ////ONLY FOR DEBUG
             console.log(req.body);
             res.json({time:new Date().toLocaleTimeString()});
        break;
        default:
        res.status(400);
        res.end();
    }
})
 /*********DATA r o u t e  */
adminRouter.post('/data',async (req,res)=>{

  let authResult = await adminRouter._layers77
  .authenticationLayer.authenticateUserByCookie(req.cookies.sessionInfo);
  //has a user authenticated successfull?
  if (!authResult.status) {
    let redirectLoginURI = encodeURI(`${req.protocol}://${ req.hostname}/login/`);//?addr=${req.protocol}://${req.hostname}${req.baseUrl}/&curTime=${new Date().toLocaleTimeString()}`);
    //set a cookie to come back after authorization
    res.status(403);
    res.end();
  }  
  //when success
   //is a user admin?
       if ( authResult.results.info.usrId !== adminRouter._layers77.administratorId) {
          //when he/she isn`t - goes away!
          res.status(403);
          return;
       }
     
  if(authResult.results.mustUpdated){
      //when a cookie must updated
    //set a new cookie value
    res.cookie( adminRouter._layers77.authCookieName, authResult.results.cookie, { sameSite: 'None', secure:true });
  }
    let queryChat, queryUsers;
    try {
        switch (req.body.command) {
          //get info about users
            case'users':
              queryUsers = await adminRouter._layers77
                      .databaseLayer.getAllUsersWithStatus();
                      //convert two strings
                      queryUsers.results.forEach(element => {
                          element.usrAvatar = element.usrAvatar.toString("utf-8")
                      });
              res.status(200);
              res.json({status:true, value:queryUsers.results});
            break;
            //get all the chat mesages
            case 'chat':
              queryChat = await adminRouter._layers77
                      .databaseLayer.getAllTheChat();
                      //convert to strings
                      queryChat.results.forEach(element => {
                          element.usrAvatar = element.usrAvatar.toString("utf-8")
                      });
              res.status(200);
              res.json({status: true, value:queryChat.results});
            break;
            //get clean options
            case 'cln_opt':
               queryChat = await adminRouter._layers77
                      .databaseLayer.getCleanOptions();
              
              if (queryChat.results) {
                //cut seconds
                queryChat.results.cln_start = queryChat.results.cln_start.slice(0,5);
                //convert integer to time
                // queryChat.results.cln_start = adminRouter.convertIntegerToTime(queryChat.results.cln_start);
              }
              
               res.status(200);
               res.json({status:true, results:queryChat.results});
            break;
            default:
            res.status(400);
            res.end();
        }
    
    } catch(e) {
        res.status(500);
        res.json({error:e})
        return;
    }  
  
})


export {adminRouter as default}