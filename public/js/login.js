/***! THIS file NOT used in the project! You can`t include it when you are deploying a system */

window.onload = async function(){
    let buttonSend = document.getElementById('sendLoginData');
    buttonSend.onclick = async (evt)=>{
        let form = document.querySelector('form');
        let validityStatus = form.checkValidity();
        if (validityStatus){
            //get form data
            let usrName = document.getElementById('usrName').value;
            let usrPassword = document.getElementById('usrPassword').value; 
            //get page URL
            const currentURL = new URL(window.location.href);
            //read parameters
            let returnURL = currentURL.searchParams.get('addr');
            ///send a request to server
            let loginResult = await sendDataToServerAndReturnResult({
                                                                    usrName:usrName,
                                                                    usrPassword:usrPassword,
                                                                    backURL:returnURL});
            if (loginResult.status) {
              //when success
              
                //has the request been sent from another page?
                if (!returnURL) {
                  //when not - assign default redirect adress
                  returnURL = `${currentURL.protocol}//${currentURL.hostname}`
                }
                  
                    showNotifyToast(true,'OK!! Plese wait! You will be redirected');
                    //set delay and redirect
                    window.setTimeout(()=>{
                      window.location.href = returnURL;
                    },2000);
                    return;
                 
            } else {
              //when fail
              showNotifyToast(false,loginResult.msg);
            }
            

        }
    }
}


async function sendDataToServerAndReturnResult (arg={usrName:'*',usrPassword:'123', backURL:null}) {
     const currentUrl = new URL(document.location.href)
    // current base URL
    let baseUrl = `${currentUrl.protocol}//${currentUrl.hostname}${currentUrl.pathname}`
    if (currentUrl.port) {
      //when port has been defined
       baseUrl = `${baseUrl}:${currentUrl.port}`
    }
    baseUrl = `${baseUrl}/data`;

    const options={
      headers:{"Content-type":"application/json;charset=utf-8"},
      body:JSON.stringify(arg),
      method:'post'
    }

    //send the request
    let response;
    try{
    response = await fetch(`${baseUrl}`,options);
        let result;
        if(response.ok) {
          //if there OK - read JSON data
          result= await response.json();
          return result;
        } else {
          return {status:false,msg:response.statusText};
        }
    }catch(e) {
      return {status:false, msg:e};
    }
}

   function showNotifyToast(status=true,msg='Helloword',time=new Date().toLocaleTimeString()){
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

