 alert(new Date().toLocaleTimeString());

 window.onload = async () => {
    let cookieMgr = new CookieManager();
    let msgList = new  ClientMessageList(document.getElementById('')) 
    let httpInterface = new NetworkInteractor(cookieMgr,(x,y)=>console.info(x,y),msgList);
    let allTheChat = await httpInterface.getFullChat();
    console.log(allTheChat);
 }

 



class ClientMessageList {
    #parentNode;
    constructor (parentNode) {
        this.#parentNode = parentNode;
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
        Object.assign(messageWrapper, {
            usrId: messageData.usrId,
            msgId: messageData.msgId,
        });
        messageWrapper.classList.add('d-flex','flex-column','justify-content-start','rounded');
        messageWrapper.innerText="534343";
        this.#parentNode.appendChild(messageWrapper);


    }


}
/////

//

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
        rsp.data.forEach(d=>console.log(d.msgId));
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

