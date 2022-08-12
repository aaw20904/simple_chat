const express = require('express');
const mysql = require('mysql2');

let app= express();
let databaseLayer = null;
// set the view engine to ejs
app.set('view engine', 'ejs');

    const connectionDB = mysql.createConnection({
        user: 'root',
        password: '65535258',
        host: 'localhost',
        database: 'chat',
        
        /* ssl:{
                ca: fs.readFileSync(...),
                /*You can also connect to a MySQL server
                without properly providing the appropriate CA to trust.
                You should not do this.*/
                //rejectUnauthorized: FALSE,
        // }
            
    
     });
 
 connectionDB.connect( async function(err) {
    if (err) {
        console.error('error SQL connecting: ' + err.stack);
        return;
    }
    databaseLayer = new  DBinterface(connectionDB);
    console.log(await databaseLayer.writeNewUser({name:'vasya'}));
 })


 class DBinterface {

    constructor(conn) {
      //making a hide property
      this.privateMembers = new WeakMap();
      //assign a 'private' - it may be an object
      this.privateMembers.set(this,conn)    
    }
    //a test method
    _getPrivMember() {
        console.log(this.privateMembers.get(this));
    }

    async writeNewUser(arg = {name: '', hashedPassword: '', avatar: null}) {
        let db = this.privateMembers.get(this);
        /*is there a usr in db? */
        let test;
        try{
            test =  await   new Promise((resolve, reject) => {
                db.query('SELECT usrName FROM users_names WHERE usrName=?', [arg.name],(err,rows)=>{
                    if (err) { 
                        reject(err); 
                        }
                    if (rows.length==0){
                        resolve(false)
                    } else
                    resolve(true)
                })
            }); 
        } catch(e) {
            throw new Error(e)
        }

        return test;
    }


 }


