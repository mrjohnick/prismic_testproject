import GSAP from 'gsap' // GreenSock Animation Platform for animation.

import Component from 'classes/Component' // Component class initialized in Component.js.
import each from 'lodash/each' // each function from lodash, for iterating over collections.

import { split } from 'utils/text' // A split function from the utility module caled text.js.

export default class Preloader extends Component {
  // The constructor sets up the preloader component.
  constructor () {
    // Calls the parent class 'Component' with a specific configuration, including the main element, title, number, and images.
    super({
      element: '.preloader',
      elements: {
        title: '.preloader__text',
        number: '.preloader__number',
        images: document.querySelectorAll('img')
      }
    })
    // It uses the 'split' function to break the title into spans wherever there's a line break ('<br>').
    this.elements.titleSpans = split({
      element: this.elements.title,
      expression: '<br>'
    })
    // Initializing a 'length' property to keep track of loaded images.
    this.length = 0

    console.log(this.element, this.elements)
    // Calls 'createLoader' method to handle image loading.
    this.createLoader()
  }

  // This createLoader method iterates over each image in the 'elements.images' property.
  createLoader () {
    // For each image, it sets up an 'onload' event handler that calls the 'onAssetLoaded' method when the image is loaded.
    each(this.elements.images, element => {
      element.onload = _ => this.onAssetLoaded(element)
      // It also sets the image source ('srs') to the value of the 'data-src' attribute.
      element.src = element.getAttribute('data-src')
    })
  }
  // The onAssetLoaded method is called when each image is loaded.
  onAssetLoaded(image) {
    // It increments the 'length' property to track the number of loaded images.
    this.length += 1
    // Calculating the percentage of images loaded and updates the preloader's number display accordingly.
    const percent = this.length / this.elements.images.length
    this.elements.number.innerHTML = `${Math.round(percent * 100)}%`

    // If all images are loaded ('percent === 1'), it calls the 'onLoaded' method.
    if (percent === 1) {
      this.onLoaded()
    }
  }
  // The onLoaded method is called when all images are loaded.
  onLoaded() {
    // It returns a promise that resolves after completing the animations.
    return new Promise(resolve => {
      // It uses GSAP to create an animation timeline ('this.animateOut') that fades out and moves the title spans upward.
      this.animateOut = GSAP.timeline({
        delay: 2
      })

      this.animateOut.to(this.elements.titleSpans, {
        autoAlpha: 0,
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.1,
        y: '100%',
      })
      // this.animateOut.to(this.element, {
      //   autoAlpha: 0
      // })

      // this.animateOut.call(_ => {
      //   this.emit('completed')
      // })
    })
  }
  // The destroy method removes the preloader element from its parent node.
  destroy() {
    this.element.parentNode.removeChild(this.element)
  }
}
