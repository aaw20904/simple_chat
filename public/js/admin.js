window.onload=async ()=>{
    
    let networkInteractor = new NetworkInteractor();
    let msgList = new MessageList(networkInteractor, statusNodeIndicator);
    let keyControl = new CryptoKeyControl(networkInteractor, statusNodeIndicator);
    let cleanControl = new ChatCleaner(networkInteractor, statusNodeIndicator, updateFunc);
    
    async function updateFunc() {
        return await msgList.buildFullMessageList();
    }
   
     document.querySelector('.mainWrap').appendChild(keyControl.makeKeyNode('a4s4dsa364d64fes354efs'));
     let y = await cleanControl.createCleaner()
     document.querySelector('.mainWrap').appendChild(y); 
     document.querySelector('.mainWrap').appendChild(await msgList.buildFullMessageList());
 
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

class MessageList{
    constructor(networkInteractor = null, statusNodeIndicator=null) {
               //making a hide property
      this.privateMembers = new WeakMap();
      //assign a 'private' - it may be an object
     this.privateMembers.set(this, {
            myVar:1123,
            networkInteractor: networkInteractor,
            statusNodeIndicator: statusNodeIndicator,
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
                        members.statusNodeIndicator(true, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    } else {
                        //when fail
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
            if(result.status) {
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
    constructor(networkInteractor = null, statusNodeIndicator=null) {
                //making a hide property
        this.privateMembers = new WeakMap();
        //assign a 'private' - it may be an object
        this.privateMembers.set(this, {
            networkInteractor: networkInteractor,
            statusNodeIndicator: statusNodeIndicator,
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
                        members.statusNodeIndicator(true, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    } else {
                        //when fail
                        members.statusNodeIndicator(false, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
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
    constructor (networkInteractor = null, statusNodeIndicator=null, generateListFunction=()=>{return null}) {
                //making a hide property
        this.privateMembers = new WeakMap();
        //assign a 'private' member of the class- it may be an object
        this.privateMembers.set(this, {
            networkInteractor: networkInteractor,
            statusNodeIndicator: statusNodeIndicator,
            generateFunction: generateListFunction,
            getThreshold: (evt)=>{
                let node = evt.target.parentNode.parentNode.parentNode.querySelector('.thresholtRemoveChat')
                let hours =  evt.target.parentNode.parentNode.parentNode.querySelector('#cleanerRadioHour');
                let days =  evt.target.parentNode.parentNode.parentNode.querySelector('#cleanerRadioDay');
                if(hours.checked) {
                    //when hour selected - return  a period as seconds
                    return node.value * 3600;
                } else if (days.checked) {
                    //when day selected - return a  period as seconds
                    return node.value * 3600 * 24;
                }
               
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
                    netResult = await  members.networkInteractor.removeOld(members.getThreshold(evt));
                    if (netResult.status) {
                        //when success
                        //update key node
                        members.statusNodeIndicator(true, `${netResult.msg}, time: ${new Date().toLocaleTimeString()}`);
                    } else {
                        //when fail
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
        
        let txtString1 = document.createElement('div');
        txtString1.innerText = 'Cleaning  options:'
        //user interface string
        let uiRadios = document.createElement('div');
        uiRadios.setAttribute('class','d-flex justify-content-center align-items-center flex-row my-1');
        //radio buttons - by Day
        let radioOne = document.createElement('input');
            radioOne.setAttribute('type','radio');
            radioOne.setAttribute('name','cleanerRadioTimeGroup');
            radioOne.setAttribute('id','cleanerRadioDay');
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
            radioTwo.setAttribute('id','cleanerRadioHour');
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
            btnRemoveImg.setAttribute('class','rounded cursor-pointer');
            btnRemoveImg.setAttribute('src','../images/remove.svg');
            //animation on click
             btnRemoveImg.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
            }
            //event listener on click
            btnRemoveImg.onclick = async (evt) =>{
                await priv.onClean(evt)
            }

        btnRemove.appendChild(btnRemoveImg);
       ///a button wrapper
        let olderThat = document.createElement('input');
        olderThat.setAttribute('type','number');
        olderThat.setAttribute('min', 1);
        olderThat.setAttribute('max', 365);
        olderThat.setAttribute('id', 'clean-limit');
        olderThat.setAttribute('value', 1);
        olderThat.setAttribute('name', 'clean-limit');
        olderThat.setAttribute('class', 'form-control w-25 thresholtRemoveChat');
      //seconf UI string 
      let secondUIString = document.createElement('div');
        secondUIString.setAttribute('class','d-flex justify-content-between align-items-center flex-row w-100');
        secondUIString.appendChild(uiRadios);
        secondUIString.appendChild(olderThat);

      let thridCleanString = document.createElement('div');
        thridCleanString.setAttribute('class','d-flex justify-content-between align-items-center flex-row w-100 message-msg-text my-2');
      let removeText = document.createElement('div');
        removeText.innerText = 'Push to clean messages older that..'
        thridCleanString.appendChild(removeText);
        thridCleanString.appendChild(btnRemove); 
       ///forth string - autoclean options
      let forthStringAutoClean = document.createElement('div');
        forthStringAutoClean.setAttribute('class','p-1 message-msg-text border-top w-100') ;
        forthStringAutoClean.innerText = 'Clean period (Days):';
      ///five string -auto clean UI
      let fiveStringUI = document.createElement('div');
        fiveStringUI.setAttribute('class','d-flex flex-row justify-content-between align-items-center p-1 w-100')
      let swClean = document.createElement('input');
          swClean.setAttribute('type','checkbox');
          swClean.setAttribute('role','switch');
          swClean.setAttribute('id','autoCleanSwitch');
          swClean.setAttribute('checked','');
          swClean.setAttribute('class','mx-2 my-1 form-check-input form-switch')
      let swCleanContainer = document.createElement('div');
          swCleanContainer.setAttribute('class','form-check form-switch justify-content-center align-items-center d-flex flex-row my-1 mx-2');
      let autoCleanLabel = document.createElement('div');
          autoCleanLabel.setAttribute('class','message-msg-text text-success cleanStatus m-1');
          autoCleanLabel.innerText='Enable autoclean';
    //group a switch
          swCleanContainer.appendChild(swClean);
          swCleanContainer.appendChild(autoCleanLabel);
    
      let autoCleanInput = document.createElement('input');
      //<input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"></input>
          autoCleanInput.setAttribute('type','number');
          autoCleanInput.setAttribute('max','1000');
          autoCleanInput.setAttribute('placeholder','1');
          autoCleanInput.setAttribute('class','form-control');
      let autoCleanInputContainer = document.createElement('div');
          autoCleanInputContainer.appendChild(autoCleanInput);
       ///five string
          fiveStringUI.appendChild(swCleanContainer);
          fiveStringUI.appendChild(autoCleanInputContainer);
       //six static text string
          let sixStringInfo = document.createElement('div');
          sixStringInfo.setAttribute('class','message-msg-text border-top w-100')
       ///append child nodes
          sixStringInfo.innerText='Start time of cleaning';
        mainNode.appendChild(txtString1);
        mainNode.appendChild(secondUIString);
        mainNode.appendChild(thridCleanString);
        mainNode.appendChild(forthStringAutoClean);
        mainNode.appendChild(fiveStringUI);
        mainNode.appendChild(sixStringInfo);
        return mainNode;
        
    }
}

class NetworkInteractor {
    
    async removeMessage(msgId) {
            return await this._sendCommand(msgId,'delmsg');
    }

    async updateKey () {
        return await this._sendCommand(true,'key');
    }

    async removeOld (seconds) {
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
            let resp;
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
                resp = await fetch(url, options);
            } catch (e) {
                return {
                        status: false,
                        msg: e, 
                        value: null
                    }
            }
            //save stsatus code 
            let statusCode = resp.status;
            if (statusCode !== 200) {
                return {status:false, msg:`${resp.status}, ${resp.statusText}`};
            }
            //read JSON data 
            let jsonData = await resp.json();
            return jsonData;
    }


}