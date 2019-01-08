/* global __ */

export default class Loading {
  constructor (head) {
    this.setAnimation(head)
    return this.html(__('div'))
  }
  setAnimation(head){
    __(head.appendChild(document.createElement('style')))
      .$_setAttribute('type', 'text/css')
      .$setInnerHTML(`
        @keyframes blink {
          0% {
            opacity: .2;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: .2;
          }
        }
      `)
      
  }
  html(el){
    return el
      .$setInnerHTML('<span>.</span><span>.</span><span>.</span>')
      .$css([
        ` span{
          animation-name: blink;
          animation-duration: 1.4s;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
        }`,
        ` span:nth-child(2){
          animation-delay: .2s;
        }`,
        ` span:nth-child(3){
          animation-delay: .4s;
        }`
      ], 'loading')
  }
}
