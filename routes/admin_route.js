import  express from "express"
import cookieParser from "cookie-parser"
let adminRouter = express.Router();

adminRouter.use(cookieParser({extended:true}));
adminRouter.use(express.json({extended:true}));


adminRouter.get('/', (req, res)=>{
  res.render('admin.ejs',{date:new Date().toLocaleTimeString()});
})

adminRouter.post('/data',async (req,res)=>{
    let query;
    try {
        query = await adminRouter._layers77
                    .databaseLayer.getAllTheChat();

    } catch(e) {
        res.status(500);
        res.json({error:e})
        return;
    }  
        query.results.forEach(element => {
            element.usrAvatar = element.usrAvatar.toString("utf-8")
        });

        res.status(200);
        res.json(query.results);
  
})


export {adminRouter as default}