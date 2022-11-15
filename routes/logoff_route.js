
const  express = require( "express");
const cookieParser = require( "cookie-parser");
 let logoffRouter = express.Router();

module.exports = logoffRouter;
 logoffRouter.use(express.json({extended:true}));
 logoffRouter.use(cookieParser())


logoffRouter.get("/",async (req, res)=>{
  //is a cookie exists?
  let sessioncookie = req.cookies.sessionInfo;
  if (!sessioncookie) {
    res.render('results.ejs',{colorStatus:"text-danger",textStatus:"Error!",reason:"You aren`t in system. Please login", time:new Date().toTimeString()});
    return;
  }
  //decrypt cookie
  let decoded = logoffRouter._layers77.authenticationLayer.readCookie(sessioncookie);
  //if there is something wrong during decryption
  if (!decoded.status) {
    res.render('results.ejs',{colorStatus:"text-danger",textStatus:"Error!",reason:decoded.msg, time:new Date().toTimeString()});
    return;
  }
  //log off
  let logoffResult = await logoffRouter._layers77.authorizeLayer.logoffUser(decoded.results.usrId);
  if (logoffResult.status) {
      res.clearCookie(logoffRouter._layers77.authCookieName);
      res.render('results.ejs',{colorStatus:"text-success", textStatus:"OK!!", reason:'You are log off successfully!', time:new Date().toTimeString()});
  } else {
     res.render('results.ejs',{colorStatus:"text-danger", textStatus:"Error!", reason:decoded.msg, time:new Date().toTimeString()});
  }

}); 

 