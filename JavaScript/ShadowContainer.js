import { ProxifyHook } from '../proxifyjs/JavaScript/Classes/Helper/ProxifyHook.js'
import { InitBasic } from '../proxifyjs/JavaScript/Classes/Controller/InitBasic.js'

const __ = new ProxifyHook(InitBasic).get()

// Attributes:
// ---applies to root only---
// shadow:string = "false", "open", "closed" (default "open")
customElements.define('shadow-container', class ShadowContainer extends HTMLElement {
  static get observedAttributes() { return ['content'] }
  constructor() {
    super()
    
    const shadow = this.getAttribute('shadow') || 'open' // possible: "false", "open", "closed"
    if (shadow !== 'false') this.root = __(this.attachShadow({ mode: shadow }))
  }
  attributeChangedCallback(name, oldValue, newValue) {
    // titleEl = __(document.getElementsByTagName('title')[0]),
    // if (titleEl) titleEl.$setInnerText(memory.title)
    // baseEl = __(document.getElementsByTagName('base')[0])
    // if (baseEl) baseEl.setAttribute('orig_href', baseEl.getAttribute('href'))
    // reset the base url to the original parameter
    // if (baseEl) baseEl.setAttribute('href', baseEl.getAttribute('orig_href'))
    // if (memory.base && baseEl) baseEl.setAttribute('href', memory.base)
    if(name === 'content'){
      __(this).$setInnerHTML(newValue)
      if (this.root) this.root
        .$setInnerHTML('')
        .$appendChildren(Array.from(this.childNodes))
    }
  }
})