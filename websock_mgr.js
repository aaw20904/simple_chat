import WebSocket, { WebSocketServer } from 'ws';
/***************************C L A S S  */
////PROTOCOL - common format of data exchange between remote client and WS server////

/**
 * A) CLIENT - > SERVER
 * {
 *    command: 'string',
 *    data: any,
 *    cookie: number_as_hex_string,
 *    status: NULL|string|Number, 
 * }
 * 
 * B) SERVER -> CLIENT
 * {
 *    command:'string',
 *    data: any,
 *    cookie: number_as_hex_string | NULL,
 *    status: 'string',
 *    msg: 'string' 
 * } 
 */

  class WebSocketConnectionManager {
    #authenticationLayer;
    #databaseLayer;
    #betheartInterval;
    #betheartIntervalHandle;
    #remoteSockets;
    #webSocketServer;
    #pingScanInterval;
    //add a new client to #remoteSockets list by Id
    #addRemoteClient = (arg={id:null, socket:{}}) => {
     let key = Number(arg.id)|0;
      if (!key) {
        throw new Error('BAD identifier!')
      } else if ( this.#remoteSockets.has(key)) {
        return {status:false,msg: 'User has been already registered!'};
      }
        arg.socket.idOfClient456 = arg.id;
        this.#remoteSockets.set(key,arg.socket);
        return {status:true}
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
   ///
    #clientInterfaceQueries = (arg={command:null,  data:"", socket:null}) =>{
      switch(arg.command) {
        case 'registr':
                
        console.log(this.#addRemoteClient({id:arg.data, socket:arg.socket}));
        break;
        case 'chatmsg':
        break;
        case 'echo':
        console.log( this.#sendMessageToRemoteClient({
                        id:arg.data, 
                           msg:{time:new Date().toLocaleTimeString()}
                         }) );
        break;
        default:
        return {status:false, msg:'bad API command!'};
      }
      return {status:true,msg:'OK'};
    };


  //#interval;
  #onServerConnection = (socket, req)=> {
     // (B1) SEND MESSAGE TO CLIENT
          socket.send("Welcome!");
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

    #socketOnMessage= (msg, socket)=> {
            let message = msg.toString(); // MSG IS BUFFER OBJECT
            socket.send(`OK ->> ${Date.now().toString('10')}`, ()=>console.log('sent!'));
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
            let messageFromRemote = JSON.parse(msg);
            messageFromRemote.socket = socket;
            this.#clientInterfaceQueries({
                        command: messageFromRemote.command,
                        data: messageFromRemote.data,
                        socket: socket
            });
           // console.log( this.#webSocketServer.clients);
            console.log(message);
    };

    #socketOnClose= (code, reason,socket)=> {
      //
      /**when a remote client had been disconnected or network connection had been broken: */
      console.log(`Socket readyState: ${socket.readyState}`);
      //delete from list
      if (socket.idOfClient456) {
         this.#removeRemoteClient({id:socket.idOfClient456});
      }
     
      console.log(code);
      console.log(reason);
    };

 constructor (databaseLayer,authenticationLayer,port) {
     this.#databaseLayer = databaseLayer;
     this.#authenticationLayer = authenticationLayer;
  //PING intreval
    this.#pingScanInterval = 5000;
    this.#betheartIntervalHandle = null;
    this.#remoteSockets = new Map();
    this.#webSocketServer = new WebSocketServer({ port: port });
    //connect listeners
    this.#webSocketServer.on('connection',(socket,req)=>this.#onServerConnection(socket, req, this));
    this.#webSocketServer.on('close', function close() {
            clearInterval(this.#betheartInterval);
    });
    
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