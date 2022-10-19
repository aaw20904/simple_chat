

 window.onload = async () => {
    let cookieMgr = new CookieManager();
    let msgList = new  ClientMessageList(document.getElementById('a4a1d61488ecb20b')) 
    let wsInterface = new NetworkInteractor(cookieMgr,(x,y)=>console.info(x,y),msgList);
    await wsInterface.connectWs();
    await wsInterface.registerNewSocketCommand();
    let allTheChat = await wsInterface.getAllMessagesCommand();
    new MessageSender(document.getElementById('2f869fd1941f5e46'), wsInterface);
    console.log(allTheChat);
 }

 
class ClientMessageList {
    #parentNode;
    constructor (parentNode) {
        this.#parentNode = parentNode;
    }

    buildChatFromScratch (chatData) {
        chatData.forEach(x1=>{
            this.addNewMessage(x1)
        })
        ;
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
    }) {
        //1) a flex container of a message
        let messageWrapper = document.createElement('article');
        //assign user and message id to a main message wrapper 
        messageWrapper.setAttribute('usrId',messageData.usrId);
        messageWrapper.setAttribute('msgId',messageData.msgId);
    
        messageWrapper.classList.add('p-1','m-1','d-flex','flex-column','justify-content-start','rounded','main-chat-color');
        
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

        constructor (cookieMgrInst, msgFunction, chatInstance) {
            this.#msgFunction = msgFunction;
            this.#cookieMgr = cookieMgrInst;
            this.#chatInstance = chatInstance;
            ///get url`s;
            let currentUrl = new URL(document.location);
            this.#currHostName = currentUrl.host;
            this.#baseHttpUrl = `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname}`;
            this.#baseWsUrl = `ws://${currentUrl.hostname}/:8080`;
        }

    //----------- L I S T E N E R S -- on WS server messages --------
    
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
      this.#msgFunction(false,'You must to login.You will redirect after several seconds');
       //save current position in cookie
       this.#cookieMgr.writeCookie(LAST_URL_COOKIE,this.#baseHttpUrl);
       ///redirect to the Log In page
          window.setTimeout(()=>{
                    window.location.replace(`http://${this.#currHostName}/login`);
                  }, 3000);
    };

    #onBr_castWsServerComm = (rsp) =>{
        console.log(rsp);
    };

    #onUpdateWsServerComm = (rsp) =>{
        this.#msgFunction(true,'Try to update...');
         this.getAllMessagesCommand();

    };
    
   /**when all the chat data has been arrived */
    #onGet_chatWsServerComm = (rsp) =>{
        
        this.#msgFunction(true,'The LiveChat has been updated successfully!');
        this.#chatInstance.buildChatFromScratch(rsp.data);
        rsp.data.forEach(d=>console.log(d.usrId));
    };
    
    
    #onTicketMsgWsServerComm = (rsp) =>{
        this.#cookieMgr.writeCookie(SESSION_IDENTIFIER_COOKIE, rsp.cookie);
        this.#msgFunction(true,'Cookie updated successfully!')
    };

    #onErrorMsgWsServerComm = (rsp) =>{
        this.#msgFunction(false, rsp.msg);
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

            default:

        }
    };

    #onWsClose = (evt) => {
        this.#msgFunction(false,`WS Coonection closed`);
    };

    #onWsError = (evt) => {
        this.#msgFunction(false,`ws connection error! ${evt}`);
    };



    async connectWs (wsUrl=null) {

        if (!wsUrl) {
            this.#baseWsUrl = `ws://${this.#currHostName}:8080`;
        }
        //try to connect
        this.#webSocket =  await new Promise((resolve, reject) => {
                                let socket = new WebSocket(this.#baseWsUrl );
                                // 
                                socket.addEventListener("open", () => {
                                    resolve(socket);
                                });
                            }); 
         //add isteners
         this.#webSocket.addEventListener('message', this.#onWsMessage);
         this.#webSocket.addEventListener('close', this.#onWsClose);
         this.#webSocket.addEventListener('error', this.#onWsError);

    }

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
            console.log(splited);
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

