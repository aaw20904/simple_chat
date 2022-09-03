 window.onload=()=>{
        let form = document.querySelector('form.was-validated');
        let btn = form.querySelector('.btn');
 ///on REGISTER button handler
     btn.addEventListener('click',async (event)=>{
       let regData= await getFormData();
       //when data are not valid
       if(!regData.status) {
        setStatusString(regData.msg,false);
        return;
       }
       let sent = await sendDataToServer(regData.results);
       if (sent.status) {
        setStatusString(sent.msg, true);
           window.setTimeout(()=>{
            // current base URL
            const currentUrl = new URL(document.location.href)
            window.location = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
          },2000);
          
       } else {
        setStatusString(sent.msg,false);
        //is there a captcha? (it was a wrong captcha code)
        if (sent.value){
          redefineCaptcha(sent.value);
        } 
       }
       
     })

     
        
    }

    async function getFormData(formSelector='myForm') {
        let form = document.querySelector('.myForm');
        //is a form valid?
        let validated = form.checkValidity();
        if (!validated) {
            return {status:false, msg:'Form hasn`t filled correctly'}
        }
        let avatar;
        try {
            avatar = await readFile();
        } catch(e) {
            return {status:false, error:e}
        }
        //if there are all Ok
        return {
            status:true,
            results: {
                usrName: form.querySelector('#usrName').value,
                usrPassword: form.querySelector('#password').value,
                usrAvatar: avatar,
                captcha: form.querySelector('#captchaCode').value,
            }
        }

    }

function redefineCaptcha(img){
  let node = document.querySelector('svg');
  node.innerHTML = img;

}

function readFile () {
    return new Promise((resolve, reject) => {
        const PICTURE_HEIGHT = 64;
            // (A) GET SELECTED FILE
            let imageFile = document.getElementById("avatar").files[0];
                // (B) READ SELECTED FILE
            let reader = new FileReader();
            //start read
            reader.readAsDataURL(imageFile);
            //error event handler
            reader.addEventListener('error', (x)=>reject(x));
            //load event handler
            reader.addEventListener("load", (e) => {
                let currentImageData = e.target.result;
                  //create an image
                let img= document.createElement('img');
                  //assign reading result to the one
                img.src =  e.target.result;
                    //when an image has  loaded
                img.onload=(event)=>{
                    // Dynamically create a canvas element
                       var canvas = document.createElement("canvas");
                    //actual resizing
                        var ctx = canvas.getContext("2d");
                    console.log(`Image wh: ${img.width},${img.height}`);

                      //calculate aspect ratio
                    let aspectRatio = img.width / img.height;
                      //calculate a new height
                    let newWidth = (PICTURE_HEIGHT * aspectRatio) | 0;
                      //set canvas sizes
                    ctx.canvas.width=newWidth;
                    ctx.canvas.height=PICTURE_HEIGHT;
                      // Actual resizing
                     ctx.drawImage(img, 0, 0, newWidth, PICTURE_HEIGHT);
                      //  convert to 'DataUrl' and assign it to a variable
                    var dataurl = canvas.toDataURL(imageFile.type);
                      //OPTIONAL: show a result in DOM img element
                    document.getElementById("demoShow").src = dataurl;
                    //return a scaled image
                    resolve( dataurl);
                }

            });
        
    });

}

function setStatusString(string="",success=true) {
    let strNode = document.querySelector('#statusString');
    if (success) {
        strNode.classList.remove('text-danger');
        strNode.classList.add('text-success');
    } else {
        strNode.classList.add('text-danger');
        strNode.classList.remove('text-success');
    }
    strNode.innerText = string;
   
}

async function sendDataToServer ( regData) {
     //define the adress - where you want to send
    const currentUrl = new URL(document.location.href)
    let response;
    // current base URL
    // url = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`;
     url = `${currentUrl.origin}${currentUrl.pathname}/data${currentUrl.port}`;
    const options={
        headers:{"Content-type":"application/json;charset=utf-8"},
        body:JSON.stringify(regData),
        method:'post'
    }
    try{
        response = await fetch(`${url}`,options);
    } catch(e){
        
        return {status:false, msg:e, value:null}
    }
    //save stsatus code 
    let statusCode = response.status;

    //check status
    if (response.status == 201) {
        let jsonData = await response.json();  
        return {status: true, msg: jsonData.msg, value:null}
    } else if (response.status == 303) {

      response = await response.json();
      //setStatusString(response.msg, false);
      //redefineCaptcha(response.image);
      return {status: false, msg:response.msg, value:response.image};

    } else if (response.status == 404) {
      return {status: false, msg:'Network error!', value:null}
    }else if (response.status == 500) {
      return {status: false, msg:'Server error!', value:null}
    }
       

}