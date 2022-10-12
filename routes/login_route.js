import  express from "express"
import cookieParser from "cookie-parser"
let loginRouter = express.Router();

 loginRouter.use(express.urlencoded({extended:true}));
 loginRouter.use(express.json());
 loginRouter.use(cookieParser());

 loginRouter.get('/',async (req, res)=>{
    //assembling an uri
   /* const protocol = req.protocol;
    const host = req.hostname;
    const url = req.originalUrl;
    let thisURL = `${req.protocol}://${req.hostname}${req.originalUrl}`;
    thisURL = new URL(thisURL);
    let urlForReturn = thisURL.searchParams.get('addr');
    //has any request been redirected here as a result authenticate Cookie expiration?
    if(!urlForReturn) {
      urlForReturn = '*';
    }*/
     console.log(req.body);
    //read reference info
    //assign to a cookie
    res.render('login.ejs',{statusColor:"text-success",statusString:"Enter credantails:", usrName:"*"});
 })


loginRouter.post('/data', async (req, res)=>{
    console.log(req.body);
    //req.body.usrName; .usrPassword
    //checking a user
    let usrValidation = await loginRouter._layers77
        .authorizeLayer.authorizeUser(req.body.usrName, req.body.usrPassword);
  
    //when credantails are incorrect
    if (!usrValidation.status) {
         
          res.render('login.ejs',{statusColor: "text-danger", statusString: usrValidation.msg, usrName:req.body.usrName});
         return;
    }
    //when success - assign a cookie
    res.cookie(loginRouter._layers77.authCookieName, usrValidation.results.token, { sameSite: 'None', secure:true });
    //has any URL been saved in cookie?
    let backURL = req.cookies[loginRouter._layers77.lastPageCookie];

   if(!backURL) { 
    //when there isn`t any saved adress - redirect to the root
     backURL = `${req.protocol}://${req.hostname}`
   }
   
    res.redirect(backURL);
    // res.render('okay.ejs', {time: new Date().toLocaleTimeString()});
})

export {loginRouter as default}