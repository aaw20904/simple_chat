import WebSocket, { WebSocketServer } from 'ws';
/***************************C L A S S  */
  class WebSocketConnectionManager {
  #betheartInterval;
  #sockcets;
  #webSocketServer;
  //#interval;
  #onServerConnection = (socket, req)=> {
     // (B1) SEND MESSAGE TO CLIENT
        socket.send("Welcome!");
        socket.isAlive = true;
        socket.on('pong', this.#socketOnHeartbeat);
        socket.on('message',(msg)=>this.#socketOnMessage(msg,socket));
        socket.on('close',(code,reason)=>this.#socketOnClose(code,reason));

      this.#betheartInterval = setInterval(()=> {
        this.#webSocketServer.clients.forEach(function each(ws) {
              if (ws.isAlive === false) {
                console.log('Connection closed!');
                return ws.terminate();
              }
               // ws.isAlive = false;
                ws.ping();
              });
      }, 3000);

    

    };

    #onServerClose = ()=> {
      clearInterval(this.#betheartInterval);
     console.log('server closed..')
    };

    #socketOnHeartbeat = (socket) => {
      console.log(`beat: ${new Date().toLocaleTimeString()}`)
      socket.isAlive = true;
    };

    #socketOnMessage= (msg, socket)=> {
            let message = msg.toString(); // MSG IS BUFFER OBJECT
            socket.send(`OK ->> ${Date.now().toString('10')}`, ()=>console.log('sent!'));
            
            for (let y of  this.#webSocketServer.clients) {
                this.#sockcets.push(y);
                console.log(y.readyState);
                //при разрыве сетевого соединения (не закрывая браузер)
                //подключение остается.Мало того добавляется новые сокеты 
            }
            console.log( this.#webSocketServer.clients);
            console.log(message);
    };

    #socketOnClose= (code, reason)=> {
      console.log(code);
      console.log(reason);
    };

 constructor (port) {
    this.#betheartInterval = null;
    this.#sockcets = [];
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




    _onPingInterval= ()=> {
    this._webSocketServer.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            }); 
    }

 
}

export {WebSocketConnectionManager as default}