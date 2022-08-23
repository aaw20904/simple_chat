import  express from "express"
import cookieParser from "cookie-parser"
 let registerRouter = express.Router();

 registerRouter.use(express.json());
 registerRouter.use(cookieParser())
 registerRouter.use( (req, res, next)=>{
    console.log(Date.now());
    next();
 })

registerRouter.get('/',async (req,res)=> {
    let cookieAndcaptcha = await registerRouter._layers77
       .registrationLayer.createRegistrationCookieAndCaptcha();
    res.cookie('regisrationInfo',cookieAndcaptcha.results.cookie,{ sameSite: 'None',secure:true });
    res.render('reg.ejs',{val: new Date().toLocaleTimeString(), captcha:cookieAndcaptcha.results.image, userName:"Bob", userPassword:"1",userAvatar:"*"})
})

registerRouter.post('/data', async (req, res)=>{
    //let image = new Buffer.from(req.body.clientData,'base64');
    console.log(req.body);
    //is a captcha code correct?
    let checkingCaptcha = await registerRouter._layers77
        .registrationLayer.isRegistrationCookieValid(req.cookies.regisrationInfo, req.body.captcha)
    //303 already exists
    if (checkingCaptcha.value) {
        res.status(201)
        res.json({msg:"User has been created successfully!"});
    } else   {
        res.status(303);
        res.json({msg:checkingCaptcha.msg});
    }

})

 
export {registerRouter as default}
 //module.exports=routerx;