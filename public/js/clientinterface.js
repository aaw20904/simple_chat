 const SESSION_IDENTIFIER_COOKIE = 'sessionInfo';

 window.onload = async () => {
    let notificator = new Toast();
    let cookieMgr = new CookieManager();
    let msgList = new  ClientMessageList(document.getElementById('a4a1d61488ecb20b')) 
    let wsInterface = new NetworkInteractor(cookieMgr, notificator.showToast, msgList);
    ///try to connnect
   if (!await wsInterface.connectWs()) {
        alert('Server unavaliable')
   }
    //starting auto echo
        wsInterface.echoAutoSendingtLoop();

        //when a  connection was failed - treminate the following actions:
        ///redirect to the Log In page
      /*  let currentUrl = new URL(document.location);
            var hostName = currentUrl.host;
          window.setTimeout(()=>{
                    window.location.replace(`https://${hostName}/login`);
                  }, 3000);*/
     
   // await wsInterface.registerNewSocketCommand();
    await wsInterface.getAllMessagesCommand();
    new MessageSender(document.getElementById('2f869fd1941f5e46'), wsInterface);
   //timeout set of the 'echo' command :
 window.setInterval(onOfflineIndicator, 1000);


 /*
                                           ___                                     ___          .-.                         ___   ___    
                                      (   )                                   (   )  .-.   /    \    .-.               (   ) (   )   
 ___ .-. .-.    ___  ___      .--.     | |_        ___ .-. .-.     .--.     .-.| |  ( __)  | .`. ;  ( __)   .--.     .-.| |   | |    
(   )   '   \  (   )(   )   /  _  \   (   __)     (   )   '   \   /    \   /   \ |  (''")  | |(___) (''")  /    \   /   \ |   | |    
 |  .-.  .-. ;  | |  | |   . .' `. ;   | |         |  .-.  .-. ; |  .-. ; |  .-. |   | |   | |_      | |  |  .-. ; |  .-. |   | |    
 | |  | |  | |  | |  | |   | '   | |   | | ___     | |  | |  | | | |  | | | |  | |   | |  (   __)    | |  |  | | | | |  | |   | |    
 | |  | |  | |  | |  | |   _\_`.(___)  | |(   )    | |  | |  | | | |  | | | |  | |   | |   | |       | |  |  |/  | | |  | |   | |    
 | |  | |  | |  | |  | |  (   ). '.    | | | |     | |  | |  | | | |  | | | |  | |   | |   | |       | |  |  ' _.' | |  | |   | |    
 | |  | |  | |  | |  ; '   | |  `\ |   | ' | |     | |  | |  | | | '  | | | '  | |   | |   | |       | |  |  .'.-. | '  | |   |_|    
 | |  | |  | |  ' `-'  /   ; '._,' '   ' `-' ;     | |  | |  | | '  `-' / ' `-'  /   | |   | |       | |  '  `-' / ' `-'  /   .-.    
(___)(___)(___)  '.__.'     '.___.'     `.__.     (___)(___)(___) `.__.'   `.__,'   (___) (___)     (___)  `.__.'   `.__,'   (   )   
                                                                                                                              '-'    
                                                                                                                                     
*/
     //the function must be modified - to process anempty 'echo' message
     // when timeout (greater times 1.5 that 'ping-pong') went out and there will not any response - brutal close the connection
     //and try to connect again (when the internet connection exists)
    
    function onOfflineIndicator () {
        let node = document.querySelector('.offline_indicator');
        if(!navigator.onLine){
            node.classList.remove('hide')
        } else {
            node.classList.add('hide')
        }
    }

    let smilesInst =  new SmilesPanel(document.querySelector('.smileShowButton'), 
                                        document.querySelector('.messageInput'),
                                        document.querySelector('.smilePanell')); 

 }



 //----***--***--***--------------
class ClientMessageList {
    #parentNode;
    constructor (parentNode) {
        this.#parentNode = parentNode;
    }

    buildChatFromScratch (chatData) {
        chatData.forEach(x1=>{
            this.addNewMessage(x1)
        });
        
    }

    setOfflineAllTheUsers () {
         let messageList = Array.prototype.slice.call(this.#parentNode.children);
        messageList.forEach(el=>{
                //get a span elem
                el = el.querySelector('.indicator_5dfg4');
                    el.classList.remove('online-indicator');
                    el.classList.add('offline-indicator');
           
        }) 
    }

    removeAllTheMessages(){
        let e = this.#parentNode;
          var child = e.lastElementChild; 
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }
    }

    setUserOnlineStatus(usrId, status=false) {
        let messageList = Array.prototype.slice.call(this.#parentNode.children);
        messageList.forEach(el=>{
            let usrIdAttr =el.getAttribute('usrId')
            if (usrIdAttr == usrId ) {
                //get a span elem
                el = el.querySelector('.indicator_5dfg4');
                if(status) {
                    //clear old style
                    el.classList.remove('offline-indicator');
                    el.classList.add('online-indicator');
                } else {
                    el.classList.remove('online-indicator');
                    el.classList.add('offline-indicator');
                }
            }
        })
        
    }
    
    addNewMessage(messageData ={
        message: "vccfgchyjh",
        usrId: 27,
        msgId: 71, 
        usrName: "User1",
        sent: "2022-10-14T08:04:05.000Z",
        online: true,
        usrAvatar: {}
    },animated=false) {
        //1) a flex container of a message
        let messageWrapper = document.createElement('article');
        //assign user and message id to a main message wrapper 
        messageWrapper.setAttribute('usrId',messageData.usrId);
        messageWrapper.setAttribute('msgId',messageData.msgId);
    
        messageWrapper.classList.add('p-1','m-1','d-flex','flex-column','justify-content-start','rounded','main-chat-color');
       //when animated
        if(animated) {
            messageWrapper.classList.add('slide-in-elliptic-top-fwd');
        }
        messageWrapper.classList.add('message-background-color');
    
        //2) create a FIRST line - an avatar, a name, an online-indicator
            let firstLineWrapper = document.createElement('section');
        firstLineWrapper.classList.add('d-flex','flex-row','justify-content-start','align-items-center');
             let avatar = document.createElement('img');
        avatar.classList.add('rounded','m-1');
        //assign an avatart data  to an img elemet
        avatar.src = messageData.usrAvatar;
        //user name
            let userName = document.createElement('div');
        userName.classList.add('user-name-text','p-1');
        userName.innerText = messageData.usrName;
        //online indicator
            let onlineIndicatorWrappr = document.createElement('div');
        onlineIndicatorWrappr.classList.add('d-flex','justify-content-end','align-items-center','w-100');
            let onlineIndicator = document.createElement('div');
        onlineIndicator.classList.add('indicator_5dfg4');
            
        if (messageData.online) {
           onlineIndicator.classList.add('online-indicator');
        } else {
             onlineIndicator.classList.add('offline-indicator');
        } 
        
            let spanElem = document.createElement('span');
        onlineIndicatorWrappr.appendChild(onlineIndicator);
        onlineIndicator.appendChild(spanElem);
        //a message element
        let message = document.createElement('div');
        message.classList.add('message-text','d-block','m-1');
        message.innerText = messageData.message;
        //a time element
        let timeNode = document.createElement('div');
        timeNode.classList.add('d-block','m-1','time-text','time-color');
        timeNode.innerText = new Date(messageData.sent).toString();
        
       //append children
       firstLineWrapper.appendChild(avatar);
       firstLineWrapper.appendChild(userName);
       firstLineWrapper.appendChild(onlineIndicatorWrappr);
       //first line
       messageWrapper.appendChild(firstLineWrapper);
       //second line
       messageWrapper.appendChild(message);
       //thrid line
       messageWrapper.appendChild(timeNode);
       //assign to the parent

       this.#parentNode.appendChild(messageWrapper);
       //scroll on the top
        this.#parentNode.scrollTop =  this.#parentNode.scrollHeight;
    }


}
/////---------------

class MessageSender {
    #btn;
    #input;
    #networkInterractor;
    constructor(parentNode, networkInterractorInstance=null) {
        this.#networkInterractor = networkInterractorInstance;
        this.#btn = parentNode.querySelector('.send_button');
        this.#input = parentNode.querySelector('.chat_input');
        this.#btn.addEventListener('click',this.#onSendButton);
    }

    #onSendButton = (evt) =>{
        //--------start animation by adding class name
        this.#btn.classList.add('roll-in-blurred-left');
        //-----transmitt a message to a server
        this.#networkInterractor.typeToChatCommand(this.#input.value);
        window.setTimeout(this.#clearAnimation, 1000);
    }

    #clearAnimation = () =>{
        this.#btn.classList.remove('roll-in-blurred-left');
    }
}

////----------------

class NetworkInteractor {
    #cookieMgr;
    #webSocket = null;
    #baseWsUrl;
    #baseHttpUrl;
    #msgFunction;
    #currHostName;
    #chatInstance;
   
    #reconnectTimerId;
   

        constructor (cookieMgrInst, msgFunction, chatInstance) { 
            this.echoResponsed = true;
            this.wsConnectionStatus = false;
            this.#msgFunction = msgFunction;
            this.#cookieMgr = cookieMgrInst;
            this.#chatInstance = chatInstance;
            ///get url`s;
            let currentUrl = new URL(document.location);
            this.#currHostName = currentUrl.host;
            this.#baseHttpUrl = `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname}`;
            this.#baseWsUrl = `wss://${currentUrl.hostname}`;
        }

    //----------- L I S T E N E R S -- on WS server messages --------

  

    #onEchoServerResp = () =>{
        this.echoResponsed = true;
    }
    
    #onRegistrWsServerComm = (rsp) =>{
       if (rsp.status) {
          //when success
          if (rsp.cookie) {
            //when a cokie needs to be updated
            this.#cookieMgr.writeCookie(SESSION_IDENTIFIER_COOKIE, rsp.cookie);
            this.#msgFunction(true,`Cookie updated ${rsp.cookie}`);
          }
          //report on success
          this.#msgFunction(true,'User registered successfully!')
       } else {
        //report on error
        this.#msgFunction(false,rsp.msg);
        return;
        
        }
    };

    #onNet_stWsServerComm = (rsp) =>{
        let st = rsp.online ? 'ONline' : 'OFFline'; 
        this.#msgFunction (false,`User vith ID ${rsp.usrId}  ${st}`);
        this.#chatInstance.setUserOnlineStatus(rsp.usrId, rsp.online);
    };

    #onLoginWsServerComm = (rsp) => {
       //report that a user redirect to log in
      this.#msgFunction(false, rsp.msg);
       //save current position in cookie
       this.#cookieMgr.writeCookie(LAST_URL_COOKIE,this.#baseHttpUrl);
       ///redirect to the Log In page
          window.setTimeout(()=>{
                    window.location.replace(`https://${this.#currHostName}/login`);
                  }, 3000);
    };
    //when anyone had sent a message to a server - a server broadcasting the one
    #onBr_castWsServerComm = (rsp) =>{
        this.#chatInstance.addNewMessage(rsp,true);
        
        //console.log(rsp);
    };

    #onUpdateWsServerComm = (rsp) =>{
        this.#msgFunction(true,'Try to update...');
        this.#chatInstance.removeAllTheMessages();
         this.getAllMessagesCommand();

    };
    
   /**when all the chat data has been arrived */
    #onGet_chatWsServerComm = (rsp) =>{
        
        this.#msgFunction(true,'The LiveChat has been updated successfully!');
        this.#chatInstance.buildChatFromScratch(rsp.data);
       // rsp.data.forEach(d=>console.log(d.usrId));
    };
    
    
    #onTicketMsgWsServerComm = (rsp) =>{
        this.#cookieMgr.writeCookie(SESSION_IDENTIFIER_COOKIE, rsp.cookie);
        this.#msgFunction(true,'Cookie updated successfully!')
    };

    #onErrorMsgWsServerComm = (rsp) =>{
        this.#msgFunction(false, rsp.msg);
    };
   ///when a custom notification from the server
   #onNotifyServerComm = (rsp) => {
        this.#msgFunction(true, rsp.msg);
   };



  /***base WS event handler***/
    #onWsMessage =  (evt) => {
       let msg = JSON.parse(evt.data);
        switch(msg.command){
            case 'registr':
               this.#onRegistrWsServerComm(msg);
            break;
            case 'login':
              this.#onLoginWsServerComm(msg);
            break;
            case 'br_cast':
               this.#onBr_castWsServerComm(msg)
            break;
            case 'ticket':
                this.#onTicketMsgWsServerComm(msg);
            break;
            case 'error':
                this.#onErrorMsgWsServerComm(msg);
            break;
            case 'get_chat':
                this.#onGet_chatWsServerComm(msg);
            break;
            case 'update':
                this.#onUpdateWsServerComm(msg);
            break;
            case 'net_st':
                this.#onNet_stWsServerComm(msg);
            break;
            case 'notify':
                this.#onNotifyServerComm(msg);
            break;
            case 'echo':
                this.#onEchoServerResp(msg);
            break;
            default:

        }
    };

    #onWsClose = (evt) => {
        this.#msgFunction(false,`Network Coonection closed!`);
        this.wsConnectionStatus = false;
        //try to establish a new connection 
        this.#reconnectTimerId = window.setInterval(this.#onNetworkReconnectTimerHandler, 10000)
    };

    #onNetworkReconnectTimerHandler = async () =>{
         if (navigator.onLine ) {
            //try to update
            //1)establish a new ws connection
            if(! await this.connectWs() ){
                 //when a  connection was failed - treminate the following actions:
                   return;
              }
            //2)register
           // await this.registerNewSocketCommand();
            //3)clean all the chat
            this.#chatInstance.removeAllTheMessages();
            //4)update - reload all the chat
            await this.getAllMessagesCommand();
            //clear interval 
            window.clearInterval(this.#reconnectTimerId);
            //start auto echo
             this.echoAutoSendingtLoop();
         }
    }

    #onWsError = (evt) => {
        this.#msgFunction(false,`ws connection error! ${evt}`);
        this.#chatInstance.setOfflineAllTheUsers();
    };
/**
 * 
 
█▀█ █░█ █▄▄ █░░ █ █▀▀
█▀▀ █▄█ █▄█ █▄▄ █ █▄▄
 */
    
      echoAutoSendingtLoop =  () =>{
        //has a server responsed?
        if( ! this.echoResponsed){
            this.#webSocket.close();
        } else {
            this.echoResponsed = false;
            this.sendEchoCommand();
            window.setTimeout(this.echoAutoSendingtLoop, 10000);
        }
    }

    async connectWs (wsUrl=null) {

        if (!wsUrl) {
            this.#baseWsUrl = `wss://${this.#currHostName}`;
        }
        //try to connect
        try{
              this.#webSocket =  await new Promise((resolve, reject) => {
                                let socket = new WebSocket(this.#baseWsUrl );
                                 let tmt =   window.setTimeout(()=>{
                                        if(socket.readyState !== 0x0001){
                                            socket.close();
                                            console.log('ws conn timeout!')
                                            reject();
                                        }
                                    }, 4000)
                                socket.addEventListener("error",onErr);

                                function onErr(err){
                                    this.wsConnectionStatus = false;
                                    reject(err);
                                }
                                socket.addEventListener("open", () => {
                                    window.clearTimeout(tmt);
                                    this.echoResponsed = true;
                                    this.wsConnectionStatus = true;
                                        socket.removeEventListener("error",onErr);
                                   
                                    resolve(socket);
                                });
                            }); 
        } catch(e){
             this.#msgFunction(false,`ws connection error! `);
            return false;
        }
      
         //add isteners
         this.#webSocket.addEventListener('message', this.#onWsMessage);
         this.#webSocket.addEventListener('close', this.#onWsClose);
         this.#webSocket.addEventListener('error', this.#onWsError);
        return true;
    }
 ///!!!  In the new implementation, this function is obsolete and useless; authentication and registration are performed when a WS handshake occurs. 
    async registerNewSocketCommand(){
        return new Promise((resolve, reject) => {
            //get auth cookie 'ticket'
            let ticket = this.#cookieMgr.readCookie('sessionInfo');
            if (!ticket) {
                ticket = 0;
            }
            //try to register on remote WS server
            let registerCommand = {command:'registr',cookie:ticket};
            //start sending a message to the server
            this.#webSocket.send(JSON.stringify(registerCommand));
            //send a request and waiting until it has been transmitted
           
           
             resolve();
            //NOTE: a command processing WHEN a response has been arrived -  in 'onWsMessage' listener

        });
    }

    async typeToChatCommand(msg) {
        return new Promise((resolve, reject) => {
            //get auth cookie 'ticket'
            let ticket = this.#cookieMgr.readCookie('sessionInfo');
            if (!ticket) {
                ticket = 0;
            }
            //try to register on remote WS server
            let registerCommand = {command:'send_msg',cookie:ticket, message:msg};
            //start sending a message to the server
            this.#webSocket.send(JSON.stringify(registerCommand));
            //send a request and waiting until it has been transmitted
        
             resolve();
            //NOTE: a command processing WHEN a response has been arrived -  in 'onWsMessage' listener

        });
    }

    async getAllMessagesCommand() {
        //get auth cookie 'ticket'
        let ticket = this.#cookieMgr.readCookie('sessionInfo');
            if (!ticket) {
                ticket = 0;
            }
        let commToSend = {
                          command:'get_chat',
                          cookie:ticket,
                        };
            this.#webSocket.send(JSON.stringify(commToSend));
        return;

    }

    sendEchoCommand() {
           //sending without cookies - to decrease sysem load of the server
        let commToSend = {
                          command:'echo',
                        };
            this.#webSocket.send(JSON.stringify(commToSend));
        return;

    }



}

/////

//-----------read/write cookies 
    class CookieManager {
        #readAllTheCookies(){
                //get all the string 
            let cookiesString = String(document.cookie);
            //clean all the spaces
            cookiesString = cookiesString.replace(/\s/g, '');
            //split
            let splited = cookiesString.split(';');
           
            //create a map
            let cookiesMap = new Map();
            //iterate an array and split into key/value
            splited.forEach((val)=>{
                let pair = val.split('=');
                //key [0], value[1]
                cookiesMap.set(pair[0], pair[1]);
            });
            return cookiesMap;
        }
    //returns a Map()
        readCookiesMap () {
            return this.#readAllTheCookies();
        }

        readCookie (key) {
            let m = this.#readAllTheCookies();
            return m.get(key);
        }

        writeCookie (key, value) {
           let cookieMap = this.#readAllTheCookies();
            cookieMap.set(key, value);
            let rawString = '';
            cookieMap.forEach((v, k)=>{
                 document.cookie = `${k}=${v};SameSite=None;Secure;`;
            });
           
        }
    }

class Toast {

    showToast (status=true,msg='Helloword',time=new Date().toLocaleTimeString()) {
            let toastMsg = document.getElementById('toast_01');
            let small =  document.getElementById('toast_time_01')
            small.innerText = time;
            if (status) {
                toastMsg.classList.remove('text-danger')
                toastMsg.classList.add('text-success')
            } else {
                toastMsg.classList.remove('text-success')
                toastMsg.classList.add('text-danger')
            }
            toastMsg.innerText = msg;
            let toastElem = document.querySelector('.toast');
            toastElem = new bootstrap.Toast(toastElem);
            toastElem.show();
            /*var toastElList = [].slice.call(document.querySelectorAll('.toast'));
        var toastList = toastElList.map(function(toastEl) {
        return new bootstrap.Toast(toastEl)
        });
        toastList.forEach(toast => toast.show()) ;*/
    }

}

class SmilesPanel {
    #showButtonNode;
    #textInputNode;
    #panellNode;

    #onCallPanel = (evt) =>{
          //when hide -show a  panel with smiles
        if (this.#panellNode.classList.contains('scale-out-center')) {
            this.#panellNode.classList.remove('scale-out-center');
            this.#panellNode.classList.add('scale-in-center');
            this.#showButtonNode.innerText = 'hide smiles';
        } else {
          //othervise - hide
            this.#panellNode.classList.remove('scale-in-center');
            this.#panellNode.classList.add('scale-out-center');
            this.#showButtonNode.innerText = 'Smiles..';
        }
        
    };

    #onPasteSmile = (evt) => {
      
      //get a symbol
      let smile = evt.target.innerText;
      //get a string
      let string = this.#textInputNode.value;
      //concat
      string = `${string}${smile}`;
      //assign a new value
      this.#textInputNode.value = string;

    };

    constructor (showButton=null, textInput=null, panellNode=null) {
        this.#showButtonNode = showButton;
        this.#textInputNode = textInput;
        this.#panellNode = panellNode;
        //add listener to open/close panel 
        this.#showButtonNode.addEventListener('click', this.#onCallPanel);
        //get live button colection
        let buttons = Array.prototype.slice.call(this.#panellNode.children);
        //add listener to buttons
        buttons.forEach(element => {
            element.addEventListener('click',this.#onPasteSmile);
        });

    }
}