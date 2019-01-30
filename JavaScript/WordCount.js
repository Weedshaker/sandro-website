export default class WordCount extends HTMLParagraphElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Element functionality written in here
    //const shadowRoot = this.attachShadow({ mode: 'open' })

    console.log('hi wordcount', this);
  }
}