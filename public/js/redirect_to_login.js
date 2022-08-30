window.onload=()=>{
 //define the adress - where you want to send
 const currentUrl = new URL(document.location.href)
    // current base URL
    const baseUrl = `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`
    setTimeout(()=>{
        location.href = `${currentUrl.protocol}//${currentUrl.hostname}/login`;
    },4000)

}