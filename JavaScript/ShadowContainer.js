import { ProxifyHook } from '../proxifyjs/JavaScript/Classes/Helper/ProxifyHook.js'
import { Proxify } from '../proxifyjs/JavaScript/Classes/Handler/Proxify.js'
import { Chain } from '../proxifyjs/JavaScript/Classes/Traps/Misc/Chain.js'
import { WebWorkers } from '../proxifyjs/JavaScript/Classes/Traps/Misc/WebWorkers.js'
import { Html } from '../proxifyjs/JavaScript/Classes/Traps/Dom/Html.js'
import { Events } from '../proxifyjs/JavaScript/Classes/Traps/Dom/Events.js'

const __ = new ProxifyHook(Events(Html(WebWorkers(Chain(Proxify()))))).get()

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
      const [html, href] = newValue.split('|###|')
      // load it into an iframe (shadow dom does not sandbox js)
      if((!html || html.includes('<script')) && href){
        container
          .$setInnerHTML('')
          .appendChild(__('iframe'))
            .$setSrc(href)
            .$_setAttribute('seamless', true)
            .$_setAttribute('scrolling', 'no')
            .$getStyle((receiver, prop, style) => {
              style
                .$setBorder(0)
                .$setHeight('100%')
                .$setOverflow('hidden')
                .$setWidth('100%')
            })
            .$onload((event, memory, target, prop, receiver)  => {
              const iframeDoc = receiver.contentDocument ? receiver.contentDocument : receiver.contentWindow.document
              const getHeight = () => Math.max(iframeDoc.body.scrollHeight, iframeDoc.body.offsetHeight, iframeDoc.documentElement.clientHeight, iframeDoc.documentElement.scrollHeight, iframeDoc.documentElement.offsetHeight)
              receiver.$getStyle((receiver, prop, style) => {
                style.$setMinHeight(`${getHeight()}px`)
              })
            })
      // load it straight into the shadow dom
      }else if(html){
        if(this.baseEl){
          const newBaseElHref = href ? href.replace(/[^\/]*?$/, '') : await __(this).$wwGetBase(null, html)
          if (newBaseElHref) this.baseEl.setAttribute('href', newBaseElHref)
        }
        container.$setInnerHTML(html)
        if (this.baseEl) this.baseEl.setAttribute('href', this.baseEl.getAttribute('orig_href')) // reset the base url to the original parameter
      }
      this.setAttribute(name, '') // clear the attribute after applying it to innerHTML
      if(this.titleEl){
        const newTitleEl = container.getElementsByTagName('title')[0] || await __(this).$wwGetTitle(null, html)
        if (newTitleEl) this.titleEl.$setInnerText(newTitleEl.innerText || newTitleEl)
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
  getTitle(text) {
    try {
      return /.*<title>(.*?)<\/title>/mgi.exec(text)[1]
    } catch (e) {
      return null
    }
  }
})