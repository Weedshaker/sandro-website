import { ProxifyHook } from '../proxifyjs/JavaScript/Classes/Helper/ProxifyHook.js'
import { Proxify } from '../proxifyjs/JavaScript/Classes/Handler/Proxify.js'
import { Html } from '../proxifyjs/JavaScript/Classes/Traps/Dom/Html.js'
import { Events } from '../proxifyjs/JavaScript/Classes/Traps/Dom/Events.js'

const __ = new ProxifyHook(Events(Html(Proxify()))).get()

// Attributes:
// ---applies to root only---
// shadow:string = "false", "open", "closed" (default "open")
// ---applies to href el only---
// href:string = fetchPath
// ---applies to both with prio href el---
// parse[string] = "text", "json", ... (default "text")
// fetchToId = id of the content container to push text to as "content" attribute
customElements.define('link-fetch', class LinkFetch extends HTMLElement {
  constructor() {
    super()

    const shadow = this.getAttribute('shadow') || 'open'
    if (shadow !== 'false') this.root = __(this.attachShadow({ mode: shadow })).$appendChildren(Array.from(this.childNodes))
  }
  connectedCallback(){
    if(!this.initialized){
      const container = this.root || __(this)
      this.addOnClick(__(container.childNodes))
      this.initialized = true
    }
  }
  addOnClick(childNodes){
    Array.from(childNodes).forEach(childNode => {
      let href = ''
      if(typeof childNode.getAttribute === 'function' && (href = childNode.getAttribute('href')) && href.length !== 0){
        childNode.$onclick([
          async (event, memory, target, prop, receiver) => {
            event.preventDefault()
            if (!memory.raw) memory.raw = await this.load(href, childNode.getAttribute('parse') || this.getAttribute('parse') || undefined)
            if(memory.raw){
              const individuelContentEl = document.getElementById(childNode.getAttribute('fetchToId') || this.getAttribute('fetchToId') || 'container')
              if (individuelContentEl) individuelContentEl.setAttribute('content', memory.raw) // trigger life cycle event
            }
          },
          {
            raw: null
          }
        ])
      }
      this.addOnClick(childNode.childNodes) // recursive
    })
  }
  async load(path, parse = 'text'){
    try {
      const response = await fetch(path)
      return await response[parse]()
    } catch (e) {
      console.warn(`${path} could not be loaded: ${e.message}`)
      return null
    }
  }
})