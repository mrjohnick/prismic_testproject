import GSAP from 'gsap' // GreenSock Animation Platform for animation.
import each from 'lodash/each' // each function from lodash, for iterating over collections.

export default class Page {

  // This class has a constructor method that takes an object as an argument with properties 'element', 'elements', and 'id'.
  constructor ({
    element,
    elements,
    id
  }) {
    // Setting the 'selector' property to the 'element', the 'selectorChildren' property to the spread of 'elements', and the 'id' property to the 'id' parameter.
    this.selector = element
    this.selectorChildren = {
      ...elements
    }
    this.id = id
  }
  // The create method initializes the class instance.
  create () {
    // Setting the 'element' property to the result of 'document.querySelector(this.selector)'.
    this.element = document.querySelector(this.selector)
    // Creates an empty 'elements' object.
    this.elements = {}

    // Iterating over each key-value pair in 'selectorChildren' using lodash's each function.
    each(this.selectorChildren, (entry, key) => {
      // For each entry in 'selectorChildre', we check if the value is an HTML element, a NodeList, or an array.
      if (entry instanceof window.HTMLElement || entry instanceof window.NodeList || Array.isArray(entry)) {
        // If so, it directly assigns the value to the corresponding key in the 'elements' object.
        this.elements[key] = entry
      } else {
        // If not, it assumes the value to be a selector and uses 'document.querySelectorAll' to query the DOM for elements using the provided selector
        // and assigns the result to the corresponding key in 'elements'.
        this.elements[key] = document.querySelectorAll(entry)

        // If there are no matching elements,...
        if(this.elements[key].length === 0){
          // ...it sets the value to 'null'.
          this.elements[key] = null
        } else if (this.elements[key].length === 1){
          // If there is only one matching element, it assigns that element directly.
          this.elements[key] = document.querySelector(entry)
        }
      }
    })
  }
  // This show method animates the 'element' using GSAP's 'from' method, making it fade in.
  show() {
    return new Promise(resolve => {
      GSAP.from(this.element, {
        autoAlpha: 0,
        onComplete: resolve
      })
    })

  }
  // This hide method animates the 'element' using GSAP's 'to' method, making it fade out.
  hide() {
    return new Promise(resolve => {
      GSAP.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve
      })
    })
  }
}
