const  express = require( "express");
const cookieParser = require( "cookie-parser");
 let pswChangeRouter = express.Router();

module.exports = pswChangeRouter;
 pswChangeRouter.use(express.urlencoded({extended:true}));
 pswChangeRouter.use(cookieParser());
 pswChangeRouter.use( (req, res, next)=>{
    console.log(Date.now());
    next();
 })

 pswChangeRouter.get('/', (req,res)=>{
     
    res.render('password_change.ejs',{statusColor:"text-success",statusString:"Enter credantails:", usrName:"*"});
    
 })

 pswChangeRouter.post('/data', async (req,res)=>{
     console.log(req.body);
    //req.body.usrName; .usrPassword
    //checking a user
    let usrValidation = await pswChangeRouter._layers77
        .authorizeLayer.authorizeUser(req.body.usrName, req.body.usrPasswordOld);
   
    //when credantails are incorrect
    if (!usrValidation.status) {
        
         res.render('password_change.ejs',{statusColor: "text-danger", statusString: usrValidation.msg, usrName:req.body.usrName});
         return;
    }
    try {
        //when credantails are correct - generate a new hash password
        let newHashedPassword = await  pswChangeRouter._layers77
                .cryptoLayer.createPasswordHash(req.body.usrPasswordNew);
        //save the one
        let saveStatus =  pswChangeRouter._layers77
                .databaseLayer.changeUserPasword({usrId:usrValidation.results.usrId, password:newHashedPassword.value});
    } catch(e) {
        //when exception 
        res.status(500);
        res.render('results.ejs',{time:'', colorStatus:'text-danger',textStatus:'Internal server error!', reason:e});
        return;

    }
        //clear a cookie
    res.clearCookie(pswChangeRouter._layers77.authCookieName);
        //redirect to root
    res.render('psw_change_ok.ejs',{date: new Date().toString()});
        // res.render('okay.ejs', {time: new Date().toLocaleTimeString()});
 })

  