
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
    async writeNewUser(arg = {name: '', hashedPassword: '', avatar: Buffer.from([0x01,0x02])}) {
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
        return {status:false, msg:'User exists!Please choose an another login'}
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
                               
                    resolve({status:false,msg:'DB error', error:e})
                })
            }); 
        }

        return new Promise((resolve, reject) => {
            db.query('COMMIT',(err,rows)=>{
                if (err) { 
                    reject(err); 
                    }
                           
                resolve({status:true, msg:"User created!"})
            })
        }); 
       
    }
    /**read a session_status, locked_status, fail_login_attempts from the DB  */
    //RETURNS {status, results:{session:bool, locked:bool, fail:Number}}
    async readUserShortlyByID (usrID=1) {
         //get a private member of class
         let db = this.privateMembers.get(this);

        return new Promise((resolve, reject) => {
            db.query (`SELECT usrId, failLogins, usrStatus FROM users WHERE usrId=?`,[usrID],(err, rows)=>{
                if (err) {
                    reject(err);
                }
                else if (rows.length == 0) {
                    resolve({status:false, msg:'User not found'});
                } else {
                    let session = rows[0].usrStatus & 0x00000001;
                    let locked =  rows[0].usrStatus & 0x00000010;
                    resolve({status:true, results:{usrId: rows[0].usrId, session:Boolean(session), locked:Boolean(locked), fail:rows[0].failLogins}});
                }
                
            })
        });
    }

    /*****read user info by the Name */
    async readUserByName (name="Petya") {
         //get a private member of class
         let db = this.privateMembers.get(this);

        return new Promise((resolve, reject) => {
            db.query (`SELECT usrName, usrId, usrPassword,usrAvatar, failLogins, usrStatus FROM users_names NATURAL JOIN users WHERE usrName=?`,[name],(err, rows)=>{
                if (err) {
                    reject(err);
                }
                else if (rows.length == 0) {
                    resolve({status:false, msg:'User not found'});
                } else {
                    let ref = rows[0];
                    let result = {
                            usrName:ref.usrName,
                            usrId:ref.usrId,
                            usrPassword:ref.usrPassword,
                            usrAvatar:ref.usrAvatar,
                            failLogins:ref.failLogins,
                            locked:Boolean((ref.usrStatus & 0x00000010)),
                            login:Boolean((ref.usrStatus & 0x00000001)),
                        }
                  
                    resolve({status:true, results:result});
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
                    resolve({status:false, msg:'Record not found'});
                } else {
                    resolve({status:true, msg:`Deleted ${rows.affectedRows} row!`});
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
                    resolve({status:false, msg:'Record not found'});
                } else {
                    resolve({status:true, msg:`Deleted ${rows.affectedRows} row!`});
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
                        resolve({status:false, msg:"User not found!"})
                    } else {
                        resolve({startus: true, msg:`Successfull updated ${rows.affectedRows} row`})
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
                    resolve({staus:true, msg:`Created ${rows.affectedRows} row`});
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
                    resolve({status:false, msg:'Message not found!'});
                }
                resolve({status:true, msg:`Deleted ${rows.affectedRows} rows`});
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
                    resolve({status:false, msg:'Message not found!'});
                }
                resolve({status:true, msg:`Changed ${rows.affectedRows} rows`});
            })
        });
    }
  /*****set a session to be active */
    async setSessionActive (usrId) {
           //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET usrStatus=usrStatus|0x00000001 WHERE usrId=?`, [usrId], (err, rows)=>{
                if(err) {
                    reject(err)
                } else if (rows.affectedRows == 0) 
                {
                    resolve({status:false, msg:'User not found!'});
                } else {
                    resolve({status:true, msg:`Updated ${rows.affectedRows} row`})
                }
            })
        });
    }
/****clear a session state (bit0) */
    async clearSessionActive (usrId) {
           //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET usrStatus=usrStatus&0xFFFFFFFE WHERE usrId=?`, [usrId], (err, rows)=>{
                if(err) {
                    reject(err)
                } else if (rows.affectedRows == 0) 
                {
                    resolve({status:false, msg:'User not found!'});
                } else {
                    resolve({status:true, msg:`Updated ${rows.affectedRows} row`})
                }
            })
        });
    }

    /****write user lock (bit4 ) */
    async setUserLocked (usrId) {
        //get a private member of class
     let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET usrStatus=usrStatus|0x00000010 WHERE usrId=?`, [usrId], (err, rows)=>{
                if(err) {
                    reject(err)
                } else if (rows.affectedRows == 0) {
                    resolve({status:false, msg:'User not found!'});
                } else {
                    resolve({status:true, msg:`Updated ${rows.affectedRows} row`})
                }
            })
        });
    }

    /****write user lock (bit4 ) */
    async clearUserLocked (usrId) {
        //get a private member of class
     let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET usrStatus=usrStatus&0xFFFFFFEF WHERE usrId=?`, [usrId], (err, rows)=>{
                if(err) {
                    reject(err)
                } else if (rows.affectedRows == 0) 
                {
                    resolve({status:false, msg:'User not found!'});
                } else {
                    resolve({status:true, msg:`Updated ${rows.affectedRows} row`})
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
                    resolve({status:false, msg:'User not found!'});
                } else {
                    resolve({status:true, msg:`Updated ${rows.affectedRows} row`})
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
                      resolve({status:false, msg:'User not found!'});
                  } else {
                      resolve({status:true, value:rows[0].failLogins})
                  }
              })
          });
    }


  /***is a user locked? */
    async isUserLocked (usrID) {
         //get a private member of class
         let db = this.privateMembers.get(this);
         return new Promise((resolve, reject) => {
             db.query( `SELECT ((usrStatus&0x00000010)>>4) AS usrStatus FROM users WHERE usrId=?`, [usrID], (err, rows)=>{
                 if(err) {
                     reject(err)
                 } else if (rows.length == 0) 
                 {
                     resolve({status:false, msg:'User not found!'});
                 } else {
                    let rs = (rows[0].usrStatus == 1) ? true : false;
                     resolve({status:true, value:rs })
                 }
             })
         });
    }

    async isSessionActive(usrID) {
         //get a private member of class
         let db = this.privateMembers.get(this);
         return new Promise((resolve, reject) => {
             db.query( `SELECT (usrStatus&0x00000001) AS usrStatus FROM users WHERE usrId=?`, [usrID], (err, rows)=>{
                 if(err) {
                     reject(err)
                 } else if (rows.length == 0) 
                 {
                     resolve({status:false, msg:'User not found!'});
                 } else {
                     let rs = (rows[0].usrStatus == 1) ? true : false;
                     resolve({status:true, value:rs})
                 }
             })
         });
    }

    /********* get all the messages sort by date ***/


    async getAllTheChat() {
         //get a private member of class
         let db = this.privateMembers.get(this);
         return new Promise((resolve, reject) => {
             db.query( `SELECT usrName, usrId, msgId, message, sent, usrAvatar FROM messages NATURAL JOIN users_names NATURAL JOIN users ORDER BY messages.sent`, (err, rows)=>{
                 if (err) {
                     reject(err)
                 } else  {
                     /**returns an array of objects-"strings"  */
                     resolve({status:true, results:rows})
                 }
             })
         });
    }
 
    /********** F O R  A D M I N ******/
    async getAllUsersWithStatus() {
        //get a private member of class
            let db = this.privateMembers.get(this);
            let sqlQuery = "SELECT usrAvatar ,usrName, usrId, failLogins,  CASE WHEN (usrStatus&0x00000001) THEN true ELSE false END login_state,"+
            "CASE WHEN (usrStatus&0x00000010) THEN true ELSE false END usr_lock  FROM users NATURAL JOIN users_names;";
            return new Promise((resolve, reject) => {
                db.query(sqlQuery,(err,rows)=>{
                    if(err){reject(err)}
                    //[{usrName, failLogins,usr_login,}]
                    resolve({usrStatus:true, results:rows});
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
                      resolve({status:false, msg:'User not found!'});
                  } else {
                      resolve({status:true, msg:`Updated ${rows.affectedRows} row`})
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
                        resolve({status:true, msg:`Updated ${rows.affectedRows} row`})
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
                resolve( {status:true, results:rows} );
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
                        resolve({status:false, msg:'Empty crypto keys!'})
                    }
                    resolve({status:true, results:rows[0]})
                }
            })
        });
    }

    async removeOlderThat (seconds = 10) {
        //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query( `DELETE  FROM messages WHERE  (UNIX_TIMESTAMP( NOW() ) - unix_timestamp(sent)) > ${seconds}`,  (err, rows)=>{
                if(err) {
                    reject(err)
                } else {
                    resolve({status:true, msg:`Deleted : ${rows.affectedRows} rows`});
                }
            })
        });
    }
   /*
    async updateCleanOptions (arg={period:24, enable:(1|0)}) {
        //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query( `UPDATE  clean_mode SET cln_period=${arg.period}, cln_en=${arg.enable} WHERE pk=16;`,  (err, rows)=>{
                if(err) {
                    reject(err)
                } else {
                    resolve({status:true, msg:`Updated : ${rows.affectedRows} rows`});
                }
            })
        });
    }*/

    async getCleanOptions () {
          //get a private member of class
        let db = this.privateMembers.get(this);
        return new Promise((resolve, reject) => {
            db.query( `SELECT * FROM  clean_mode;`,  (err, rows)=>{
                if(err) {
                    reject(err)
                } else {
                    resolve({status:true, results:rows[0]});
                }
            })
        });
    }

    async saveCleanOptions (opts={
                    cln_period:1,
                    cln_threshold:10,
                    cln_start:'15:40',
                     
                    cln_period_unit:0,
                    cln_threshold_unit:0,

            }){
                        //get a private member of class
                let db = this.privateMembers.get(this);
                

                return new Promise((resolve, reject) => {
                    db.query( `INSERT INTO clean_mode (pk, cln_period, cln_threshold, cln_start, cln_period_unit, cln_threshold_unit)`+
                    `VALUES (16, ${opts.cln_period},${opts.cln_threshold},${opts.cln_start},${opts.cln_period_unit},${opts.cln_threshold_unit})`+
                    `ON DUPLICATE KEY UPDATE   cln_period=${opts.cln_period}, cln_threshold=${opts.cln_threshold}, `+
                    ` cln_start=${opts.cln_start}, cln_period_unit=${opts.cln_period_unit},`+
                    `cln_threshold_unit=${opts.cln_threshold_unit} `,  (err, rows)=>{
                        if(err) {
                            reject(err)
                        } else {
                            resolve({status:true, results:rows});
                        }
                    })
                });


    }

    


 }
 
 