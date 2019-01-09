/* global __ */

export default class Content {
  constructor () {
    this.name = 'content'
    return this.html(__('section'))
  }
  html(el){
    return el
      .$setId(this.name)
      .$css(`{grid-area: ${this.name};}`)
  }
}
