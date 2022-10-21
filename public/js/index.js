class ScrollAnimation {
 #targetNode;
 #scaleEffect;
 #opacity;
 #position;
 #onScrollListener = () => {
   
    this.#targetNode.style.bottom =  `${(window.scrollY | 0) * 3}px`; 
    this.#targetNode.style.opacity = 1 - ((1/(window.innerHeight/3)) * (window.scrollY+1));
    console.log((1/window.innerHeight) * (window.scrollY+1));
 }
    constructor (nodeToAnim,scaleEffect=1.2) {
                 this.#scaleEffect = scaleEffect;
                 this.#targetNode = nodeToAnim;
                this.#targetNode.classList.add('scroll_animation');
                 this.#targetNode.style.left = '50vw';
                 window.addEventListener('scroll',this.#onScrollListener);
    }

}

window.onload = () =>{
    let animation = new ScrollAnimation(document.querySelector('.arrow'),null);
}