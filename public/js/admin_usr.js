window.onload=async()=>{
  //define the adress - where you want to send
    const currentUrl = new URL(document.location.href)
    let response;
    // current base URL
    // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
     url = `${currentUrl.protocol}//${currentUrl.hostname}/admin/data${currentUrl.port}`;
    const options={
        headers:{"Content-type":"application/json;charset=utf-8"},
        body:JSON.stringify({ 
               command:'users'
            }),
        method:'post'
    }
    try {
        response = await fetch(url, options);
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
    //let chatData = jsonData.chat;
    let usersData = jsonData.users; 
  
    let usrCtrl = new UserControl();
    document.querySelector('.tableWrapper').appendChild(usrCtrl.createTable(usersData));


}

class UserControl {
    constructor (networkInterractor=null, statusNode=null) {
        
        //making a hide property
      this.privateMembers = new WeakMap();
       //assign a 'private' - it may be an object
      this.privateMembers.set(this,{
        network: networkInterractor,
        statusNode: statusNode,
        onRemove: (evt)=>{

        },
        onLock: (evt)=>{

        },
        onUnlock: (evt)=>{

        },
        onClearFail: (evt)=>{

        }
      })    
    }
    createUserControlItemRow (arg={usrAvatar:'x' ,usrName:'x', usrId:0, failLogins:0, usr_lock:false, login_state:true}) {
        let items =[];
        //create a container <TR> - a table of a row
        let messageContainer = document.createElement('tr');
        //set attribute
        messageContainer.setAttribute('data-usr-id', arg.usrId);
        //message-box-radius  border-primary message-box-normal-bg d-flex flex-wrap flex-row justify-content-around align-items-center w-100 my-1
        messageContainer.setAttribute('class','py-1');
        //a) first element - an image
        let avatarItem = document.createElement('img');
            avatarItem.src = arg.usrAvatar;
            avatarItem.classList.add('my-2','rounded','m-1');
            items.push(avatarItem);
        //b) user name
        let usrNameItem = document.createElement('h6');
            usrNameItem.setAttribute('class','d-flex users-text ms-2 justify-content-center align-items-center');
            usrNameItem.innerText = arg.usrName;
            items.push(usrNameItem);
        //c) fail attempts
        let failAttemptsItem = document.createElement('div');
            failAttemptsItem.setAttribute('class','m-1','users-text');
            failAttemptsItem.innerText = arg.failLogins;
            items.push(failAttemptsItem);
        /*let lockItem = document.createElement('div');
            lockItem.setAttribute('class','m-1');
            lockItem.innerText  = arg.usr_lock;*/
        //d) is log in
        let isLoginItem = document.createElement('div');
            isLoginItem.setAttribute('class','m-1','users-text');
            isLoginItem.innerText = arg.login_state;
            items.push(isLoginItem);
        //e) lock/unlock button
        let btnLock = document.createElement('div');
           
            btnLock.setAttribute('class','btnLock d-block');
        let btnLockImg = document.createElement('img');
            btnLockImg.classList.add('cursor-pointer');
           //when user is locked - assign  corresponding image
            if (arg.usr_lock) {
                btnLockImg.setAttribute('src','../images/lock.svg');
                btnLockImg.setAttribute('data-btn-state',true);
            } else {
                btnLockImg.setAttribute('src','../images/unlock.svg');
                 btnLockImg.setAttribute('data-btn-state',false);
            }
            //animation on click
          /*   btnLockImg.onclick=(evt)=>{
                evt.target.classList.add('clickAnimation');
                window.setTimeout(()=>{
                    evt.target.classList.remove('clickAnimation')
                },1000)
            } */

            btnLock.appendChild(btnLockImg);

            items.push(btnLock);
        //f) clear fail attempts button
        let btnClearFailAttempts = document.createElement('div');
         
          btnClearFailAttempts.setAttribute('class','btnClearFailAttepts d-block');
        let btnClearFailAttemptsImg = document.createElement('img');
            btnClearFailAttemptsImg.classList.add('cursor-pointer');
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
             
            btnRemoveUser.setAttribute('class','btnRemove');
             //assign an image
         let btnRemoveUserImg = document.createElement('img');
            btnRemoveUserImg.setAttribute('class','rounded cursor-pointer');
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
        /////ADD  E V E N T   L I S T E N E R S
         //I)
         btnLock.addEventListener('click',(evt)=>{
            //when locked - then unlock
            if ( evt.currentTarget.getAttribute('data-btn-state') ) {
                //clear lock attribute
                evt.currentTarget.setAttribute('data-btn-state',false);
                //change an image
                evt.currentTarget.firstChild.setAttribute('src','../images/unlock.svg');
            } else {
                //set lock attribute
                evt.currentTarget.setAttribute('data-btn-state',true);
                //change an image
                evt.currentTarget.firstChild.setAttribute('src','../images/lock.svg');
            }
         })

         ///////assign children to the parent
         items.forEach(item=>{
            let td = document.createElement('td');
            td.setAttribute('style','vertical-align:middle;');
            td.classList.add('text-center');
            td.appendChild(item);
            messageContainer.appendChild(td);
         })
         return messageContainer;

    }

    createTable (arg=[]) {
          //get private members
         let priv = this.privateMembers.get(this);
        let tableWrapper = document.createElement('article');
        tableWrapper.classList.add('d-flex','justify-content-center','align-items-center');
          //main table node 
        let tableNode = document.createElement('table');
        tableNode.classList.add('table','table-striped','users-box-radius','m-1');
        let tbody = document.createElement('tbody');
         // tbody.classList.add('users-body-bg');
         //header
        let thead = document.createElement('thead');
        thead.classList.add('users-head-bg');
        let theadTr = document.createElement('tr');
         //create column names and assign it to <tr>
        let fields =[ 'Avatar', 'Name', 'fails','isLogin', 'lock_btn','clear_fails','remove_btn' ];
        fields.forEach(y=>{
            let node = document.createElement('th');
            node.classList.add('users-text', 'text-center')
            node.innerText = y;
            theadTr.appendChild(node)
        })
         //assemble thead
        thead.appendChild(theadTr);
         //assemble tbody
        arg.forEach(y=>{
            let row = this.createUserControlItemRow(y);
            //row.classList.add('border-primary');
            tbody.appendChild(row);
        })

        //whole table
        tableNode.appendChild(thead);
        tableNode.appendChild(tbody);
        tableWrapper.appendChild(tableNode);
    return tableWrapper;

    }
    


   
}

class NetworkInteractor {
    main(){

    }
}