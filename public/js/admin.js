window.onload=async ()=>{
    let msgList = new MessageList();
     //define the adress - where you want to send
    const currentUrl = new URL(document.location.href)
    let response;
    // current base URL
    // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
     url = `${currentUrl.origin}${currentUrl.pathname}/data${currentUrl.port}`;
    const options={
        headers:{"Content-type":"application/json;charset=utf-8"},
        body:JSON.stringify({date: new Date().getMilliseconds()}),
        method:'post'
    }
    try{
        response = await fetch(`${url}`,options);
    } catch(e){
        
        return {status:false, msg:e, value:null}
    }
    //save stsatus code 
    let statusCode = response.status;
    if(statusCode !== 200) {
        return {status:false, msg:`${response.status},${response.statusText}`};
    }
    //read JSON data 
    let jsonData = await response.json();
     
  let chatItem =  msgList.createMessageItem(jsonData[0]);
  document.querySelector('.messageList').appendChild(chatItem);
    
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
                            usrName:null, 
                            sent:null,
                            usrId:null,
                            msgId:null, 
                            message:null, 
                            usrAvatar:null
                        }) {
        //create main container
        let mainContainer = document.createElement('article');
        mainContainer.classList.add( 'message-box-radius', 'message-box-normal-bg','d-flex','flex-column','justify-content-center','align-items-center');
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
            messageD.setAttribute('class',' message-msg-text message-box-radius message-normal-bg p-1 my-1 mx-2');
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
}