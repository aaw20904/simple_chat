window.onload=async ()=>{
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
    let image = jsonData[0].usrAvatar;
    let x = Array.prototype.join(image.data);
     console.log(x);
}

class messageList{
  //create an DOM item with user name message time and the avatar (one message) 
  //usrName, usrId, msgId, message, sent, usrAvatar
    createMessageItem (arg={usrName:null, sent:null, usrId:null, msgId:null, message:null, usrAvatar:null}) {
        //create main container
        let mainContainer = document.createElement('article');
        mainContainer.classList.add('border','border-primary','message-box-normal-bg','d-flex','flex-column','justify-content-center','align-items-center');
        //attributes
        mainContainer.setAttribute('data-msgid', arg.msgId);
        mainContainer.setAttribute('data-usrid', arg.usrId);
        //items
        //A) usrName
        let usrNameD = document.createElement('div');
            usrNameD.setAttribute('class','d-flex user-text justify-content-center align-items-center');
        
            usrNameD.innerText = arg.usrName;
        //B) message
        let messageD = document.createElement('div');
            messageD.setAttribute('class','border message-text border-primary message-normal-bg p-1 m-1');
            messageD.innerText = arg.message;
        //C)date 
        let sentD = document.createElement('div');
            sentD.setAttribute('class','time-text')
        //D)image 
        let avatarD = document.createElement('img');
            avatarD.src = usrAvatar;
        ///the first string - username and date
        let firstString = document.createElement('div');
            firstString.setAttribute('class','d-flex flex-row justify-content-center align items-center p-1');
            //assign childs
            firstString.appendChild(avatarD);
            firstString.appendChild(usrNameD);
    }
}