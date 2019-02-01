import { ProxifyHook } from '../proxifyjs/JavaScript/Classes/Helper/ProxifyHook.js'
import { InitBasic } from '../proxifyjs/JavaScript/Classes/Controller/InitBasic.js'

const __ = new ProxifyHook(InitBasic).get()

customElements.define('menu-router', class MenuRouter extends HTMLElement {
  constructor() {
    super()

    this.addOnClick(
      __(this.childNodes),
      __(document.getElementsByTagName('base')[0]),
      __(document.getElementsByTagName('title')[0]),
      __(document.getElementById(this.getAttribute('contentId') || 'content'))
    )
    const shadow = this.getAttribute('shadow') || 'open' // possible: "false", "open", "closed"
    if (shadow !== 'false') __(this.attachShadow({ mode: shadow })).$appendChildren(Array.from(this.childNodes))
  }
  addOnClick(childNodes, baseEl, titleEl, contentEl){
    Array.from(childNodes).forEach(childNode => {
      let href = ''
      if(typeof childNode.getAttribute === 'function' && (href = childNode.getAttribute('href')) && href.length !== 0){
        childNode.$onclick([
          async (event, memory, target, prop, receiver) => {
            event.preventDefault()
            if (!memory.raw) memory.raw = await this.load(href)
            if(memory.raw){
              if (!memory.base) memory.base = await __(this).$wwGetBase(null, memory.raw, href)
              if (memory.base && baseEl) baseEl.setAttribute('href', memory.base)
              if (!memory.title) memory.title = await __(this).$wwGetTitle(null, memory.raw, href)
              if(memory.title){
                if (titleEl) titleEl.$setInnerText(memory.title)
                if(contentEl){
                  contentEl.$setInnerHTML(memory.raw)
                  contentEl.setAttribute('content', memory.title) // trigger life cycle event
                }
              }
            }
          },
          {
            raw: null,
            base: null,
            title: null
          }
        ])
      }
      this.addOnClick(childNode.childNodes, baseEl, titleEl, contentEl)
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
  getBase(text, path = 'not specified') {
    try {
      return /.*<base.*?href="(.*?)".*?>/mgi.exec(text)[1]
    } catch (e) {
      console.warn(`Page at "${path}" could not be processed: ${e.message}. Change html to have base tag!`)
      return null
    }
  }
  getTitle(text, path = 'not specified'){
    try {
      return /.*<title>(.*?)<\/title>/mgi.exec(text)[1]
    } catch (e) {
      console.warn(`Page at "${path}" could not be processed: ${e.message}. Change html to have title tag!`)
      return null
    }
  }
})