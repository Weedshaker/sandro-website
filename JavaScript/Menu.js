/* global __ */

export default class Menu {
  constructor(contentEl, titleEl, baseEl, loadingEl) {
    this.contentEl = contentEl
    this.titleEl = titleEl
    this.baseEl = baseEl
    this.loadingEl = loadingEl

    this.name = 'menu'
    this.activePage = ''
    this.language = localStorage.getItem('language') || ''
    this.menu = null // will hold the object of menu.json
    this.menuEl = this.html(__('section'))
    this.setup(this.menuEl)
    return this.menuEl
  }
  html(el){
    return el
      .$setId(this.name)
      .$css(`{grid-area: ${this.name};}`)
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
                          if(this.activePage !== name){
                            this.loadingEl.show() // set loading
                            this.setInnerHTML(name, path, children, memory) // already run it, to first load localStorage entries
                            if(!memory.raw){ // only fetch once per session
                              memory.raw = await this.load(path, 'text')
                              if (memory.raw && memory.raw.length) __(this).$wwRegex((newMemory) => {
                                if(newMemory){
                                  memory = Object.assign(memory, newMemory)
                                  this.setInnerHTML(name, path, children, memory) // get new results
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
  setActiveClass(children = []){
    children.forEach(child => child.$getClassList((receiver, prop, classList) => classList[child.innerText === this.activePage ? 'add' : 'remove']('active')))
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
  setInnerHTML(name, path, children, memory){
    if (memory.title && memory.title !== this.titleEl.innerHTML) this.titleEl.$setInnerHTML(memory.title)
    if(memory.body && memory.body !== this.contentEl.innerHTML){
      this.activePage = name
      this.setActiveClass(children)
      if(/.*<script.*/mgi.test(memory.body)){
        //iframe
        const css = `border: 0;
                     overflow: hidden;
                     width: 100%;`
        this.contentEl
          .$setInnerHTML('')
          .appendChild(__('iframe'))
            .$setSrc(path)
            .$_setAttribute('seamless', true)
            .$_setAttribute('scrolling', 'no')
            .$onload((event, memory, target, prop, receiver)  => {
                const iframeDoc = receiver.contentDocument ? receiver.contentDocument : receiver.contentWindow.document
                const getHeight = () => Math.max(iframeDoc.body.scrollHeight, iframeDoc.body.offsetHeight, iframeDoc.documentElement.clientHeight, iframeDoc.documentElement.scrollHeight, iframeDoc.documentElement.offsetHeight)
                let height = 0
                let counter = 0
                const checks = 15 // setting iframes css does also change the height, so iterate couple times until final height
                const interval = setInterval(() => {
                  if(height !== (height = getHeight())){
                    if(counter === checks){
                      // TODO: transtion (here fade out)
                      console.log('iframe height', height);
                      clearInterval(interval)
                    }
                    receiver.$css(`{
                      ${css}
                      height: ${height + 4}px;
                    }`)
                    counter++
                  }
                }, 1)
            })
            .$css(`{
              ${css}
              height: 100%;
            }`)
      }else{
        this.baseEl.$setHref(path.replace(/(.*\/).*?\.[a-zA-Z]{4}$/, '$1'))
        this.contentEl.$setInnerHTML(memory.body)
        this.baseEl.$setHref('./')
      }
      this.loadingEl.hide()
    }
  }
}
