/* global __ */

export default class Menu {
  constructor(contentEl, titleEl, baseEl, loadingEl) {
    this.contentEl = contentEl
    this.titleEl = titleEl
    this.baseEl = baseEl
    this.loadingEl = loadingEl

    this.language = localStorage.getItem('language') || ''
    this.menu = null // will hold the object of menu.json
    this.menuEl = this.html(__('section'))
    this.setup(this.menuEl)
    return this.menuEl
  }
  html(el){
    return el
      .$setId('menu')
  }
  async setup(menuEl){
    this.loadingEl.show() // keep loading until menu received
    const response = await this.load('./Pages/menu.json')
    if(typeof response === 'object'){
      this.loadingEl.hide()
      this.menu = response
      menuEl
        .appendChild(__('ul'))
          .$func(ul => {
            const children = []
            let activePage = ''
            for(const name in this.menu){
              if(this.menu.hasOwnProperty(name)){
                const path = this.menu[name]
                const memory = __({
                  title: null,
                  body: null,
                  raw: null
                })
                memory.$lStoreAdd('title', `Menu${name}${path}`)
                memory.$lStoreAdd('body', `Menu${name}${path}`)
                let onclick = null
                children.push(
                  __('li')
                    .appendChild(__('a'))
                      .$setInnerHTML(name)
                      .$setHref(path)
                      .$onclick(onclick = [
                        async (event, memory, target, prop, receiver) => {
                          event.preventDefault()
                          if(activePage !== name){
                            this.loadingEl.show() // set loading
                            const setInnerHTML = (activateJS = false) => {
                              if (memory.title && memory.title !== this.titleEl.innerHTML) this.titleEl.$setInnerHTML(memory.title)
                              if(memory.body && memory.body !== this.contentEl.innerHTML){
                                activePage = name
                                this.setActiveClass(children, activePage)
                                if(/.*<script.*/mgi.test(memory.body)){
                                  //iframe
                                  this.contentEl
                                    .$setInnerHTML('')
                                      .appendChild(__('iframe')
                                      .$setSrc(path))
                                      .$setWidth(screen.width)
                                      .$setHeight(screen.height)
                                      // TODO: Iframe & transitions
                                }else{
                                  this.baseEl.$setHref(path.replace(/(.*\/).*?\.[a-zA-Z]{4}$/, '$1'))
                                  this.contentEl.$setInnerHTML(memory.body)
                                  this.baseEl.$setHref('./')
                                }
                                //if (activateJS) this.activateJS(this.contentEl)
                                this.loadingEl.hide()
                              }
                            }
                            setInnerHTML() // already run it, to first load localStorage entries
                            if(!memory.raw){ // only fetch once per session
                              memory.raw = await this.load(path, 'text')
                              if (memory.raw && memory.raw.length) __(this).$wwRegex((newMemory) => {
                                if(newMemory){
                                  memory = Object.assign(memory, newMemory)
                                  setInnerHTML(true) // get new results
                                }else{
                                  // at regex error
                                  if(onclick){
                                    receiver.$onclick(onclick, 'remove')
                                    receiver.click()
                                  }else if(children.length > 1) {
                                    receiver.parentElement.remove()
                                    children.splice(children.indexOf(receiver), 1)
                                    children[0].getElementsByTagName('a')[0].click() // activate first
                                  }
                                }
                              }, memory.raw, path)
                            }
                          }
                        },
                        memory
                      ])
                    .parentElement
                )
              }
            }
            ul.$appendChildren(children)
            if (children[0]) children[0].getElementsByTagName('a')[0].click() // activate first
          })
        .parentElement
        // next menu css here!
    }
  }
  setActiveClass(children = [], activePage = ''){
    children.forEach(child => child.$getClassList((receiver, prop, classList) => classList[child.innerText === activePage ? 'add' : 'remove']('active')))
  }
  async load(path, parse = 'json'){
    try {
      const response = await fetch(path.replace(/\.([a-zA-Z]{4})/, `${this.language ? '_' : ''}${this.language}.$1`))
      return await response[parse]()
    } catch (e) {
      if(this.language){
        this.language = '' // fallback to default (no) language
        return await this.load(path, parse)
      }
      console.warn(`${path} could not be loaded: ${e.message}`)
      return null
    }
  }
  regex(text, path = 'not specified'){
    try{
      return {
        title: /.*<title>(.*?)<\/title>/mgi.exec(text)[1],
        body: /.*<body.*?>((.|[\n\r])*)<\/body>/mgi.exec(text)[1]
      }
    }catch(e){
      console.warn(`Page at "${path}" could not be processed: ${e.message}. Change html to have title and body tag!`)
      return null
    }
  }
  activateJS(el){
    Array.from(el.getElementsByTagName('script')).forEach(script => {
      if(script.innerHTML){
        eval(script.innerHTML)
      }else if(script.src){
        const newScript = document.createElement('script')
        newScript.src = script.src
        script.remove()
        el.appendChild(newScript)
        console.log(this.baseEl.href)
      }
    })
  }
}
