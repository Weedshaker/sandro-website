import { ProxifyHook } from '../proxifyjs/JavaScript/Classes/Helper/ProxifyHook.js'
import { Proxify } from '../proxifyjs/JavaScript/Classes/Handler/Proxify.js'
import { Chain } from '../proxifyjs/JavaScript/Classes/Traps/Misc/Chain.js'
import { WebWorkers } from '../proxifyjs/JavaScript/Classes/Traps/Misc/WebWorkers.js'
import { Html } from '../proxifyjs/JavaScript/Classes/Traps/Dom/Html.js'

const __ = new ProxifyHook(Html(WebWorkers(Chain(Proxify())))).get()

// Attributes:
// ---applies to root only---
// shadow:string = "false", "open", "closed" (default "open")
customElements.define('shadow-container', class ShadowContainer extends HTMLElement {
  static get observedAttributes() { return ['content'] }
  constructor() {
    super()
    
    const shadow = this.getAttribute('shadow') || 'open'
    if (shadow !== 'false') this.root = __(this.attachShadow({ mode: shadow }))

    this.titleEl = __(document.getElementsByTagName('title')[0])
    this.baseEl = __(document.getElementsByTagName('base')[0])
    if (this.baseEl) this.baseEl.setAttribute('orig_href', this.baseEl.getAttribute('href'))
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    if(name === 'content' && newValue){
      const container = this.root || __(this)
      if(this.baseEl){
        const newBaseElHref = await __(this).$wwGetBase(null, newValue)
        if (newBaseElHref) this.baseEl.setAttribute('href', newBaseElHref)
      }
      container.$setInnerHTML(newValue)
      this.setAttribute(name, '')
      // TODO: make JavaScript from newValue work!
      if (this.baseEl) this.baseEl.setAttribute('href', this.baseEl.getAttribute('orig_href')) // reset the base url to the original parameter
      if(this.titleEl){
        const newTitleEl = container.getElementsByTagName('title')[0]
        let newTitle = '';
        if (newTitleEl && (newTitle = newTitleEl.innerText)) this.titleEl.$setInnerText(newTitle)
      }
    }
  }
  getBase(text){
    try {
      return /.*<base.*?href="(.*?)".*?>/mgi.exec(text)[1]
    } catch (e) {
      return null
    }
  }
})