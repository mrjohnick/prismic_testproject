import each from 'lodash/each' // each function from lodash, for iterating over collections.
import EventEmitter from 'events' // EventEmitter for handling events.

export default class Component extends EventEmitter {
  constructor ({
    element,
    elements,
  }) {
    super()  // Calls the constructor of the parent class (EventEmitter)

    this.selector = element
    this.selectorChildren = {
      ...elements
    }
    this.create() // Calls the create method to set up elements based on provided information.
    this.addEventListeners() // Calls a method to set up event listeners.
  }
  create () {
    // Setting up the element property with the main page element.
    this.element = document.querySelector(this.selector)
    // Initializing an empty 'elements' object.
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
  addEventListeners() {

  }

  removeEventListeners() {

  }
}
