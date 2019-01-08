/* global __ */

export default class Menu {
  constructor(contentEl, titleEl, loadingEl) {
    this.contentEl = contentEl
    this.titleEl = titleEl
    this.loadingEl = loadingEl

    this.menu = null // will hold the object of menu.json
    this.menuEl = this.html(__('section'))
    this.setup()
    return this.menuEl
  }
  html(el){
    return el.$_appendChild(this.loadingEl) // keep loading until menu received
  }
  async setup(){
    const response = await this.load('./menu.json')
    if(typeof response === 'object'){
      this.menu = response
      this.contentEl.$_appendChild(this.loadingEl) // move loading to content and keep content loading until content received
      this.menuEl
        .$func(menuEl => {
          const children = []
          for(const name in this.menu){
            if(this.menu.hasOwnProperty(name)){
              const path = this.menu[name]
              children.push(
                __('li')
                  .$setInnerHTML(name)
                  .$onclick(
                    [
                      async (event, memory, target, prop, receiver) => {
                        this.contentEl.$_appendChild(this.loadingEl)
                        if(!memory.raw){
                          memory.raw = await this.load(path, 'text')
                          memory.title = /.*<title>(.*?)<\/title>/mgi.exec(memory.raw)[1]
                          memory.body = /.*<body>((.|[\n\r])*)<\/body>/mgi.exec(memory.raw)[1]
                        }
                        this.titleEl.$setInnerHTML(memory.title)
                        this.contentEl.$setInnerHTML(memory.body)
                        // next regex to $ww & maybe combine regex
                      },
                      {
                        title: null,
                        body: null,
                        raw: null
                      }
                    ])
              )
            }
          }
          menuEl
            .appendChild(__('ul'))
              .$appendChildren(children)
        }) 
    }
  }
  async load(path, parse = 'json'){
    try {
      const response = await fetch(path)
      return await response[parse]()
    } catch (e) {
      console.warn(`${path} could not be loaded: ${e.message}`)
      return null
    }
  }
}
