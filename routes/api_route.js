import  express from "express"
 
 let router = express.Router();

 router.use(express.json());
 router.use( (req, res, next)=>{
    console.log(Date.now());
    next();
 })

router.get('/',async (req,res)=> {
    res.render('reg.ejs',{val: new Date().toLocaleTimeString()})
})

router.post('/data', (req, res)=>{
     
    let image = new Buffer.from(req.body.clientData,'base64');
    console.log(image);
    res.end();
})


 
export {router as default}
 //module.exports=routerx;