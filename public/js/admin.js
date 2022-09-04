window.onload=async ()=>{
    
    let networkInteractor = new NetworkInteractor();
    let msgList = new MessageList(networkInteractor,statusNodeIndicator);
    let keyControl = new CryptoKeyControl();
    let cleanControl = new ChatCleaner();
     //define the adress - where you want to send
    const currentUrl = new URL(document.location.href)
    let response;
    // current base URL
    // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
     url = `${currentUrl.origin}${currentUrl.pathname}/data${currentUrl.port}`;
    const options={
        headers:{"Content-type":"application/json;charset=utf-8"},
        body:JSON.stringify({command:'chat'}),
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
    let chatData = jsonData.chat;
    let usersData = jsonData.users;
     
     chatData.forEach(v=>{
        let chatItem = msgList.createMessageItem(v);
        let wrapped = msgList.createBtnWrapper(chatItem);
        document.querySelector('.messageList').appendChild(wrapped);
     })

     
     
     document.querySelector('.messageList').appendChild(keyControl.makeKeyNode('a4s4dsa364d64fes354efs'));
     document.querySelector('.container').appendChild(cleanControl.createCleaner());
 
}

/******************** */
function statusNodeIndicator(status=true, text='*'){
    let node = document.querySelector('.statind');
    if(status){
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
     getMessageId: (evt)=>{
         let result = evt.target.parentNode.parentNode.parentNode.getAttribute('data-message-id');
         return result;
     },
     /***event listeners  */
     onUpdate: async  (evt)=>{
         let members = this.privateMembers.get(this);
         let msgId = members.getMessageId(evt); //evt.target.parentNode.parentNode.parentNode.getAttribute('data-message-id');
         //try to update
         
             let netResult;
             netResult = await  members.networkInteractor.updateKey();
             if (netResult.status) {
                 //when success
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
        btn.setAttribute('class','cursor-pointer');
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
        btn.onclick=(evt)=>{

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
    createCleaner () {
        //create a main node
        let mainNode = document.createElement('article');
        mainNode.setAttribute('class','m-1 cleaner-bg cleaner-text cleaner-box-radius p-2 d-flex flex-row justify-content-around align-items-center w-100');
        let txtString1 = document.createElement('div');
        txtString1.innerText = 'Remove  older than (days):'

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

        btnRemove.appendChild(btnRemoveImg);
        let olderThat = document.createElement('input');
        olderThat.setAttribute('type','number');
        olderThat.setAttribute('min', 1);
        olderThat.setAttribute('max', 365);
        olderThat.setAttribute('id', 'clean-limit');
        olderThat.setAttribute('value', 1);
        olderThat.setAttribute('name', 'clean-limit');
        olderThat.setAttribute('class', 'form-control w-25');
        ///append child nodes
        mainNode.appendChild(txtString1);
        mainNode.appendChild(olderThat);
        mainNode.appendChild(btnRemove);
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