import  express from "express"
import cookieParser from "cookie-parser"
let clientRouter = express.Router();
clientRouter.use(cookieParser({extended:true}));
clientRouter.use(express.json({extended:true}));

//**--------checking authentication------- */
clientRouter.use( async function (req, resp, next) {
  console.log(`COOKIES: ${req.cookies.sessionInfo}`);
        next();  
})

clientRouter.get('/', async (req, res)=>{
    //----------
    //set a cookie to coming back 
    res.cookie(clientRouter._layers77.lastPageCookie,`${req.protocol}://${ req.hostname}/client`, {  sameSite: 'None', secure: true });
  /**checking credantails */
  let authResult = await clientRouter._layers77
  .authenticationLayer.authenticateUserByCookie(req.cookies.sessionInfo);
  //has a user been authenticated successfully?
  if (!authResult.status) {
    
    let redirectLoginURI = encodeURI(`${req.protocol}://${ req.hostname}/login/`);//?addr=${req.protocol}://${req.hostname}${req.baseUrl}/&curTime=${new Date().toLocaleTimeString()}`);
    //whe authentication has fail - redirect to LogIn page
    res.redirect(redirectLoginURI);
  } else {
        //when authentication has been passed successfully
    
       //must a cookie been updated?
        if (authResult.results.mustUpdated) {
           //when a cookie must updated
          //set a new cookie value
          res.cookie( clientRouter._layers77.authCookieName, authResult.results.cookie, { sameSite: 'None', secure:true });
        }
        //when success
        res.render('clientinterface.ejs',{status:'text-success',text:'HelloUser!'});
  }
    //----------
})
 ///ITS ONLY FOR DEBUG! It will have been  replaced on WebSocket protocol routes
clientRouter.post("/data",async (req,res)=>{
        //set a cookie to coming back 
        res.cookie(clientRouter._layers77.lastPageCookie,`${req.protocol}://${ req.hostname}/client`, {  sameSite: 'None', secure: true });
    /**checking credantails */
    let authResult = await clientRouter._layers77
    .authenticationLayer.authenticateUserByCookie(req.cookies.sessionInfo);
    //has a user been authenticated successfully?
    if (!authResult.status) {
        
        let redirectLoginURI = encodeURI(`${req.protocol}://${ req.hostname}/login/`);//?addr=${req.protocol}://${req.hostname}${req.baseUrl}/&curTime=${new Date().toLocaleTimeString()}`);
        //whe authentication has fail - redirect to LogIn page
        res.redirect(redirectLoginURI);
    } else {
            //when authentication has been passed successfully
        
        //must a cookie been updated?
            if (authResult.results.mustUpdated) {
            //when a cookie must updated
            //set a new cookie value
            res.cookie( clientRouter._layers77.authCookieName, authResult.results.cookie, { sameSite: 'None', secure:true });
            }
            //when success
            let allChat;
            try{
                allChat = await clientRouter._layers77.databaseLayer.getAllTheChat();
            } catch (e) {

            }
            

    }
})


export {clientRouter as default}