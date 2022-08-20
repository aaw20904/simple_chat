import  express from "express"
 
 let router = express.Router();

 router.use( (req, res, next)=>{
    console.log(Date.now());
    next();
 })

router.get('/register',async (req,res)=> {
    res.type("text/plain");
    let hash = await layers77.cryptoLayer.createPasswordHash(new Date().toLocaleTimeString())
    res.send(hash.value);
})
 
export {router as default}
 //module.exports=routerx;