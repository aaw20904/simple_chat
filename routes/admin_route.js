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
            case 'remold':
              
              try {
                //converting to seconds
                let seconds = req.body.data * 86400;
                //try o clean
              let result = await adminRouter._layers77
                            .databaseLayer.removeOlderThat(req.body.data);
                if (result.status) {
                  res.json({status:true, msg: result.msg})
                }
              } catch (e) {
                 res.json({status:false, msg:e});
                 return;
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
        }
    
    } catch(e) {
        res.status(500);
        res.json({error:e})
        return;
    }  
  
})


export {adminRouter as default}