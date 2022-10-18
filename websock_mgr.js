import WebSocket, { WebSocketServer } from 'ws';
/***************************C L A S S  */

  class WebSocketConnectionManager {
    #authenticationLayer;
    #databaseLayer;
    #betheartInterval;
    #betheartIntervalHandle;
    #remoteSockets;
    #webSocketServer;
    #pingScanInterval;


  constructor (databaseLayer, authenticationLayer, port, betheartinterval=10000) {
      this.#databaseLayer = databaseLayer;
      this.#authenticationLayer = authenticationLayer;
        //PING intreval
      this.#pingScanInterval = betheartinterval;
      this.#betheartIntervalHandle = null;
      this.#remoteSockets = new Map();
      this.#webSocketServer = new WebSocketServer({ port: port });
      //connect listeners
    this.#webSocketServer.on('connection',(socket,req)=>this.#onServerConnection(socket, req, this));
    this.#webSocketServer.on('close', function close() {
            clearInterval(this.#betheartInterval);
    });
  }
/**@ when a database has been changed after cleaning 
 it needs to update DOM structure on client side  */
  notifyAllTheClientsToUpdate () {
  
    this.#sendUpdateToClients();
  }

    #sendNet_stToClients = (usrId, online) =>{
     let parcel = {
      command:'net_st',
      usrId:usrId,
      online:online,
     }
      this.#broadcastAllTheSockets(parcel);
    };

    #sendErrorToClient(socket,msg){
      let errorMsg = {
              command: "error",
              status:"false",
              msg:msg,

             } 
             socket.send(JSON.stringify(errorMsg));
             return;
    }
   // events handlers of client 
    
    #onClientGetChat = async (authResult, socket) =>{
       let respMsg = {};
           ///has a user been registered in a broadcast procedure?
           if (! this.#remoteSockets.has(authResult.results.info.usrId)) {
             //sending error message
              this.#sendErrorToClient(socket,"You hasn`t subscribed yet!");
              return;
           }
           //get all the chat 
           let chatMessages; 
           try {
                chatMessages = await this.#databaseLayer.getAllTheChat();
                
                //get network_status of a client
                chatMessages.results.forEach(elem=>{
                  ///!! translate blob to utf-8 string
                  elem.usrAvatar = elem.usrAvatar.toString('utf-8');
                  //is a user in network?
                  if (this.#remoteSockets.has(elem.usrId)){
                    elem.online = true;
                  } else {
                    elem.online = false;
                  }
                }) 
                let respBody = {
                  command: "get_chat",
                  data: chatMessages.results,
                }
                socket.send(JSON.stringify(respBody));

           } catch (e) {
            this.#sendErrorToClient(socket,"Inernal server error!");
           }

    }

    #onClientSendMsg = async (authResult, socket, arg) =>{
        try{
        ///has a user been registered in a broadcast procedure?
           if (! this.#remoteSockets.has(authResult.results.info.usrId)) {
             //sending error message
              //sending error message
              this.#sendErrorToClient(socket,"You hasn`t subscribed yet!");
             return;
           }
          //write an incomming message into the DB
          let resultWrite = await this.#databaseLayer.addUserMessage({usrId:authResult.results.info.usrId, msg:arg.message}); 
          //read user data - for a broadcast message 
          let usrAvatarAndName = await this.#databaseLayer.readUserNameAndAvatar(authResult.results.info.usrId);
          // <<PROTOCOL FEATURES>> a message for broadcasting
          let brdcMsg = {
              usrName: usrAvatarAndName.usrName, 
              message: arg.message, 
              msgId: resultWrite.msgId,
              command: 'br_cast',
              usrAvatar: usrAvatarAndName.usrAvatar.toString('utf8'),
              sent: resultWrite.sent,
            }
          
          //when success - start broadcasting
          this.#broadcastAllTheSockets( brdcMsg);
        }catch (e) {
          this.#sendErrorToClient(socket,`Internal server error ${e}`);
        }
    }

    #onClientRegistr = async (authResult, socket) => {
      let respMessage = {};
       ///has a user been registered in a broadcast procedure?
           if ( this.#remoteSockets.has(authResult.results.info.usrId)) {
             //sending error message
              //sending error message
              this.#sendErrorToClient(socket,"You have  already subscribed!");
             return;
           }
        let resultOp = this.#addRemoteClient({id:authResult.results.info.usrId, socket:socket});
            // respond to network
            respMessage.msg = resultOp.msg;
            respMessage.status = resultOp.status;
            respMessage.command = 'registr';
            socket.send(JSON.stringify(respMessage));
             //notify all the clients that the client (usrId) has been connected
            this.#sendNet_stToClients(authResult.results.info.usrId, true);
            return;
    }




    //add a new client to #remoteSockets list by Id
    #addRemoteClient = (arg={id:null, socket:{}}) => {
     let key = Number(arg.id)|0;
      if (!key) {
        throw new Error('BAD identifier!')
      } else if ( this.#remoteSockets.has(key)) {
        return {status:false, msg: 'User has been already registered!'};
      }
        arg.socket.idOfClient456 = arg.id;
        this.#remoteSockets.set(key,arg.socket);
        return {status:true, msg:"Added"}
    };
    //assign a new key:value pair to the weakMap;
    #hasRemoteClientBeenRegistered = (id)=>{
        return this.#remoteSockets.has(id);
    };

    #removeRemoteClient = (arg={id:null})=>{
      let key = Number(arg.id)|0;
      if (!key) {
        throw new Error('BAD identifier!')
      }
      this.#remoteSockets.delete(key);
    };

    #sendMessageToRemoteClient = (arg={id:null, msg:{}}) =>{
     let key = Number(arg.id)|0;
      if (!key) {
        throw new Error('BAD identifier!')
      }
      let clientWebSock = this.#remoteSockets.get(Number(arg.id)|0);
      if (!clientWebSock) {
        return {status:false, msg:'Client not found!'};
      }
      clientWebSock.send(JSON.stringify(arg.msg));
      return {status:true}; 
    };
      //notify all the members to update data from the server
    #sendUpdateToClients = () =>{//sendUpdateToClients
      let msgQuery = {
        command:'update',
      }
      //starting broadcast
      this.#broadcastAllTheSockets(msgQuery);
    }
   ///QERIES BROKER PROCEDURE

    #clientInterfaceQueries = async (arg={
            command: 'string',
            data: 'any',
            cookie: 'number_as_hex_string',
            status: true, 
            msg: "srting",
            resultCode: 1
         }, socket=null) =>{
         ///checking a user
         //A) Is a user in system?
             let authResult = await this.#authenticationLayer.authenticateUserByCookie(arg.cookie);
        //has a user been authorized fail?
             if (!authResult.status) {
        //respond with fail status
                  socket.send(JSON.stringify({status:false, msg:authResult.msg, command:'login'})); 
                  return;
             }
        //when authorized successfully
        //response message
              let respMessage = {status:true, cookie:null};
        //Must a cookie be updated?
               ///when a cookie must updatet - notify the sender of te message
            if (authResult.results.mustUpdated) {
              let parcel = {command:'ticket',cookie:authResult.results.cookie}
              socket.send(JSON.stringify(parcel));
            }
            /***main handler - choose an action in according to a client comand */
      switch (arg.command) {
        case 'registr':         
            this.#onClientRegistr(authResult, socket);
             
            break;
        case 'send_msg':
            this.#onClientSendMsg(authResult, socket, arg);
            break;
        case 'get_chat':
            this.#onClientGetChat(authResult, socket);
            break;
            ///It`s only TEST route, not using
        case 'echo':
            console.log( this.#sendMessageToRemoteClient({ id: arg.data, 
                              msg: {time: new Date().toLocaleTimeString()}
                            }) );
            break;
            default:
            return {status:false, msg:'bad API command!'};
      }
      return {status: true, msg:'OK'};
    };


  //#interval;
  #onServerConnection = (socket, req)=> {
     // (B1) SEND MESSAGE TO CLIENT
          socket.send(JSON.stringify({command:"conn", 
          msg:`Welcome! ${new Date().toLocaleTimeString()}`}));
          socket.isAlive = true;
          socket.on('pong', this.#socketOnHeartbeat);
          socket.on('message',(msg)=>this.#socketOnMessage(msg,socket));
          socket.on('close',(code,reason)=>this.#socketOnClose(code,reason,socket));
      ///starting PING/PONG
        this.#betheartIntervalHandle = setInterval(this.#onPingInterval, this.#pingScanInterval);

    };

    #onServerClose = ()=> {
      clearInterval(this.#betheartIntervalHandle);
      console.log('server closed..')
    };

    #socketOnHeartbeat = (socket) => {
      console.log(`beat: ${new Date().toLocaleTimeString()}`)
      socket.isAlive = true;
    };

    #socketOnMessage= async (msg, socket)=> {
            let message = msg.toString(); // MSG IS BUFFER OBJECT
            message = JSON.parse(message);
           

            //socket.send(`OK ->> ${Date.now().toString('10')}`, ()=>console.log('sent!'));
            let disconnectReason
          /*  for (let y of  this.#webSocketServer.clients) {
                //websocket.readyState code meaning:
                //1 	OPEN 	The connection is open and ready to communicate.
                //2 	CLOSING 	The connection is in the process of closing.
                //3 	CLOSED 	The connection is closed or couldn't be opened.
                console.log(`Socket readyState ${y.readyState}`);
                //при разрыве сетевого соединения (не закрывая браузер)
                //подключение остается.Мало того добавляется новые сокеты 
            }*/
            
            this.#clientInterfaceQueries(message,socket);
           // console.log( this.#webSocketServer.clients);
            console.log(message);
    };

    #socketOnClose= (code, reason,socket)=> {
      //
      let usrId = socket.idOfClient456;
      /**when a remote client had been disconnected or network connection had been broken: */
        console.log(`Socket readyState: ${socket.readyState}`);
      //delete from list
        if (socket.idOfClient456) {
          this.#removeRemoteClient({id:socket.idOfClient456});
        }
      //notify all the clients that the client (usrId) has been disconnected
        this.#sendNet_stToClients(usrId, false);
        console.log(code);
        console.log(reason);
    };
//@msgData - it is an object with avatar, userMessage e.t.c
    #broadcastAllTheSockets = async (msgData) =>{
          this.#remoteSockets.forEach((value,key)=>{
            console.log(`broadcast to User ${key} `);
            value.send(JSON.stringify(msgData));
        })
    }


    #onPingInterval= ()=> {
      
          this.#webSocketServer.clients.forEach(function each(ws) {
                if (ws.isAlive === false) {
                  console.log('Connection closed!');
                  return ws.terminate();
                }
                // ws.isAlive = false;
                  ws.ping();
                });
    }

 
}

export {WebSocketConnectionManager as default}


/*let _onServerConnection = (socket, req)=> {
     // (B1) SEND MESSAGE TO CLIENT
        socket.send("Welcome!");
        socket.isAlive = true;
        socket.on('pong', _socketOnHeartbeat);
        socket.on('message',(msg)=>_socketOnMessage(msg,socket));
        socket.on('close',(code,reason)=>_socketOnClose(code,reason));
    }

    let _onServerClose = ()=> {
      clearInterval(this._betheartInterval);
     console.log('server closed..')
    }

   let  _socketOnHeartbeat= (socket) =>{
      console.log(`beat: ${new Date().toLocaleTimeString()}`)
      socket.isAlive = true;
    }

   let  _socketOnMessage= (msg, socket)=> {
            let message = msg.toString(); // MSG IS BUFFER OBJECT
            socket.send(`OK ->> ${Date.now().toString('10')}`, ()=>console.log('sent!'));
            
            for (let y of  this._webSocketServer.clients) {
                this._sockcets.push(y);
                console.log(y.readyState);
                //при разрыве сетевого соединения (не закрывая браузер)
                //подключение остается.Мало того добавляется новые сокеты 
            }
            console.log( this._webSocketServer.clients);
            console.log(message);
    }

    let   _socketOnClose= (code, reason)=> {
      console.log(code);
      console.log(reason);
    }
     */