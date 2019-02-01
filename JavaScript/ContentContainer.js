import { ProxifyHook } from '../proxifyjs/JavaScript/Classes/Helper/ProxifyHook.js'
import { InitBasic } from '../proxifyjs/JavaScript/Classes/Controller/InitBasic.js'

const __ = new ProxifyHook(InitBasic).get()

customElements.define('content-container', class ContentContainer extends HTMLElement {
  static get observedAttributes() { return ['content'] }
  constructor() {
    super()
    
    const shadow = this.getAttribute('shadow') || 'open' // possible: "false", "open", "closed"
    if (shadow !== 'false') __(this.attachShadow({ mode: shadow }))
  }
  attributeChangedCallback(name, oldValue, newValue) {
    __(this.shadowRoot)
      .$setInnerHTML('')
      .$appendChildren(Array.from(this.childNodes))
  }
})