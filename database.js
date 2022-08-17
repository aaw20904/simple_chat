 export default class DBinterface {
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
    /**read a session_status, locked_status, fail_login_attempts from the DB  */
    //RETURNS {status, result:{session:bool, locked:bool, fail:Number}}
    async readUserShortlyByID (usrID=1) {
         //get a private member of class
         let db = this.privateMembers.get(this);

        return new Promise((resolve, reject) => {
            db.query (`SELECT usrId, failLogins, status FROM users WHERE usrId=?`,[usrID],(err, rows)=>{
                if (err) {
                    reject(err);
                }
                else if (rows.length == 0) {
                    resolve({status:false, result:'User not found'});
                } else {
                    let session = rows[0].status & 0x00000001;
                    let locked =  rows[0].status & 0x00000010;
                    resolve({status:true, result:{usrId: rows[0].usrId, session:Boolean(session), locked:Boolean(locked), fail:rows[0].failLogins}});
                }
                
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

/*******R E M O V E  user message */
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
  /*****set a session to be active */
    async setSessionActive (usrId) {
           //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET status=status|0x00000001 WHERE usrId=?`, [usrId], (err, rows)=>{
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
/****clear a session state (bit0) */
    async clearSessionActive (usrId) {
           //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET status=status&0xFFFFFFFE WHERE usrId=?`, [usrId], (err, rows)=>{
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

    /****write user lock (bit4 ) */
    async setUserLocked (usrId) {
        //get a private member of class
     let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET status=status|0x00000010 WHERE usrId=?`, [usrId], (err, rows)=>{
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

    /****write user lock (bit4 ) */
    async clearUserLocked (usrId) {
        //get a private member of class
     let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET status=status&0xFFFFFFEF WHERE usrId=?`, [usrId], (err, rows)=>{
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

/***increment fail attempts to login */
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
/*****how many times was a fail login? ***/
    async getUserFailLoginAttempts (usrId) {
          //get a private member of class
          let db = this.privateMembers.get(this);
          return new Promise((resolve, reject) => {
              db.query( `SELECT failLogins FROM users WHERE usrId=?`, [usrId], (err, rows)=>{
                  if(err) {
                      reject(err)
                  } else if (rows.length == 0) 
                  {
                      resolve({status:false, result:'User not found!'});
                  } else {
                      resolve({status:true, result:rows[0].failLogins})
                  }
              })
          });
    }


  /***is a user locked? */
    async isUserLocked (usrID) {
         //get a private member of class
         let db = this.privateMembers.get(this);
         return new Promise((resolve, reject) => {
             db.query( `SELECT ((status&0x00000010)>>4) AS status FROM users WHERE usrId=?`, [usrID], (err, rows)=>{
                 if(err) {
                     reject(err)
                 } else if (rows.length == 0) 
                 {
                     resolve({status:false, result:'User not found!'});
                 } else {
                    let rs = (rows[0].status == 1) ? true : false;
                     resolve({status:true, result:rs })
                 }
             })
         });
    }

    async isSessionActive(usrID) {
         //get a private member of class
         let db = this.privateMembers.get(this);
         return new Promise((resolve, reject) => {
             db.query( `SELECT (status&0x00000001) AS status FROM users WHERE usrId=?`, [usrID], (err, rows)=>{
                 if(err) {
                     reject(err)
                 } else if (rows.length == 0) 
                 {
                     resolve({status:false, result:'User not found!'});
                 } else {
                     let rs = (rows[0].status == 1) ? true : false;
                     resolve({status:true, result:rs})
                 }
             })
         });
    }

    /********* get all the messages sort by date ***/


    async getAllTheChat() {
         //get a private member of class
         let db = this.privateMembers.get(this);
         return new Promise((resolve, reject) => {
             db.query( `SELECT * FROM chat.messages order by sent;`, (err, rows)=>{
                 if(err) {
                     reject(err)
                 } else  {
                     /**returns an array of objects-"strings"  */
                     resolve({status:true, result: rows})
                 }
             })
         });
    }
 
    /********** FOR A D M I N ******/
    async getAllUsersWithStatus() {
        //get a private member of class
            let db = this.privateMembers.get(this);
            let sqlQuery = "SELECT usrName, failLogins, CASE WHEN (status&0x00000001) THEN 'active' ELSE 'logoff' END login_state,"+
            "CASE WHEN (status&0x00000010) THEN 'locked' ELSE 'unlocked' END usr_lock  FROM users NATURAL JOIN users_names;";
            return new Promise((resolve, reject) => {
                db.query(sqlQuery,(err,rows)=>{
                    if(err){reject(err)}
                    //[{usrName, failLogins,usr_login,}]
                    resolve({status:true, result:rows});
                })
            });
    }

    
    /******CLEAR fail fogin attempts */
    async clearUserFailLoginAttempts (usrId) {
          //get a private member of class
          let db = this.privateMembers.get(this);
          return new Promise((resolve, reject) => {
              db.query( `UPDATE users SET failLogins=0 WHERE usrId=?`, [usrId], (err, rows)=>{
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
 /**write the  symmetryc key for cookie encryption */
    async updateKey(arg={pubKey:null, initVect:null}) {
        //get a private member of class
        let db = this.privateMembers.get(this);
        try{
            await  new Promise((resolve, reject) => {
                db.query('START TRANSACTION',(err,rows)=>{
                    if (err) { reject(err) }
                    resolve();
                })
            });

            await  new Promise((resolve, reject) => {
                db.query('TRUNCATE sym_keys;',(err,rows)=>{
                    if (err) { reject(err) }
                    resolve();
                })
            });

            await new Promise((resolve, reject) => {
                db.query( `INSERT INTO sym_keys (pubKey, initVect) VALUES (?,?)`, [arg.pubKey, arg.initVect], (err, rows)=>{
                    if (err) {
                        reject(err)
                    } else {
                        resolve({status:true, result:`Updated ${rows.affectedRows} row`})
                    }
                })
            });
       } catch(e) {
        return new Promise((resolve, reject) => {
            db.query('ROLLBACK',(err,rows)=>{
                reject(e);
            })
        });
       }

       return new Promise((resolve, reject) => {
           db.query('COMMIT', (err, rows)=>{
                if (err) { reject(err) }
                resolve( {status:true, result:rows} );
           })
       });


    }

    async readKey () {
        //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query( `SELECT pubKey, initVect FROM sym_keys;`,  (err, rows)=>{
                if(err) {
                    reject(err)
                } else {
                    if(rows.length ==0 ) {
                        resolve({status:false, result:'Empty crypto keys!'})
                    }
                    resolve({status:true, result:rows[0]})
                }
            })
        });
    }

    


 }
 
 