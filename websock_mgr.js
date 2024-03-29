const WebSocketServer = require('ws').WebSocketServer;
const createServer =  require('https').createServer;
const fs =  require('fs');
/***************************C L A S S  ******/

 module.exports =  class WebSocketConnectionManager {


  constructor (databaseLayer, authenticationLayer, port, betheartinterval=10000, server=null) {
       
  /**------ */
  //create a private member object-container
      let pmVar = {
        databaseLayer:databaseLayer,
        authenticationLayer: authenticationLayer,
        pingScanInterval:betheartinterval,
        betheartIntervalHandle: null,
        remoteSockets:new Map(),
        //declare and activate a WEB Socket server
        webSocketServer: new WebSocketServer({server}),

          sendNet_stToClients: (usrId, online) =>{
              let parcel = {
                command:'net_st',
                usrId:usrId,
                online:online,
              }
            pmVar.broadcastAllTheSockets(parcel);
          },

            sendErrorToClient: (socket,msg)=>{
              let errorMsg = {
                      command: "error",
                      status:"false",
                      msg:msg,
                    } 
              socket.send(JSON.stringify(errorMsg));
              return;
          },

            // events handlers from a client`s requests  

          onClientGetChat: async (authResult, socket) =>{
            let respMsg = {};
                ///has a user been registered in a broadcast procedure?
                if (! pmVar.remoteSockets.has(authResult.results.info.usrId)) {
                  //sending error message
                    pmVar.sendErrorToClient(socket,"You hasn`t subscribed yet!");
                    return;
                }
                //get all the chat 
                let chatMessages; 
                try {
                      chatMessages = await pmVar.databaseLayer.getAllTheChat();
                      //get network_status of a client
                      chatMessages.results.forEach(elem=>{
                        ///!! translate blob to utf-8 string
                        elem.usrAvatar = elem.usrAvatar.toString('utf-8');
                        //is a user in network?
                        if (pmVar.remoteSockets.has(elem.usrId)){
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
                  pmVar.sendErrorToClient(socket,`Inernal server error! ${e}`);
                }

          },

          onClientSendMsg: async (authResult, socket, arg) =>{
              try{
              ///has a user been registered in a broadcast procedure?
                if (! pmVar.remoteSockets.has(authResult.results.info.usrId)) {
                  //sending error message
                    //sending error message
                    pmVar.sendErrorToClient(socket,"You hasn`t subscribed yet!");
                  return;
                }

                //had  a user been locked?
                let isLocked = await pmVar.databaseLayer.isUserLocked(authResult.results.info.usrId);
                if(isLocked.value){
                  pmVar.sendErrorToClient(socket,"You are locked!Please call to admin!");
                  return;
                }

                
                //write an incomming message into the DB
                let resultWrite = await pmVar.databaseLayer.addUserMessage({usrId:authResult.results.info.usrId, msg:arg.message}); 
                //read user data - for a broadcast message 
                let usrAvatarAndName = await pmVar.databaseLayer.readUserNameAndAvatar(authResult.results.info.usrId);
                // <<PROTOCOL FEATURES>> a message for broadcasting
                let brdcMsg = {
                    usrName: usrAvatarAndName.usrName, 
                    message: arg.message, 
                    usrId: authResult.results.info.usrId,
                    msgId: resultWrite.msgId,
                    command: 'br_cast',
                    usrAvatar: usrAvatarAndName.usrAvatar.toString('utf8'),
                    sent: resultWrite.sent,
                  }
                
                //when success - start broadcasting
                pmVar.broadcastAllTheSockets( brdcMsg);
              }catch (e) {
                pmVar.sendErrorToClient(socket,`Internal server error ${e}`);
              }
          },

          onClientRegistr: async (authResult, socket) => {
            let respMessage = {};
            ///has a user been registered in a broadcast procedure?
                if ( pmVar.remoteSockets.has(authResult.results.info.usrId)) {
                  //sending error message
                    //sending error message
                    pmVar.sendErrorToClient(socket,"You have  already subscribed!");
                  return;
                }
              let resultOp = pmVar.addRemoteClient({id:authResult.results.info.usrId, socket:socket});
                  // respond to network
                  respMessage.msg = resultOp.msg;
                  respMessage.status = resultOp.status;
                  respMessage.command = 'registr';
                  socket.send(JSON.stringify(respMessage));
                  //notify all the clients that the client (usrId) has been connected
                  pmVar.sendNet_stToClients(authResult.results.info.usrId, true);
                  return;
          },

              //add a new client to #remoteSockets list by Id
          addRemoteClient: (arg={id:null, socket:{}}) => {
            let key = Number(arg.id)|0;
              if (!key) {
                throw new Error('BAD identifier!')
              } else if ( pmVar.remoteSockets.has(key)) {

                return {status:false, msg: 'User has been already registered!'};
              }
                arg.socket.idOfClient456 = arg.id;
                pmVar.remoteSockets.set(key,arg.socket);
                console.log('\x1b[33m%s\x1b[0m', `Register a user ${key} in LIST`)
                return {status:true, msg:"Added"}
          },

                //assign a new key:value pair to the weakMap;
          hasRemoteClientBeenRegistered: (id)=>{
              return pmVar.remoteSockets.has(id);
          },

          removeRemoteClient: (arg={id:null})=>{
              let key = Number(arg.id)|0;
              if (!key) {
                throw new Error('BAD identifier!')
              }
              pmVar.remoteSockets.delete(key);
              console.log('\x1b[33m%s\x1b[0m', `Remove a user ${key} from the LIST`);
          },

          sendMessageToRemoteClient: (arg={id:null, msg:{}}) =>{
            let key = Number(arg.id)|0;
              if (!key) {
                throw new Error('BAD identifier!')
              }
              let clientWebSock = pmVar.remoteSockets.get(Number(arg.id)|0);
              if (!clientWebSock) {
                return {status:false, msg:'Client not found!'};
              }
              clientWebSock.send(JSON.stringify(arg.msg));
              return {status:true}; 
          },

                //notify all the members to update data from the server
          sendUpdateToClients: () =>{//sendUpdateToClients
              let msgQuery = {
                command:'update',
              }
              //starting broadcast
              pmVar.broadcastAllTheSockets(msgQuery);
          },

            ///QERIES BROKER PROCEDURE

          clientInterfaceQueries: async (arg={
                  command: 'string',
                  data: 'any',
                  cookie: 'number_as_hex_string',
                  status: true, 
                  msg: "srting",
                  resultCode: 1
              }, socket=null) =>{
              ///checking a user
              //A) Is a user in system?
                  let authResult = await pmVar.authenticationLayer.authenticateUserByCookie(arg.cookie);
              //has a user been authorized fail?
                  if (!authResult.status) {
                      //has a user been locked?
                      if (authResult.error == 'LK') {
                        //when locked
                        socket.send(JSON.stringify({status:false, msg:authResult.msg, command:'error'})); 
                        return;
                      }
                    //responding with a fail status
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
                  pmVar.onClientRegistr(authResult, socket);
                  
                  break;
              case 'send_msg':
                  pmVar.onClientSendMsg(authResult, socket, arg);
                  break;
              case 'get_chat':
                  pmVar.onClientGetChat(authResult, socket);
                  break;
                  ///It`s only TEST route, not using
              case 'echo':
                  console.log( pmVar.sendMessageToRemoteClient({ id: arg.data, 
                                    msg: {time: new Date().toLocaleTimeString()}
                                  }) );
                  break;
                  default:
                  return {status:false, msg:'bad API command!'};
            }
            return {status: true, msg:'OK'};
          },

                //#interval;
          onServerConnection: (socket, req)=> {
            let xadr = socket._socket.address();
            console.log('\x1b[33m%s\x1b[0m', `A new client ${JSON.stringify(xadr)} has been connected to WS server`)
                  socket.send(JSON.stringify({command:"conn", 
                  msg:`Welcome! ${new Date().toLocaleTimeString()}`}));
                  socket.cntOfTimeouts = 0|0;
                  socket.isAlive = true;
                  socket.on('pong', pmVar.socketOnHeartbeat);
                  socket.on('message',(msg)=>pmVar.socketOnMessage(msg,socket));
                  socket.on('close',(code,reason)=>pmVar.socketOnClose(code,reason,socket));
            },

          onServerClose: ()=> {
            clearInterval(pmVar.betheartIntervalHandle);
            console.log('server closed..')
          },

          socketOnHeartbeat: (socket) => {
            console.log(`pong->: ${new Date().toLocaleTimeString()}`)
            socket.isAlive = true;
            socket.cntOfTimeouts = 0;
          },

          socketOnMessage: async (msg, socket)=> {
              let message = msg.toString(); // MSG IS BUFFER OBJECT
              message = JSON.parse(message);          
              pmVar.clientInterfaceQueries(message,socket);
              console.log(message);
          },

          socketOnClose: (code, reason,socket)=> {
            //
            let usrId = socket.idOfClient456;
            /**when a remote client had been disconnected or network connection had been broken: */
              console.log(`Socket readyState: ${socket.readyState}`);
            //delete from list
              if (socket.idOfClient456) {
                pmVar.removeRemoteClient({id:socket.idOfClient456});
              }
            //notify all the clients that the client (usrId) has been disconnected
              pmVar.sendNet_stToClients(usrId, false);
              //debog info
              let xadr = socket._socket.address();
              console.log('\x1b[33m%s\x1b[0m', `A client ${JSON.stringify(xadr)} has been disconnected from WS server: ${reason}, ${code}`);
          },

          //@msgData - it is an object with avatar, userMessage e.t.c
          broadcastAllTheSockets: async (msgData) =>{
                //is a user in network?
                if (pmVar.remoteSockets.has(msgData.usrId)){
                  msgData.online = true;
                } else {
                  msgData.online = false;
                }
                //--iterate all the clients 
                pmVar.remoteSockets.forEach((value,key)=>{
                  console.log(`broadcast to User ${key} `);
                  value.send(JSON.stringify(msgData));
              })
          },

          onPingInterval: ()=> {
            console.log('\x1b[36m%s\x1b[0m', '<<ping interval>>')
            pmVar.webSocketServer.clients.forEach(function each(ws) {
                  if ((ws.isAlive === false) ) {
                    console.log('Connection closed!');
                    return ws.terminate();
                  }
                  ws.cntOfTimeouts += 1;
                  console.log('\x1b[34m%s\x1b[0m', `${ws.cntOfTimeouts},${JSON.stringify(ws._socket.address())}`);
                  //when live
                    ws.ping();
                  });
          },



      }
  //create a getter for the private members
  this.pmGetter = new WeakMap();
  //asiign members
  this.pmGetter.set(this, pmVar);
/**---------- */

      //start ping-pong process
        pmVar.betheartIntervalHandle = setInterval(pmVar.onPingInterval, pmVar.pingScanInterval);
      //connect listeners
    pmVar.webSocketServer.on('connection',(socket,req)=>pmVar.onServerConnection(socket, req, this));
    pmVar.webSocketServer.on('close', function close() {
           // clearInterval(pmVar.betheartInterval);
    });
  }


  /*----------------P U B L I C    M E T H O D S--------- */
/**@ when a database has been changed after cleaning 
 it needs to update DOM structure on client side  */
  notifyAllTheClientsToUpdate () {
    let privGetter = this.pmGetter.get(this);
  
    privGetter.sendUpdateToClients();
  }

  sendNotificationToTheClient ( usrId, message) {
      let privGetter = this.pmGetter.get(this);
    //is a client online?
    let userSocket = privGetter.remoteSockets.get(Number(usrId)|0)
           if (userSocket ) {
              let parcel = {
                command:'notify',
                msg: message,
              }
              userSocket.send(JSON.stringify(parcel));
              return {status:true, msg:'A message has been sent successfully!'}

           } else {
            return {status:false, msg:"Fail! User not found or offline!"}
           }

  }

  

 
}


