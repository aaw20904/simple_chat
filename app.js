const express = require('express');
const mysql = require('mysql2');
const crypto = require('crypto');

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
    console.log(await databaseLayer.writeNewUser({name:'Bill',hashedPassword:'213456',avatar:"abcdefg"}));
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
       //if a username exists
       if (test){
        return {status:'fail',result:'User exists!Please choose an another login'}
       }
       
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
            let dataToUsers = [ [arg.hashedPassword],[arg.avatar]]
            await new Promise((resolve, reject) => {
                db.query(`INSERT INTO users (usrId,usrPassword,usrAvatar) VALUES ((SELECT usrId FORM users_names WHERE usrName ='${arg.name}'), ?,?)`,[dataToUsers],(err,rows)=>{
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
                           
                resolve({status:"succ",result:"User created!"})
            })
        }); 
       
    }

 }


