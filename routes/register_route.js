import  express from "express"
import cookieParser from "cookie-parser"
 let registerRouter = express.Router();

 registerRouter.use(express.json({extended:true}));
 registerRouter.use(cookieParser())
 registerRouter.use( (req, res, next)=>{
    console.log(Date.now());
    next();
 })

registerRouter.get('/',async (req,res)=> {
    let cookieAndcaptcha = await registerRouter._layers77
       .registrationLayer.createRegistrationCookieAndCaptcha();
    res.cookie('regisrationInfo',cookieAndcaptcha.results.cookie,{ sameSite: 'None',secure:true });
    res.render('reg.ejs',{val: new Date().toLocaleTimeString(), captcha:cookieAndcaptcha.results.image, userName:"UncleBob", userPassword:"1",userAvatar:"*"})
})

registerRouter.post('/data', async (req, res)=>{
    //let image = new Buffer.from(req.body.clientData,'base64');
    console.log(req.body);
    //is a captcha code correct?
    let checkingCaptcha = await registerRouter._layers77
        .registrationLayer.isRegistrationCookieValid(req.cookies.regisrationInfo, req.body.captcha)
    //*---303 status code: conflict
    if (checkingCaptcha.status) {
        //when a captcha is correct - try to write a new user in the RDBS
        //convert an image avatar
        let avatarImage =   Buffer.from(req.body.usrAvatar,"utf-8");
        //try to register
       let rdbmsResult = await registerRouter._layers77
        .registrationLayer.registerUserInSystem({
                                                 usrName: req.body.usrName,
                                                 password: req.body.usrPassword,
                                                  avatar: avatarImage,
                                                 })
        if (!rdbmsResult.status) {
                //if there is something wrog during RDBMS writing
                //generate a new token and captcha
            let newTokenA = await registerRouter._layers77
                .registrationLayer.createRegistrationCookieAndCaptcha();
            //set a conflict code
            res.status(303);
            //set a new token
            res.cookie('regisrationInfo', newTokenA.results.cookie ,{ sameSite: 'None', secure:true });
            //send a response
            res.json({msg:rdbmsResult.msg});
            return;

        }
        //if the user has been written successfully
        res.clearCookie('regisrationInfo');
        res.status(201);
        res.json({msg:"User has been created successfully!"});
        return;
    } else  {
        //if a captcha isn`t correcct - generate a new token and captcha
        let newToken = await registerRouter._layers77
           .registrationLayer.createRegistrationCookieAndCaptcha();
        res.status(303);
        //set a new token
         res.cookie('regisrationInfo', newToken.results.cookie ,{ sameSite: 'None', secure:true });
         //send a new captcha
        res.json({
                msg: checkingCaptcha.msg,
                image: newToken.results.image,
            });
    }

})

 
export {registerRouter as default}
 //module.exports=routerx;