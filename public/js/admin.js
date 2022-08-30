window.onload=async ()=>{
    let msgList = new MessageList();
    let usrControl = new UserControl();
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

     usersData.forEach(v=>{
        let userItem = usrControl.createUserControlItem(v);
        document.querySelector('.messageList').appendChild(userItem);
     })

  
}

/******************** */

function arrayBufferToBase64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	return window.btoa( binary );
}


function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

class MessageList{
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

    ///wrapper for a button
    createBtnWrapper(chatItem) {
        //create a container 
        let messageContainer = document.createElement('section');
        //set attribute
        messageContainer.setAttribute('data-message-id', chatItem.getAttribute('data-msgid'));
        messageContainer.setAttribute('class','message-box-radius  border-primary message-box-normal-bg d-flex flex-column justify-content-center align-items-center w-100 my-1');
        //a button`s row
        let btnContainer = document.createElement('div');
        btnContainer.setAttribute('class','d-flex flex-row justify-content-center align-items-end flex-column mt-2 p-0 message-limits');
        //a button
        let btn  = document.createElement('input');
        btn.setAttribute('type','image');
        btn.setAttribute('src','../images/close.png');
        btn.setAttribute('style','height:30px;width:30px;');
        btn.setAttribute('class','btnRemove');
        //assign to a button
        btnContainer.appendChild(btn);
        //append children
        messageContainer.appendChild(btnContainer);
        messageContainer.appendChild(chatItem);
        return messageContainer;

    }
}

class UserControl {
    createUserControlItem (arg={usrAvatar:'x' ,usrName:'x', usrId:0, failLogins:0, usr_lock:false, login_state:true}) {
        let items =[];
        //create a container 
        let messageContainer = document.createElement('section');
        //set attribute
        messageContainer.setAttribute('data-usr-id', arg.usrId);
        messageContainer.setAttribute('class','message-box-radius  border-primary message-box-normal-bg d-flex flex-wrap flex-row justify-content-around align-items-center w-100 my-1');
        //a) first element - an image
        let avatarItem = document.createElement('img');
            avatarItem.src = arg.usrAvatar;
            avatarItem.classList.add('my-2','rounded','m-1');
            items.push(avatarItem);
        //b) user name
        let usrNameItem = document.createElement('h6');
            usrNameItem.setAttribute('class','d-flex message-name-text ms-2 justify-content-center align-items-center');
            usrNameItem.innerText = arg.usrName;
            items.push(usrNameItem);
        //c) fail attempts
        let failAttemptsItem = document.createElement('div');
            failAttemptsItem.setAttribute('class','m-1');
            failAttemptsItem.innerText = arg.failLogins;
            items.push(failAttemptsItem);
        /*let lockItem = document.createElement('div');
            lockItem.setAttribute('class','m-1');
            lockItem.innerText  = arg.usr_lock;*/
        //d) is log in
        let isLoginItem = document.createElement('div');
            isLoginItem.setAttribute('class','m-1');
            isLoginItem.innerText = arg.login_state;

            items.push(isLoginItem);
        //e) lock/unlock button
        let btnLock = document.createElement('div');
           btnLock.setAttribute('style',"width:30px; height:30px;");
           btnLock.setAttribute('class','btnLock d-block');
        let btnLockImg = document.createElement('img');
           //when user is locked - assign  corresponding image
            if (arg.usr_lock) {
                btnLockImg.setAttribute('src','../images/lock.svg');
            } else {
                btnLockImg.setAttribute('src','../images/unlock.svg');
            }
            //animation on click
             btnLockImg.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
            }
            btnLock.appendChild(btnLockImg);

            items.push(btnLock);
        //f) clear fail attempts button
        let btnClearFailAttempts = document.createElement('div');
          btnClearFailAttempts.setAttribute('style',"width:30px; height:30px;");
          btnClearFailAttempts.setAttribute('class','btnClearFailAttepts d-block');
        let btnClearFailAttemptsImg = document.createElement('img')
            btnClearFailAttemptsImg.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
            }
            //assign an image
           btnClearFailAttemptsImg.setAttribute('src','../images/clear_fail_attempts.svg');
           btnClearFailAttempts.appendChild(btnClearFailAttemptsImg);
           items.push(btnClearFailAttempts);
        //g)Remove user buton
         let btnRemoveUser = document.createElement('div');
            btnRemoveUser.setAttribute('style',"width:30px; height:30px;");
            btnRemoveUser.setAttribute('class','btnRemove');
             //assign an image
         let btnRemoveUserImg = document.createElement('img');
            btnRemoveUserImg.setAttribute('class','rounded');
            btnRemoveUserImg.setAttribute('src','../images/remove.svg');
            //animation on click
             btnRemoveUserImg.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
            }
            btnRemoveUser.appendChild(btnRemoveUserImg);
            items.push(btnRemoveUser);
         ///////assign children to the parent
         items.forEach(item=>{
            messageContainer.appendChild(item);
         })
         return messageContainer;

    }
}