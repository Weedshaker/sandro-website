/* global __ */

export default class Menu {
  constructor(contentEl, titleEl, loadingEl) {
    this.contentEl = contentEl
    this.titleEl = titleEl
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
                children.push(
                  __('li')
                    .$setInnerHTML(name)
                    .$onclick(
                      [
                        async (event, memory, target, prop, receiver) => {
                          if(activePage !== name){
                            activePage = name
                            this.setActiveClass(children, activePage)
                            this.loadingEl.show() // set loading
                            const setInnerHTML = () => {
                              if (memory.title && memory.title !== this.titleEl.innerHTML) this.titleEl.$setInnerHTML(memory.title)
                              if(memory.body && memory.body !== this.contentEl.innerHTML){
                                this.loadingEl.hide()
                                this.contentEl.$setInnerHTML(memory.body)
                              }
                            }
                            setInnerHTML() // already run it, to first load localStorage entries
                            if(!memory.raw){ // only fetch once per session
                              memory.raw = await this.load(path, 'text')
                              if (memory.raw && memory.raw.length) __(this).$wwRegex((newMemory) => {
                                if(newMemory){
                                  memory = Object.assign(memory, newMemory)
                                  setInnerHTML() // get new results
                                }else{
                                  // at regex error
                                  receiver.remove()
                                  children.splice(children.indexOf(receiver), 1)
                                  if (children[0]) children[0].click() // activate first
                                }
                              }, memory.raw, path)
                            }
                          }
                        },
                        memory
                      ])
                )
              }
            }
            ul.$appendChildren(children)
            if (children[0]) children[0].click() // activate first
          })
        .parent
        // next menu css here!
    }
  }
  setActiveClass(children = [], activePage = ''){
    children.forEach(child => child.$getClassList((receiver, prop, classList) => classList[child.innerHTML === activePage ? 'add' : 'remove']('active')))
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
        body: /.*<body>((.|[\n\r])*)<\/body>/mgi.exec(text)[1]
      }
    }catch(e){
      console.warn(`Page at "${path}" could not be processed: ${e.message}. Change html to have title and body tag!`)
      return null
    }
  }
}
