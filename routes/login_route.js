import  express from "express"
import cookieParser from "cookie-parser"
let loginRouter = express.Router();

 loginRouter.use(express.urlencoded({extended:true}));
 loginRouter.use(cookieParser());

 loginRouter.get('/',async (req, res)=>{
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
   
    //redirect to root
    res.redirect('../');
   // res.render('okay.ejs', {time: new Date().toLocaleTimeString()});
})

export {loginRouter as default}