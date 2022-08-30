import  express from "express"
import cookieParser from "cookie-parser"
let adminRouter = express.Router();

adminRouter.use(cookieParser({extended:true}));
adminRouter.use(express.json({extended:true}));


adminRouter.get('/', (req, res)=>{
  res.render('admin.ejs',{date:new Date().toLocaleTimeString()});
})

adminRouter.post('/data',async (req,res)=>{
    let queryChat, queryUsers;
    try {
        queryChat = await adminRouter._layers77
                    .databaseLayer.getAllTheChat();
        queryUsers = await adminRouter._layers77
                    .databaseLayer.getAllUsersWithStatus();

    } catch(e) {
        res.status(500);
        res.json({error:e})
        return;
    }  
       //convert to strings
        queryChat.results.forEach(element => {
            element.usrAvatar = element.usrAvatar.toString("utf-8")
        });

        queryUsers.results.forEach(element => {
            element.usrAvatar = element.usrAvatar.toString("utf-8")
        });
        

        res.status(200);
        res.json({chat:queryChat.results, users:queryUsers.results});
  
})


export {adminRouter as default}