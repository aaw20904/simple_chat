import  express from "express"
import cookieParser from "cookie-parser"
let adminRouter = express.Router();

adminRouter.use(cookieParser({extended:true}));
adminRouter.use(express.json({extended:true}));


adminRouter.get('/', (req, res)=>{
  res.render('admin.ejs',{status:'text-success',text:''});
})

adminRouter.get('/usercontrol', (req, res)=>{
  res.render('admin_usr.ejs',{status:'text-success',text:'***'});
})

adminRouter.post('/command', async (req,res)=>{
    
    switch (req.body.command) {
        //locking user
        case 'lock':
          try {
               let result = await adminRouter._layers77
                        .databaseLayer.setUserLocked(req.body.data);
                if (result.status) {
                    res.json({status:true, msg:result.msg})
                    return;
                } else {
                    res.json({status:false, msg:result.msg})
                    return
                }
          } catch (e) {
            res.status(500);
            res.end();
          }
        break;
        //unlocking user
        case 'unlock':
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
        break;
        //remove user
        case 'delete':
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
        break;
        //clear fail attempts 
        case 'clear':
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
        break;
        //remove a message
        case 'delmsg':
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
        break;
        //update a symmetric key
          case 'key':
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
            break;
          //remove messages older that
            case 'remold':
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
            break;
            case 'cln_opt':
            try {
                 
                //try to update
              let result = await adminRouter._layers77
                            .databaseLayer.updateCleanOptions({period:Number(req.body.period)|0, enable:Number(req.body.enable)|0})
                if (result.status) {
                  res.json({status:true, msg: result.msg})
                }
              } catch (e) {
                 res.json({status:false, msg:e});
                 return;
              }
            break;
            case 'sv_cln':
            try {
              let result = await adminRouter._layers77
                        .databaseLayer.saveCleanOptions({
                          cln_period: req.body.data.cln_period,
                          cln_threshold: req.body.data.cln_threshold,
                          cln_start: req.body.cln_start,
                          service_stat: req.body.service_stat,
                          cln_period_unit: req.body.cln_period_unit,
                          cln_threshold_unit: req.body.cln_threshold_unit
                        });
              if (result.status) {
                res.json({status:true, msg:result.results.affectedRows})
              }
            } catch(e) {
              res.json({status:false, msg:e})

            }
            break;
        default:
        res.status(400);
        res.end();
    }
})

adminRouter.post('/data',async (req,res)=>{
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