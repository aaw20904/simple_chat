window.onload=async ()=>{
    let msgList = new MessageList();
    let usrControl = new UserControl();
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

     let myTable = usrControl.createTable(usersData);
     
     document.querySelector('.messageList').appendChild(keyControl.makeKeyNode('a4s4dsa364d64fes354efs'));
     document.querySelector('.container').appendChild(cleanControl.createCleaner());
     document.querySelector('.container').appendChild(myTable);
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
        //append children
        messageContainer.appendChild(btnContainer);
        messageContainer.appendChild(chatItem);
        return messageContainer;

    }
}



class CryptoKeyControl {
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