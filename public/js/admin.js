//import { resolveInclude } from "ejs";

window.onload=async ()=>{
     
    let anotherButtonTest = document.querySelector('.debug_button_one');
    anotherButtonTest.onclick = async () => {
      await  xhtmlNetworkInterractor._sendCommand();
    }
    let notificator = new Toast();
    let networkInteractor = new NetworkInteractor();
    let msgList = new MessageList( networkInteractor, statusNodeIndicator,notificator);
    let keyControl = new CryptoKeyControl( networkInteractor, statusNodeIndicator,notificator);
    let cleanControl = new ChatCleaner( networkInteractor, statusNodeIndicator, notificator, updateFunc);
    let cleanOptions;
    /******<<DEBUG CODE>>>  */
    // (A) CONNECT TO WEB SOCKET SERVER
    let web_socket= await new Promise((resolve, reject) => {
        let socket = new WebSocket("ws://localhost:8080");
        // (B) ON CONNECTING TO THE SERVER
        socket.addEventListener("open", () => {
        socket.send("Hello Server!"); // SEND MESSAGE TO SERVER
        resolve(socket);
        });
    }); 
        
        // (C) ON RECEIVING MESSAGE FROM SERVER
        web_socket.addEventListener("message", (evt) => {
        console.log(evt.data);
        });
        // (D) ON CONNECTION CLOSE
        web_socket.addEventListener("close", () => {
        console.log("Connection Closed");
        });
        // (E) ON ERROR
        web_socket.addEventListener("error", (err) => {
        console.log(err);
        });
    let debugButton = document.querySelector('.debug_button');
    debugButton.onclick=(evt)=>{
        web_socket.send(new Date().toLocaleTimeString());
    }
    async function updateFunc() {
        return await msgList.buildFullMessageList();
    }

    //****<<END DEBUG>>

   
     document.querySelector('.mainWrap').appendChild(keyControl.makeKeyNode('a4s4dsa364d64fes354efs'));
     let y = await cleanControl.createCleaner()
         //append admin clean board
     document.querySelector('.mainWrap').appendChild(y);
     //get clean opts from network
     cleanOptions = await networkInteractor.getCleanOptions();
     //when success - apply it
     if(cleanOptions.status) {
             //append clean options from the db
        cleanControl.applyDBCleanOptions(cleanOptions.results);
     } else {
        notificator.showToast(false,cleanOptions.msg);
     }
   
     //OK cleanControl.applyDBCleanOptions();
     //OKconsole.log(cleanControl.convertCleanOptionsToDB());
     document.querySelector('.mainWrap').appendChild(await msgList.buildFullMessageList());

     /***/
     
     /***/
 
}



/******************** */
function statusNodeIndicator (status=true, text='*') {
    let node = document.querySelector('.statind');
    if (status) {
        node.classList.remove('text-danger');
        node.classList.add('text-success');
    } else {
        node.classList.remove('text-success');
        node.classList.add('text-danger');
    }
    node.innerText = text;
}

class Toast {

    showToast(status=true,msg='Helloword',time=new Date().toLocaleTimeString()){
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

class MessageList{
    constructor(networkInteractor = null, statusNodeIndicator=null, notificator=null) {
               //making a hide property
      this.privateMembers = new WeakMap();
      //assign a 'private' - it may be an object
     this.privateMembers.set(this, {
            myVar:1123,
            networkInteractor: networkInteractor,
            statusNodeIndicator: statusNodeIndicator,
            notificator: notificator,
            getMessageId: (evt)=>{
                let result = evt.target.parentNode.parentNode.parentNode.getAttribute('data-message-id');
                return result;
            },
            /***event listeners  */
            onRemove: async  (evt)=>{
                let members = this.privateMembers.get(this);
                let msgId = members.getMessageId(evt); //evt.target.parentNode.parentNode.parentNode.getAttribute('data-message-id');
                //try to remove
                //try to change 
                    let netResult;
                    netResult = await  members.networkInteractor.removeMessage(msgId);
                    if (netResult.status) {
                        //when success
                        members.notificator.showToast(true,`${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                        members.statusNodeIndicator(true, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    } else {
                        //when fail
                        members.notificator.showToast(false,`${netResult.msg}, time: ${new Date().toLocaleTimeString()}`)
                        members.statusNodeIndicator(false, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    }
                    netResult.value = msgId;
                    return netResult;
            },
       
       
        })
    }
    async buildFullMessageList () {
        let parentNode = document.createElement('div');
        parentNode.setAttribute('class','d-flex, flex-column chatRoot w-100');
        //get private members
        let priv = this.privateMembers.get(this);
        //read from network
        let members = await priv.networkInteractor.getFullChat();
        console.log(members);
        //create nodes
         members.value.forEach(y=>{
            let node = this.createMessageItem(y);
            node = this.createBtnWrapper(node);
            parentNode.appendChild(node);
         })
         return parentNode;
    }
  //create an DOM item with user name message time and the avatar (one message) 
  //usrName, usrId, msgId, message, sent, usrAvatar
    createMessageItem (arg={
                            usrName: null, 
                            sent: null,
                            usrId: null,
                            msgId: null, 
                            message: null, 
                            usrAvatar: null
                        }) {
        //get private members
        let priv = this.privateMembers.get(this);
        //create main container
        let mainContainer = document.createElement('article');
        mainContainer.classList.add( 'message-box-radius','w-100', 'mb-1','message-box-normal-bg','d-flex','flex-column','justify-content-start','align-items-center');
        //attributes
        mainContainer.setAttribute('data-msgid', arg.msgId);
        mainContainer.setAttribute('data-usrid', arg.usrId);
        //items
        //A) usrName
        let usrNameD = document.createElement('h6');
            usrNameD.setAttribute('class','d-flex message-name-text ms-2 justify-content-center align-items-center');
            usrNameD.innerText = arg.usrName;
        //B) message
        let messageD = document.createElement('div');
            messageD.setAttribute('class','message-msg-text message-box-radius message-normal-bg p-1 my-1 message-limits');
            messageD.innerText = arg.message;
        //C)date 
        let sentD = document.createElement('div');
            sentD.setAttribute('class','message-date-text ')
            sentD.innerText = arg.sent;
        //D)image 
        let avatarD = document.createElement('img');
            avatarD.src = arg.usrAvatar;
            avatarD.classList.add('my-2','rounded')
        ///the first string - username and date
        let firstString = document.createElement('div');
            firstString.setAttribute('class','d-flex flex-row px-2 my-1 justify-content-start align-items-center  w-100');
            //assign childs
            firstString.appendChild(avatarD);
            firstString.appendChild(usrNameD);

            //assign all the children
            mainContainer.appendChild(firstString);
            mainContainer.appendChild(messageD);
            mainContainer.appendChild(sentD);
            return mainContainer;

    }

    //----!-delete only a message item - PLEASE DON'T USE IT!
    removeMessageItem (msgId) {
        let childNode = document.querySelector(`[data-msgid=${msgId}]`);
        let parentNode = childNode.parentNode;
        parentNode.removeChild(childNode);
    }
  /////remove an  item with a wrapper - USE IT 
    removeWrappedMessageItem (msgId) {
        let childNode = document.querySelector(`[data-message-id='${msgId}']`);
        let parentNode = childNode.parentNode;
        parentNode.removeChild(childNode);
    }

    ///wrapper for a button
    createBtnWrapper(chatItem) {
        //get private members
          let priv = this.privateMembers.get(this);
        //create a container 
        let messageContainer = document.createElement('section');
        //set attribute
        messageContainer.setAttribute('data-message-id', chatItem.getAttribute('data-msgid'));
        messageContainer.setAttribute('class','message-box-radius  border-primary message-box-normal-bg d-flex flex-column justify-content-center align-items-center w-100 m-1');
        //a button`s row
        let btnContainer = document.createElement('div');
        btnContainer.setAttribute('class','d-flex flex-row justify-content-center align-items-end flex-column mt-2 p-0 message-limits');
        //a button
        let btn  = document.createElement('div');
        btn.setAttribute('type','image');
         
        btn.setAttribute('style','height:30px;width:30px;');
        btn.setAttribute('class','btnRemove d-block');
        let btnImg = document.createElement('img');
            btnImg.setAttribute('class','rounded cursor-pointer');
            btnImg.setAttribute('src','../images/remove.svg');
            //animation on click
             btnImg.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
            }
        btn.appendChild(btnImg);

        //assign to a button
        btnContainer.appendChild(btn);
        ////event  L I S T E N E R S
        btn.onclick=async (evt)=>{
            let result = await priv.onRemove(evt);
            if (result.status) {
                //when successs-remove a  node
                this.removeWrappedMessageItem(result.value);
            }
        }
        //append children
        messageContainer.appendChild(btnContainer);
        messageContainer.appendChild(chatItem);
        return messageContainer;

    }
}



class CryptoKeyControl {
    constructor(networkInteractor = null, statusNodeIndicator=null, notificator=null) {
                //making a hide property
        this.privateMembers = new WeakMap();
        //assign a 'private' - it may be an object
        this.privateMembers.set(this, {
            networkInteractor: networkInteractor,
            statusNodeIndicator: statusNodeIndicator,
            notificator: notificator,
            setKeyNodeText: (txt)=>{
                let node = document.querySelector('.symKeyString');
                node.innerText = txt;
            },
            /***event listeners  */
            onUpdate: async  (evt)=>{
                let members = this.privateMembers.get(this);
                //try to update
                    let netResult;
                    netResult = await  members.networkInteractor.updateKey();
                    if (netResult.status) {
                        //when success
                        //update key node
                        members.setKeyNodeText(netResult.value);
                        members.notificator.showToast(true,`${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                        members.statusNodeIndicator(true, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    } else {
                        //when fail
                        members.statusNodeIndicator(false, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                        members.notificator.showToast(false,`${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    }
                    return netResult;
            },


        })
}
    ///
    
    makeKeyNode (key='1ab2c5d8e1f9') {
        //get private members
        let priv = this.privateMembers.get(this);
        let mainNode = document.createElement('article');
        mainNode.setAttribute('class','d-flex regenkey-box-radius m-1 flex-column justify-content-center align-items-center regenkey-bg w-100');
        let firstString = document.createElement('div');
        //first row
        firstString.classList.add('regenkey-text','d-flex','text-left','justify-content-center','align-items-center','p-1');
        firstString.innerText = 'Update current symmetrical Key:'
        //second row
        let secondString = document.createElement('div');
        secondString.setAttribute('class','d-flex flex-row justify-content-around align-items-center p-1');
        let codeValue=document.createElement('div');
        codeValue.setAttribute('class','regenkey-text symKeyString');
        codeValue.innerText = key;
        //button
        let btn = document.createElement('div');
        btn.setAttribute('class','cursor-pointer mx-2');
        //button image
        let img = document.createElement('img');
        img.setAttribute('src','../images/key.svg');
        img.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
        }
        //BTN EVT LISTENER
        btn.onclick=async (evt)=>{

            let res = await priv.onUpdate();
            if (res.status) {
                codeValue.value = res.value;
            }
        }
        btn.appendChild(img);
        //appen chids to 2-nd row
        secondString.appendChild(codeValue);
        secondString.appendChild(btn);
        mainNode.appendChild(firstString);
        mainNode.appendChild(secondString);
        return mainNode;
    }
}


class ChatCleaner {
    constructor (networkInteractor = null, statusNodeIndicator=null, notificator=null, generateListFunction=()=>{return null} ) {
                //making a hide property
        this.privateMembers = new WeakMap();
        //assign a 'private' member of the class- it may be an object
        this.privateMembers.set(this, {
            networkInteractor: networkInteractor,
            statusNodeIndicator: statusNodeIndicator,
            notificator: notificator,
            generateFunction: generateListFunction,
            setAutoCleanPeriod: (arg={unit:'hour',value:1})=>{
                let clnInput = document.getElementById('autoCleanPeriodInput');
                let btnMinutes = document.getElementById('clnUnitsMinute');
                let btnHours = document.getElementById('clnUnitsHour');
                let btnDays =  document.getElementById('clnUnitsDay');
                switch (arg.unit) {
                    case 'hour':
                      //remove attribute 
                         btnMinutes.removeAttribute('checked')
                        btnDays.removeAttribute('checked')
                      //set the new
                        btnHours.setAttribute('checked','');
                    break;
                    case 'day':
                    //remove attribute 
                         btnMinutes.removeAttribute('checked')
                        btnHours.removeAttribute('checked')
                      //set the new
                        btnDays.setAttribute('checked','');
                    break;
                    case 'minute':
                     //remove attribute 
                       btnDays.removeAttribute('checked')
                       btnHours.removeAttribute('checked')
                     //set the new
                       btnMinutes.setAttribute('checked','')
                    break;
                    default:
                    return {status:false}
                }
                //assign to input
                clnInput.value = arg.value;
                return {status:true};
            },
            activateCleanThreshold(arg=true) {
                let node = document.querySelector('.thresholtRemoveChat')
                let hours =  document.getElementById('cleanerRadioHourTh');
                let days =  document.getElementById('cleanerRadioDayTh');
                if(arg){
                    node.removeAttribute('disabled');
                    hours.removeAttribute('disabled');
                    days.removeAttribute('disabled');
                } else {
                    node.setAttribute('disabled','');
                    hours.setAttribute('disabled','');
                    days.setAttribute('disabled','');
                }
                return {status:true};
            },
            activateAutoCleanPeriodInput: (state=true) =>{
                let clnInput = document.getElementById('autoCleanPeriodInput');
                let radioMinutes = document.getElementById('clnUnitsMinute')
                let radioHours = document.getElementById('clnUnitsHour')
                let raioDays = document.getElementById('clnUnitsDay');
                if (state) {
                    clnInput.removeAttribute('disabled');
                    radioHours.removeAttribute('disabled');
                    raioDays.removeAttribute('disabled');
                     radioMinutes.removeAttribute('disabled');

                } else {
                    clnInput.setAttribute('disabled','');
                    radioHours.setAttribute('disabled','');
                    raioDays.setAttribute('disabled','');
                    radioMinutes.setAttribute('disabled','');

                }
                return {status:true};
            },
             activateAutoCleanStartTime: (state='true')=>{
                let clnInput = document.getElementById('cleanTimeInput');
                if (state) {
                    clnInput.removeAttribute('disabled');
                } else {
                    clnInput.setAttribute('disabled','');
                }
                return {status:true};
             },
             activateButtonSaveOpt: (state='true')=> {
                let clnInput = document.getElementById('btnApplyClean');
                if (state) {
                    clnInput.removeAttribute('disabled');
                } else {
                    clnInput.setAttribute('disabled','');
                }
                return {status:true};
             },
             activateBtnStart: (state=true)=>{
                let clnInput = document.getElementById('processStart');
                if (state) {
                    clnInput.removeAttribute('disabled');
                } else {
                    clnInput.setAttribute('disabled','');
                }
                return {status:true};

             },
             activateBtnStop: (state=true)=> {
                let clnInput = document.getElementById('processStop');
                if (state) {
                    clnInput.removeAttribute('disabled');
                } else {
                    clnInput.setAttribute('disabled','');
                }
                return {status:true};
             },
             setAutoCleanStatus: (state='true')=> {
                let imgNode=document.getElementById('icoStatusIndicator');
                let statString=document.getElementById('txtStatusIndicator');
                if(state) {
                    imgNode.classList.add('image_rotate');
                    imgNode.setAttribute('src','/images/run.svg');
                    statString.innerText='Running'
                } else {
                    imgNode.classList.remove('image_rotate');
                    imgNode.setAttribute('src','/images/stop.svg');
                    statString.innerText='Stopped'
                }
             },
           
             getAutoCleanPeriod: ( )=>{
                let radioMinutes = document.getElementById('clnUnitsMinute')
                let radioHours = document.getElementById('clnUnitsHour')
                let radioDays = document.getElementById('clnUnitsDay');
                let clnInput = document.getElementById('autoCleanPeriodInput');
                //which units has been checked?
                if (radioMinutes.checked) {
                    return {status:true, results:{value:clnInput.value,unit:'minute'}}
                }

                if (radioHours.checked) {
                    return {status:true, results:{value:clnInput.value,unit:'hour'}}
                }

                if (radioDays.checked) {
                    return {status:true, results:{value:clnInput.value,unit:'day'}}
                }

                return {status:false,value:null}
             },
            //@ string format with 4 digits and semicolon - '15:40'
             setAutoCleanTime: (timeX='02:15')=>{
                let nodeX = document.getElementById('cleanTimeInput');
                nodeX.value = timeX;
                console.log('#');
                return{status:true}
             },
                //returned 4 digits with a semicolon
             getAutoCleanTime: ()=> {
                let node = document.getElementById('cleanTimeInput');
                return {status:true, value:node.value}
             },
             


            getCleanThreshold: ()=>{
                let node = document.querySelector('.thresholtRemoveChat')
                let hours =  document.getElementById('cleanerRadioHourTh');
                let days =  document.getElementById('cleanerRadioDayTh');
                if(hours.checked) {
                    //when hour selected - return  a period as seconds
                    return {status:true, results:{value:node.value,unit:'hour'}}
                } else if (days.checked) {
                    //when day selected - return a  period as seconds
                    return {status:true, results:{value:node.value,unit:'day'}}
                }
               
            },
            setCleanThreshold: (arg={unit:'day',value:5})=> {
                 let node = document.querySelector('.thresholtRemoveChat')
                let hours =  document.getElementById('cleanerRadioHourTh');
                let days =  document.getElementById('cleanerRadioDayTh');
                if (arg.unit == 'day') {
                   hours.removeAttribute('checked');
                    days.setAttribute('checked','');
                } else if (arg.unit == 'hour') { 
                    days.removeAttribute('checked');
                    hours.setAttribute('checked','');
                } else {
                    return {status:false}
                }

                node.value = arg.value;
                return {status:true}

            },
            getChatNodeAndParent: ()=>{
                let child = document.querySelector('.chatRoot');
                let parent = document.querySelector('.mainWrap');
                return {parent:parent,child:child}
            },
            /***event listeners  */
            //single clean - button event listener subroutine
            onClean: async  (evt)=>{
                let members = this.privateMembers.get(this);
                //try to clean
                    let netResult;
                    netResult = await  members.networkInteractor.removeOld(members.getCleanThreshold().results);
                    if (netResult.status) {
                        //when success
                        //update key node
                        members.notificator.showToast(true,`${netResult.msg}, time: ${new Date().toLocaleTimeString()}`)
                        members.statusNodeIndicator(true, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    } else {
                        //when fail
                        members.notificator.showToast(false,`${netResult.msg}, time: ${new Date().toLocaleTimeString()}`)
                        members.statusNodeIndicator(false, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    }
                    //regeneration of a new mesage list 
                    let newNode = await members.generateFunction();
                    //get node 
                    let nodes = members.getChatNodeAndParent();
                    //remove 
                    nodes.parent.removeChild(nodes.child);
                    //append new
                    nodes.parent.appendChild(newNode);
                    return netResult;
            },

            
        })
    }

   /***public members of ChatCleaner */
   async createCleaner () {
        //get private members
        let priv = this.privateMembers.get(this);
        //query clean options from the network
             let autocleanOpt = await priv.networkInteractor.getCleanOptions();
          
       if (!autocleanOpt.status) {
            let errorNode = document.createElement('h2');
            errorNode.classList.add('text-danger', 'h2','roboto-font-family');
            errorNode.innerText = autocleanOpt.msg;
            return errorNode;
        }
       
        //create a main node
        let mainNode = document.createElement('article');
        mainNode.setAttribute('class','m-1 cleaner-bg cleaner-text cleaner-box-radius p-3 d-flex flex-column justify-content-start align-items-center w-100');
        
        let txtString1 = document.createElement('h5');
          txtString1.setAttribute('class','roboto-font-family h5 my-1');
          txtString1.innerText = 'Cleaning  options:'
        let txtString1_1 = document.createElement('div');
          txtString1_1.setAttribute('class','message-msg-text my-1 text-left w-100');
          txtString1_1.innerText = 'Remove older that:'
        //user interface string
        let uiRadios = document.createElement('div');
          uiRadios.setAttribute('class','d-flex justify-content-center align-items-center flex-row my-1');
        //radio buttons - by Day
        let radioOne = document.createElement('input');
            radioOne.setAttribute('type','radio');
            radioOne.setAttribute('name','cleanerRadioTimeGroup');
            radioOne.setAttribute('id','cleanerRadioDayTh');
            radioOne.setAttribute('checked','');
            radioOne.setAttribute('class','form-check-input mx-2');
        ///label - by Day
        let radioLabelOne = document.createElement('label');
            radioLabelOne.setAttribute('class','form-check-label message-msg-text');
            radioLabelOne.innerText='Days';
        //radio - by Hour
        let radioTwo = document.createElement('input');
            radioTwo.setAttribute('type','radio');
            radioTwo.setAttribute('name','cleanerRadioTimeGroup');
            radioTwo.setAttribute('id','cleanerRadioHourTh');
            radioTwo.setAttribute('class','form-check-input mx-2');
        //label by hour
         let radioLabelTwo = document.createElement('label');
            radioLabelTwo.setAttribute('class','form-check-label message-msg-text');
            radioLabelTwo.innerText='Hours';
               //group radios and labels together
            uiRadios.appendChild(radioOne);
            uiRadios.appendChild(radioLabelOne);
            uiRadios.appendChild(radioTwo);
            uiRadios.appendChild(radioLabelTwo);

       //'clear' button
        let btnRemove = document.createElement('div');
            btnRemove.setAttribute('class','btnRemove');
             //assign an image
            let btnRemoveImg = document.createElement('img');
            btnRemoveImg.setAttribute('class','rounded cursor-pointer mx-3');
            btnRemoveImg.setAttribute('src','../images/clean.svg');
            //animation on click
             btnRemoveImg.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
            }
            //EVENT LISTENER << click >> 'clean once immediately'
            btnRemoveImg.onclick = async (evt) =>{
                 // priv.setAutoCleanPeriod({unit:'days',value:80});
                //ok priv.getAutoCleanPeriod(); 
                //OK priv.activateAutoCleanInput(true);
                //OK priv.activateAutoCleanStartTime(true);
                //OK priv.activateButtonApply(false)
               //OK  priv.activateButtonApply(true)
              //OK priv.setAutoCleanStatus(true)
              //OK console.log(priv.getCleanThreshold());
              ///OK priv.setCleanThreshold({unit:'hour',value:33});
             //OK    console.log(priv.setAutoCleanTime('02:15'));
             //OK console.log(priv.getAutoCleanTime());
              //OK let uuu = this._convertCleanStartTimeToNumber("3:40");
              //OK console.log(this._convertCleanStartTimeToString(uuu));

                await priv.onClean(evt)
            }

        btnRemove.appendChild(btnRemoveImg);
       ///a button wrapper
        let olderThat = document.createElement('input');
        olderThat.setAttribute('type','number');
        olderThat.setAttribute('min', 1);
        olderThat.setAttribute('max', 365);
        olderThat.setAttribute('id', 'clean-limit');
        olderThat.setAttribute('value', 3);
        olderThat.setAttribute('name', 'clean-limit');
        olderThat.setAttribute('class', 'form-control w-25 thresholtRemoveChat');
      //seconf UI string 
      let secondUIString = document.createElement('div');
        secondUIString.setAttribute('class','d-flex justify-content-between align-items-center flex-row my-1 w-100');
        secondUIString.appendChild(uiRadios);
        secondUIString.appendChild(olderThat);

      let thridCleanString = document.createElement('div');
        thridCleanString.setAttribute('class','d-flex justify-content-start align-items-center flex-row w-100 message-msg-text my-2');
      let removeText = document.createElement('div');
        removeText.setAttribute('class','h6 roboto-font-family ')
        removeText.innerText = 'Clean older that.. immediately'
        thridCleanString.appendChild(removeText);
        thridCleanString.appendChild(btnRemove); 
       ///forth string - autoclean options
      let forthStringAutoClean = document.createElement('div');
        forthStringAutoClean.setAttribute('class','p-1 message-msg-text border-top w-100') ;
        forthStringAutoClean.innerText = 'Auto-clean period..';
      ///five string -auto clean UI
      let fiveStringUI = document.createElement('div');
        fiveStringUI.setAttribute('class','d-flex flex-row justify-content-between align-items-center  w-100 my-1')
       /* let swClean = document.createElement('input');
        swClean.setAttribute('type','checkbox');
        swClean.setAttribute('role','switch');
        swClean.setAttribute('id','autoCleanSwitch');
        swClean.setAttribute('checked','');
        swClean.setAttribute('class','mx-2 my-1 form-check-input form-switch')
    let swCleanContainer = document.createElement('div');
        swCleanContainer.setAttribute('class','form-check form-switch justify-content-center align-items-center d-flex flex-row my-1 mx-2');
    let autoCleanLabel = document.createElement('div');
        autoCleanLabel.setAttribute('class','message-msg-text text-success cleanStatus m-1');
        autoCleanLabel.innerText='Enable autoclean'; */
           
          //radios for time unit choose
    let rTimeChooseMinute = document.createElement('input');
         rTimeChooseMinute.setAttribute('type','radio');
         rTimeChooseMinute.setAttribute('name','clnRadioChooseGroup');
         rTimeChooseMinute.setAttribute('id','clnUnitsMinute');
         rTimeChooseMinute.setAttribute('class','form-check-input mx-2');
    let rLabelChooseMinute = document.createElement('label');
        rLabelChooseMinute.setAttribute('class','form-check-label message-msg-text');
        rLabelChooseMinute.innerText='Minutes';

     let rTimeChooseHour = document.createElement('input');
         rTimeChooseHour.setAttribute('type','radio');
         rTimeChooseHour.setAttribute('name','clnRadioChooseGroup');
         rTimeChooseHour.setAttribute('id','clnUnitsHour');
         //default checked hours
         rTimeChooseHour.setAttribute('checked','');
         rTimeChooseHour.setAttribute('class','form-check-input mx-2');
    let rLabelChooseHour = document.createElement('label');
        rLabelChooseHour.setAttribute('class','form-check-label message-msg-text');
        rLabelChooseHour.innerText='Hours';

     let rTimeChooseDay = document.createElement('input');
        rTimeChooseDay.setAttribute('type','radio');
        rTimeChooseDay.setAttribute('name','clnRadioChooseGroup');
        rTimeChooseDay.setAttribute('id','clnUnitsDay');
        rTimeChooseDay.setAttribute('class','form-check-input mx-2');

    let rLabelChooseDay = document.createElement('label');
        rLabelChooseDay.setAttribute('class','form-check-label message-msg-text');
        rLabelChooseDay.innerText = 'Days';
    let rTimeChooseContainer = document.createElement('div');
        rTimeChooseContainer.setAttribute('class','d-flex flex-row justify-content-center align-items-center my-1');
         rTimeChooseContainer.appendChild(rTimeChooseMinute);
        rTimeChooseContainer.appendChild(rLabelChooseMinute);
        rTimeChooseContainer.appendChild(rTimeChooseHour);
        rTimeChooseContainer.appendChild(rLabelChooseHour);
        rTimeChooseContainer.appendChild(rTimeChooseDay);
        rTimeChooseContainer.appendChild(rLabelChooseDay);
    //group a switch
       
      let autoCleanInput = document.createElement('input');
      //<input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"></input>
          autoCleanInput.setAttribute('type','number');
          autoCleanInput.setAttribute('max','1000');
          autoCleanInput.setAttribute('value','3');
          autoCleanInput.setAttribute('id','autoCleanPeriodInput')
          autoCleanInput.setAttribute('class','form-control');
      let autoCleanInputContainer = document.createElement('div');
          autoCleanInputContainer.appendChild(autoCleanInput);
       ///five string
          fiveStringUI.appendChild(rTimeChooseContainer);
          fiveStringUI.appendChild(autoCleanInputContainer);
       //six static text string
        let sixStringInfo = document.createElement('div');
          sixStringInfo.setAttribute('class','message-msg-text border-top w-100 my-1 py-1');
           sixStringInfo.innerText='Start autocleaning process at..';
       //seven srting
        let sevenString = document.createElement('div');
          sevenString.setAttribute('class','d-flex flex-row justify-content-between align-items-center p-1 m-1 w-100');
             
        let inpCleanTime = document.createElement('input');
          inpCleanTime.setAttribute('type','time');
          inpCleanTime.setAttribute('class','form-control m-1 roboto-font-family');
          inpCleanTime.setAttribute('id','cleanTimeInput');
          inpCleanTime.setAttribute('min','00:00');
          inpCleanTime.setAttribute('max','11:59');
        
          //apply button
        let btnApplyClean = document.createElement('button');
          btnApplyClean.setAttribute('type','button');
          btnApplyClean.setAttribute('class','btn btn-primary roboto-button-font');
          btnApplyClean.setAttribute('id','btnApplyClean')
          btnApplyClean.innerText = 'Save options..';

          ///EVENT LISTENER <<< click >>>  'SAVE OPTIONS'
          btnApplyClean.onclick = async (evt)=>{
            //get options from DOM
            let opts = this.convertCleanOptionsToDB();
            //try to save
            let netresult = await priv.networkInteractor.saveCleanOptions(opts.results);
            if (netresult.status) {
                priv.notificator.showToast(true, netresult.msg);
            } else {
                priv.notificator.showToast(false, netresult.msg);
            }

          }

          let  inpCleanTimeContainer = document.createElement('article');
           inpCleanTimeContainer.setAttribute('class','d-inline m-1');
           inpCleanTimeContainer.appendChild(inpCleanTime);

         
          sevenString.appendChild(inpCleanTimeContainer); 
          sevenString.appendChild(btnApplyClean );
        //eight string 
        let txtEightString = document.createElement('div');
        txtEightString.setAttribute('class','d-flex flex-row justify-content-between align-items-center  my-1 border-top p-1 w-100');
        let txtEightOne = document.createElement('div');
            txtEightOne.setAttribute('class',' my-1 p-1 message-msg-text'); 
            txtEightOne.innerText = 'process status:'
         let txtEightStatusString = document.createElement('div');
           txtEightStatusString.classList.add('text-success','message-msg-text');
           txtEightStatusString.setAttribute('id','txtStatusIndicator')
           txtEightStatusString.innerText = 'Running..';
         let  txtEightStatusIcon = document.createElement('img');
           txtEightStatusIcon.setAttribute('class','rounded image_rotate');
           txtEightStatusIcon.setAttribute('src','/images/run.svg');
           txtEightStatusIcon.setAttribute('id','icoStatusIndicator')
           //grouping eight string
           txtEightString.appendChild(txtEightOne);
           txtEightString.appendChild(txtEightStatusString);
           txtEightString.appendChild(txtEightStatusIcon);
           //ten string 
     let tenStringControlProc = document.createElement('div');
           tenStringControlProc.setAttribute('class','d-flex flex-row justify-content-between align-items-center w-100');
     let procStartBtn = document.createElement('button');
         procStartBtn.setAttribute('class',' btn roboto-button-font btn-primary mx-1');
         procStartBtn.setAttribute('id','processStart')
         procStartBtn.innerText = 'Start process..';
         ///EVENT LISTENER <<click>>  
         procStartBtn.onclick = (evt) =>{
            //lock inputs
            priv.activateBtnStart(false)
            priv.activateBtnStop(true)
            priv.activateButtonSaveOpt(false)
            priv.activateCleanThreshold(false)
            priv.activateAutoCleanStartTime(false);
            priv.activateAutoCleanPeriodInput(false);
            priv.setAutoCleanStatus(true);
            priv.notificator.showToast(true,'Cleaning Process started!');
         }

     let procStopBtn = document.createElement('button');
         procStopBtn.setAttribute('class','processStop roboto-button-font btn btn-primary mx-1');
         procStopBtn.setAttribute('id','processStop')
         procStopBtn.setAttribute('disabled','');
         procStopBtn.innerText = 'Stop process..';
         tenStringControlProc.appendChild(procStartBtn);
         tenStringControlProc.appendChild(procStopBtn);
         ///EVENT LSTENER <<lick>>
         procStopBtn.onclick=(evt)=>{
            //unlock inputs
            priv.activateBtnStart(true)
            priv.activateBtnStop(false)
            priv.activateButtonSaveOpt(true)
            priv.activateCleanThreshold(true)
            priv.activateAutoCleanStartTime(true);
            priv.activateAutoCleanPeriodInput(true);
            priv.setAutoCleanStatus(false);
             priv.notificator.showToast(true,'Cleaning Process stopped!')
         }

       ///append child nodes
         
        mainNode.appendChild(txtString1);
         mainNode.appendChild(txtString1_1);
        mainNode.appendChild(secondUIString);
        mainNode.appendChild(thridCleanString);
        mainNode.appendChild(forthStringAutoClean);
        mainNode.appendChild(fiveStringUI);
        mainNode.appendChild(sixStringInfo);
        mainNode.appendChild(sevenString);
        mainNode.appendChild(txtEightString);
        mainNode.appendChild(tenStringControlProc);
        return mainNode;
        
    }
    // processing data from DB and applying to DOM 
    applyDBCleanOptions (options={
                cln_threshold_unit:0,
                cln_threshold:12,
                cln_period_unit:1,
                cln_period:14,
                cln_start:"03:45",
                service_stat:0,
    }) {
        //get private members
        let priv = this.privateMembers.get(this);
        ///CLEAN PARAMETER 1 - >  remove threshold (older that)
        switch(Number(options.cln_threshold_unit)|0) {
            //when ther are hours
            case 0:
              priv.setCleanThreshold({unit:'hour', value:options.cln_period});
            break;
            case 1:
            //when ther are days
              priv.setCleanThreshold({unit:'day', value:options.cln_period});
            break;
            default:
            //do nothing
        }
        ///CLEAN PARAMETER 2 - > auto clean period 
        switch (Number(options.cln_period_unit)|0) {
            case 0:
             //when minutes
                priv.setAutoCleanPeriod({unit:'minute', value:options.cln_threshold})
            break;
            case 1:
             //when hours 
              priv.setAutoCleanPeriod({unit:'hour', value:options.cln_threshold})
            break;
            case 2:
              //when days
              priv.setAutoCleanPeriod({unit:'day', value:options.cln_threshold})
            break;
            default:
        }
        ///CLEAN PARAMETER 3 -> start time
      priv.setAutoCleanTime(options.cln_start);
      ///SET process status - 
      if(options.service_stat & 0x01) {
        //when a process in action 
        priv.setAutoCleanStatus(true);
        //lock buttons and inputs
        //1)a threshold
        priv.activateCleanThreshold(false)
        //2)a period
        priv.activateAutoCleanPeriodInput(false)
        //3)a start time
        priv.activateAutoCleanStartTime(false);
        //4)a start process button
        priv.activateBtnStart(false);
        //5)button stop
        priv.activateBtnStop(true);
        //6) save options
        priv.activateButtonSaveOpt(false);

      } else {
        //when a process had stopped
        priv.setAutoCleanStatus(false);
        //lock buttons and inputs
        //1)a threshold
        priv.activateCleanThreshold(true)
        //2)a period
        priv.activateAutoCleanPeriodInput(true)
        //3)a start time
        priv.activateAutoCleanStartTime(true);
        //4)a start process button
        priv.activateBtnStart(true);
        //5)button stop
        priv.activateBtnStop(false);
        //5) save options
        priv.activateButtonSaveOpt(true);

      }
      return {status:true}


    }
    // reading data from DOM and converting to DB format  
    convertCleanOptionsToDB () {
      //get private members
        let priv = this.privateMembers.get(this);
        let result={
            cln_threshold_unit:0,
                cln_threshold:12,
                cln_period_unit:1,
                cln_period:14,
                cln_start:"03:45",
               
        };

        //clean threshold
       let clnThr = priv.getCleanThreshold().results;
       switch (clnThr.unit) {
        case 'hour':
          result.cln_threshold_unit = 0;
        break;
        case 'day':
          result.cln_threshold_unit = 1;
        break;
        default:
       }
         result.cln_threshold  = Number(clnThr.value)|0;
       //auto clean period;
       let clnPer = priv.getAutoCleanPeriod().results;
       switch (clnPer.unit) {
        case 'minute':
         result.cln_period_unit = 0;
        break;
        case 'hour':
         result.cln_period_unit = 1;
        break;
        case 'day':
         result.cln_period_unit = 2;
        break;
       }
        result.cln_period = Number(clnPer.value)|0;
       //start time 
       let startTime = priv.getAutoCleanTime();
       result.cln_start = startTime.value;
       return {status:true, results:result}
    }

}

class NetworkInteractor {
    
    async removeMessage(msgId) {
            return await this._sendCommand(msgId,'delmsg');
    }

    async updateKey () {
        return await this._sendCommand(true,'key');
    }

    async saveCleanOptions (opts) {
        return await this._sendCommand(opts,'cln_opt');
    }

    async removeOld (timeObj={unit:'day',value:1}) {
        let seconds;
        if (timeObj.unit == 'day') {
            seconds = 86400 * timeObj.value;
        } else if (timeObj.unit == 'hour') {
            seconds = 3600 * timeObj.value;
        } 
        return await this._sendCommand(seconds,'remold');
    }

    async getFullChat () {
         return await this._queryData('chat');
    }
    
    async getCleanOptions () {
        return await this._queryData('cln_opt');
    }

   

    async _queryData (comm) {
        //define the adress - where you want to send
    const currentUrl = new URL(document.location.href)
    let response;
    // current base URL
    // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
     let url = `${currentUrl.origin}${currentUrl.pathname}data${currentUrl.port}`;
    const options={
        headers:{"Content-type":"application/json;charset=utf-8"},
        body:JSON.stringify({command:comm}),
        method:'post'
    }
    try {
        response = await fetch(`${url}`, options);
    } catch (e) {
        return {
                status: false,
                msg: e, 
                value: null
             }
    }
    //save stsatus code 
    let statusCode = response.status;
    if (statusCode == 403) {
        window.setTimeout(()=>{
          window.location.replace(`${currentUrl.protocol}//${currentUrl.hostname}/login${currentUrl.port}`);
        },1000)
       

        return {status:false, msg:'Forbidden!',value:`${currentUrl.protocol}//${currentUrl.hostname}/login${currentUrl.port}`}
    }
  
    if (statusCode !== 200) {
        return {status:false, msg:`${response.status},${response.statusText}`};
    }
    //read JSON data 
    let jsonData = await response.json();
       return jsonData;
    }

    async _sendCommand (data, command) {

            //define the adress - where you want to send
            const currentUrl = new URL(document.location.href)
            let resp_;
            // current base URL
            // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
            let  url = `${currentUrl.protocol}//${currentUrl.hostname}/admin/command${currentUrl.port}`;
            const options={
                headers:{"Content-type":"application/json;charset=utf-8"},
                body:JSON.stringify({ 
                    command: command, 
                    data: data,
                }),
                method:'post',
            }
            try {
                resp_ = await fetch(url, options);
            } catch (e) {
                return {
                        status: false,
                        msg: e, 
                        value: null
                    }
            }
            //save stsatus code 
            let statusCode = resp_.status;
            //-------<< FIX a json parse bug
            if (statusCode == 403) {
                window.setTimeout(()=>{
                    window.location.replace(`${currentUrl.protocol}//${currentUrl.hostname}/login${currentUrl.port}`);
                  },1000)
                return {status:false, msg:'Forbidden!',value:`${currentUrl.protocol}//${currentUrl.hostname}/login${currentUrl.port}`}
            }
          
            if (statusCode !== 200) {
                return {status:false, msg:`${resp_.status}, ${resp_.statusText}`,value:null};
            }
            //read JSON data 
            let jsonData = await resp_.json();
            return jsonData;
    }


}
//hmlHttpRquest based  - NOT USED !!!
class XhtmlNetworkInterractor {


    async removeMessage(msgId) {
            return await this._sendCommand(msgId,'delmsg');
    }

    async updateKey () {
        return await this._sendCommand(true,'key');
    }

    async saveCleanOptions (opts) {
        return await this._sendCommand(opts,'cln_opt');
    }

    async removeOld (timeObj={unit:'day',value:1}) {
        let seconds;
        if (timeObj.unit == 'day') {
            seconds = 86400 * timeObj.value;
        } else if (timeObj.unit == 'hour') {
            seconds = 3600 * timeObj.value;
        } 
        return await this._sendCommand(seconds,'remold');
    }

    async getFullChat () {
         return await this._queryData('chat');
    }
    
    async getCleanOptions () {
        return await this._queryData('cln_opt');
    }

   


    async _queryData(command) {
        return   new Promise((resolve, reject) => {
                //define the adress - where you want to send
                const currentUrl = new URL(document.location.href)
                let resp_;
                // current base URL
                // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
                let  url = `${currentUrl.protocol}//${currentUrl.hostname}/admin/data${currentUrl.port}`;
                var xhr = new XMLHttpRequest();

                // listen for `load` event
                xhr.onload = () => {

                    // print JSON response
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // parse JSON
                        const response = JSON.parse(xhr.responseText);
                        console.log(response);
                        resolve(response);
                    }
                };

                //when error
                xhr.onerror = (e) => {
                    resolve({status:false,msg:e})
                }

                // create a JSON object
                const json = {
                    
                    "command": command
                };

                // open request
                xhr.open('POST', url);

                // set `Content-Type` header
                xhr.setRequestHeader('Content-Type', 'application/json');

                // send rquest with JSON payload
                xhr.send(JSON.stringify(json));      
        });


    }

    async _sendCommand(data, command) {
     return   new Promise((resolve, reject) => {
                //define the adress - where you want to send
                const currentUrl = new URL(document.location.href)
                let resp_;
                // current base URL
                // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
                let  url = `${currentUrl.protocol}//${currentUrl.hostname}/admin/command${currentUrl.port}`;
                var xhr = new XMLHttpRequest();

                // listen for `load` event
                xhr.onload = () => {

                    // print JSON response
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // parse JSON
                        const response = JSON.parse(xhr.responseText);
                        console.log(response);
                        resolve(response);
                    }
                };

                //when error
                xhr.onerror = (e) => {
                    resolve({status:false,msg:e})
                }

                // create a JSON object
                const json = {
                    "data": data,
                    "command": command
                };

                // open request
                xhr.open('POST', url);

                // set `Content-Type` header
                xhr.setRequestHeader('Content-Type', 'application/json');

                // send rquest with JSON payload
                xhr.send(JSON.stringify(json));      
        });


    }

}