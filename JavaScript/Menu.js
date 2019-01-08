/* global __ */

export default class Menu {
  constructor(contentEl, loadingEl) {
    this.contentEl = contentEl
    this.loadingEl = loadingEl

    this.menuEl = this.html(__('section'))
    this.menu = null
    this.setup()
    return this.menuEl
  }
  html(el){
    return el.$_appendChild(this.loadingEl) // keep loading until menu received
  }
  async setup(){
    /*
    // menu.json
    // translation with fallback
    // add catch, add localStorage cache
    fetch('./index.html').then((res)=>{res.text().then((text) => {console.log(text)})})
    */
    try{
      let response = await fetch('./menu.json')
      this.menu = await response.json()
    }catch(e){
      console.warn(`menu could not be loaded: ${e.message}`)
    }
    if(typeof this.menu === 'object'){
      this.contentEl.$_appendChild(this.loadingEl) // keep loading until menu received
      const children = []
      for(const name in this.menu){
        if(this.menu.hasOwnProperty(name)){
          const path = this.menu[name]
          children.push(
            __('span')
              .$setInnerHTML(name)
          )
        }
      }
      console.log('changed2', children);
      this.menuEl
        .appendChild(__('ul'))
          .$appendChildren(children)
    }
  }
}
