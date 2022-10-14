 alert(new Date().toLocaleTimeString());

 window.onload = async () => {
    let httpInterface = new NetworkInteractor();
    let allTheChat = await httpInterface.getFullChat();
    console.log(allTheChat);
 }

class NetworkInteractor {
    
    async getFullChat () {
         return await this._queryData('chat');
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
                return {status:false, msg:'Forbidden!', value:`${currentUrl.protocol}//${currentUrl.hostname}/login${currentUrl.port}`}
            }
          
            if (statusCode !== 200) {
                return {status:false, msg:`${resp_.status}, ${resp_.statusText}`,value:null};
            }
            //read JSON data 
            let jsonData = await resp_.json();
            return jsonData;
    }


}