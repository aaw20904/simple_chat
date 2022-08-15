const express = require('express');
const mysql = require('mysql2');
const crypto = require('crypto');

const DATABASE_USER='root';
const DATABASE_HOST='localhost';
const DATABASE_PASSWORD='65535258';
const DATABASE_NAME='chat';


let app= express();
let databaseLayer = null;

 
// set the view engine to ejs
app.set('view engine', 'ejs');

    const connectionDB = mysql.createConnection({
        user: DATABASE_USER,
        password: DATABASE_PASSWORD,
        host: DATABASE_HOST,
        database: DATABASE_NAME,
        
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
        process.exit(-1);
        return;
    }
    databaseLayer = new  DBinterface(connectionDB);
     // console.log(await databaseLayer.writeNewUser({name:'Bill',hashedPassword:'213456',avatar:"abcdefg"}) ); 
    //console.log(await databaseLayer.removeUserByID(16));
   // console.log(await databaseLayer.changeUserPasword({usrId:16, password:123546}) );
   /*  console.log(await databaseLayer.addUserMessage({
                                                    usrId:17, 
                                                    msg:"helloword!"
                                                    }));*/
    //console.log( await databaseLayer.removeUserMessage(1) );
    /*console.log( await databaseLayer.editUserMessage({msgId:2,message:'abc'}) );*/
    console.log( await databaseLayer.incrementFailLoginAttempts(17) );

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
/*****C R E A T E a new user */
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
       //if a username exists
       if (test) {
        return {status:false, result:'User exists!Please choose an another login'}
       }
       //if there is all right -  a username is unique:
       try{
            /***start a transaction to save a user info*/
            await new Promise((resolve, reject) => {
                db.query('START TRANSACTION',(err,rows)=>{
                    if (err) { 
                        reject(err); 
                        }
                               
                    resolve(true)
                })
            }); 
            //write a user name 
              await new Promise((resolve, reject) => {
                db.query('INSERT INTO users_names (usrName) VALUES (?)',[arg.name],(err,rows)=>{
                    if (err) { 
                        reject(err); 
                        }
                               
                    resolve(true)
                })
            }); 


            //write a data into users
           let userIdentifier =  await new Promise((resolve, reject) => {
                   db.query(`SELECT usrId FROM users_names WHERE  usrName = '${arg.name}'`,(err,rows)=>{
                    if (err) { 
                        reject(err); 
                        }
                    resolve(rows[0])
                })
            });
            let dataToUsers = [[userIdentifier.usrId], [arg.hashedPassword], [arg.avatar]];
            await new Promise((resolve, reject) => {
                db.query(`INSERT INTO users (usrId,usrPassword,usrAvatar) VALUES (?,?,?)`, dataToUsers, (err,rows)=>{
                    if (err) { 
                        reject(err); 
                        }
                               
                    resolve(true)
                })
            });
        }catch (e) {
            return new Promise((resolve, reject) => {
                db.query('ROLLBACK',(err,rows)=>{
                    if (err) { 
                        reject(err); 
                        }
                               
                    resolve({status:"fail",result:e})
                })
            }); 
        }

        return new Promise((resolve, reject) => {
            db.query('COMMIT',(err,rows)=>{
                if (err) { 
                    reject(err); 
                    }
                           
                resolve({status:true, result:"User created!"})
            })
        }); 
       
    }

    /*******R E M O V I N G  a  user by  I D*/
    async removeUserByID (usrId) {
        //get a private member of class
        let db = this.privateMembers.get(this);

        return new Promise((resolve, reject) => {
            db.query (`DELETE FROM users_names WHERE usrId=${usrId}`,(err, rows)=>{
                if (err) {
                    reject(err);
                }
                else if (rows.affectedRows == 0) {
                    resolve({status:false, result:'Record not found'});
                } else {
                    resolve({status:true, result:`Deleted ${rows.affectedRows} row!`});
                }
                
            })
        });
    }
    /******R E M O V E a user by the name - it will be probably executes  long time  */
    async removeUserByName (name='') {
          //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise(function (resolve, reject) {
            db.query(`DELETE FROM users_names WHERE usrName='${name}'`, (err,rows)=>{
                if (err) {
                    reject(err)
                } 
                else if (rows.affectedRows == 0) {
                    resolve({status:false, result:'Record not found'});
                } else {
                    resolve({status:true, result:`Deleted ${rows.affectedRows} row!`});
                }
            })
        });
    }

/*******************change user`s P A S S W O R D */
    async changeUserPasword (arg={usrId:0,password:123456}) {
        //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET usrPassword=? WHERE usrId=${arg.usrId}`,[arg.password], (err,rows)=>{
                if (err) {
                    reject(err)
                } else {
                    if(rows.changedRows == 0) {
                        resolve({status:false, result:"User not found!"})
                    } else {
                        resolve({startus: true, result:`Successfull updated ${rows.affectedRows} row`})
                    }
                  
                }
            })
        });
    }
   /***add a message **/
    async addUserMessage (arg={usrId:0,msg:'testmessage'}) {
         //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO messages (usrId, message, sent) VALUES (?,?,NOW())', [arg.usrId,arg.msg], (err,rows)=>{
                if(err) {
                    reject(err)
                 }
                 else {
                    resolve({staus:true, result:`Created ${rows.affectedRows} row`});
                 }
            })
        });
    }


    async removeUserMessage (msgId) {
              //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM messages WHERE msgId=?`, [msgId], (err, rows)=>{
                if (err) {
                    reject(err);
                } 
                if(rows.affectedRows == 0) {
                    resolve({status:false, result:'Message not found!'});
                }
                resolve({status:true, result:`Deleted ${rows.affectedRows} rows`});
            })
        });
    }
/***************E D I T  user  M E S S A G E ***************/
    async editUserMessage (arg={msgId:0, message:'***'}) {
              //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE messages SET message=? WHERE  msgId=?`, [arg.message, arg.msgId], (err, rows)=>{
                if (err) {
                    reject(err);
                } 
                if (rows.affectedRows == 0) {
                    resolve({status:false, result:'Message not found!'});
                }
                resolve({status:true, result:`Changed ${rows.affectedRows} rows`});
            })
        });
    }
  /*****set a session state */
    async setSessionStatus (usrId) {
           //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET status=1 WHERE usrId=?`, [usrId], (err, rows)=>{
                if(err) {
                    reject(err)
                } else if (rows.affectedRows == 0) 
                {
                    resolve({status:false, result:'User not found!'});
                } else {
                    resolve({status:true, result:`Updated ${rows.affectedRows} row`})
                }
            })
        });
    }
/****clear a session state */
    async clearSessionStatus (usrId) {
           //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET status=0 WHERE usrId=?`, [usrId], (err, rows)=>{
                if(err) {
                    reject(err)
                } else if (rows.affectedRows == 0) 
                {
                    resolve({status:false, result:'User not found!'});
                } else {
                    resolve({status:true, result:`Updated ${rows.affectedRows} row`})
                }
            })
        });
    }
  


async incrementFailLoginAttempts (usrId) {
           //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query( `UPDATE users SET failLogins=failLogins+1 WHERE usrId=?`, [usrId], (err, rows)=>{
                if(err) {
                    reject(err)
                } else if (rows.affectedRows == 0) 
                {
                    resolve({status:false, result:'User not found!'});
                } else {
                    resolve({status:true, result:`Updated ${rows.affectedRows} row`})
                }
            })
        });
    }

 




 }


