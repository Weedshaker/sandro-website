import { ProxifyHook } from '../proxifyjs/JavaScript/Classes/Helper/ProxifyHook.js'
import { InitBasic } from '../proxifyjs/JavaScript/Classes/Controller/InitBasic.js'

const __ = new ProxifyHook(InitBasic).get()

customElements.define('shadow-container', class ShadowContainer extends HTMLElement {
  static get observedAttributes() { return ['content'] }
  constructor() {
    super()
    
    const shadow = this.getAttribute('shadow') || 'open' // possible: "false", "open", "closed"
    if (shadow !== 'false') this.root = __(this.attachShadow({ mode: shadow }))
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.root) this.root
      .$setInnerHTML('')
      .$appendChildren(Array.from(this.childNodes))
  }
})