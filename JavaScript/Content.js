/* global __ */

export default class Content {
  constructor () {
    return this.html(__('section'))
  }
  html(el){
    return el
      .$setId('content')
  }
}
