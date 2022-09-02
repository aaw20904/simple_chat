window.onload=async()=>{
  
    let usrCtrl = new UserControl(new NetworkInteractor(), setStatusString);
    document.querySelector('.tableWrapper').appendChild(await usrCtrl.createTable());  

}

class UserControl {
    constructor (networkInteractor=null, statusNodeIndicator=(status=true, msg="*")=>{}) {
        
        //making a hide property
      this.privateMembers = new WeakMap();
       //assign a 'private' - it may be an object
      this.privateMembers.set(this, {
        networkInteractor: networkInteractor,
        statusNodeIndicator: statusNodeIndicator,
        /***event listeners  */
        onRemove: async (evt)=>{
            let usrId = evt.target.parentNode.parentNode.parentNode.getAttribute('data-usr-id');
            //try to remove
            //try to change 
             let netResult;
             netResult = await networkInteractor.removeUser(usrId);
             if (netResult.status) {
                //when success
                statusNodeIndicator(true, netResult.msg);
             }
             netResult.value = usrId;
             return netResult;
             
        },
        onLock: async (evt, usrId)=>{
            let btnState = evt.target.getAttribute('data-btn-state');
             //try to change 
             let netResult;
             if (btnState == 'true') {
                netResult = await networkInteractor.clearLock(usrId);
             } else {
                 netResult = await networkInteractor.setLock(usrId);
             }
            
             //change DOM elements 
             if (!netResult.status) {
                statusNodeIndicator(false, netResult.msg);
                return netResult;
             }
             //when locked - then unlock
            if ( btnState == 'true') {
                //clear lock attribute
                evt.target.setAttribute('data-btn-state', 'false');
                //change an image
                evt.target.setAttribute('src','../images/unlock.svg');
            } else {
                //set lock attribute
                evt.target.setAttribute('data-btn-state','true');
                //change an image
                evt.target.setAttribute('src','../images/lock.svg');
            }
            statusNodeIndicator(true, `${netResult.msg} ${new Date().toLocaleTimeString()}`);
            return netResult;
        },
       
        onClearFail: async (evt)=>{
             let usrId = evt.target.parentNode.parentNode.parentNode.getAttribute('data-usr-id');
               let netResult;
             netResult = await networkInteractor.clearFail(usrId);
             if (netResult.status) {
                //when success
                statusNodeIndicator(true, netResult.msg);
             } else {
                statusNodeIndicator(false, netResult.msg);
             }
             netResult.value = usrId;
             return netResult;
        },
      })    
    }

    removeUserControlItemRow(usrId) {
        let tableNode = document.querySelector('tbody');
        let targetNode = tableNode.querySelector(`[data-usr-id="${usrId}"]`);
        if (targetNode) {
            tableNode.removeChild(targetNode);
            return {status:true}
        } else {
            return {status:false}
        }
        
    }

    clearAttemptsValue (usrId) {
        let tableNode = document.querySelector('tbody');
        let targetNode = tableNode.querySelector(`.fail-att`);
        targetNode.innerText = '0';
    }

    createUserControlItemRow (arg={usrAvatar:'x' ,usrName:'x', usrId:0, failLogins:0, usr_lock:false, login_state:true}) {
        let items =[];
        //get private members
        let priv = this.privateMembers.get(this);
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
            failAttemptsItem.setAttribute('class','m-1 users-text fail-att');
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
                btnLockImg.setAttribute('data-btn-state','true');
            } else {
                btnLockImg.setAttribute('src','../images/unlock.svg');
                 btnLockImg.setAttribute('data-btn-state','false');
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
        /////ADD  E V E N T   L I S T E N E R S/////////////////
         //I)
         btnLock.addEventListener('click',async (evt)=>{
          
            await priv.onLock(evt, messageContainer.getAttribute('data-usr-id'));
           
         })
         //II)
         btnRemoveUser.addEventListener('click',async (evt)=>{
            let res =  await priv.onRemove(evt);
            if(res.status) {
                this.removeUserControlItemRow(res.value);
            }
         })
         //III)
         btnClearFailAttempts.addEventListener('click', async (evt)=>{
            let res = await priv.onClearFail(evt);
            if (res.status) {
                this.clearAttemptsValue(res.value)
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

    async createTable (arg=[]) {
         //get private members
        let priv = this.privateMembers.get(this);
        //get data from the network
        let tableRows = await priv.networkInteractor.getRows();
        if (!tableRows.status){
            let node = document.createElement('h5');
            h5.innerText = priv.msg;
            return node
        }
        arg = tableRows.value;
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

function setStatusString (status=true, msg='*') {
  let node = document.querySelector('#statusString');
  if(status) {
    node.setAttribute('class','text-success');
  } else {
    node.setAttribute('class','text-danger');
  }
  node.innerText = msg;
}



class NetworkInteractor {
    
    async setLock(usrId) {
            return await this._sendCommand(usrId,'lock');
    }

    async clearLock(usrId) {
            //define the adress - where you want to send
            const currentUrl = new URL(document.location.href)
            let resp;
            // current base URL
            // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
           let  url = `${currentUrl.protocol}//${currentUrl.hostname}/admin/command${currentUrl.port}`;
            const options={
                headers:{"Content-type":"application/json;charset=utf-8"},
                body:JSON.stringify({ 
                    command: 'unlock', 
                    data: usrId,
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

    async getRows () {
         //define the adress - where you want to send
            const currentUrl = new URL(document.location.href)
            let resp;
            // current base URL
            // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
           let  url = `${currentUrl.protocol}//${currentUrl.hostname}/admin/data${currentUrl.port}`;
            const options={
                headers:{"Content-type":"application/json;charset=utf-8"},
                body:JSON.stringify({ 
                    command: 'users', 
                    
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

    async clearFail(usrId) {
        return await this._sendCommand(usrId,'clear'); 
    }

    async removeUser (usrId) {
        return await this._sendCommand(usrId,'delete'); 
    }

    async _sendCommand (usrId, command) {

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
                    data: usrId,
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