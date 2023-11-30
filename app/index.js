import each from 'lodash/each' // each function from lodash, for iterating over collections.

import Preloader from 'components/Preloader'

import About from 'pages/About'
import Collections from 'pages/Collections'
import Detail from 'pages/Detail'
import Home from 'pages/Home'

class App {
  constructor () {

    this.createPreloader()
    this.createContent()
    this.createPages()

    this.addLinkListeners()
  }

  // The createPreloader method creates an instance of the Preloader class.
  createPreloader() {
    this.preloader = new Preloader()
    // Setting up an event listener to execute the onPreloaded method once the preloading is completed.
    this.preloader.once('completed', this.onPreloaded.bind(this))
  }

  // The createContent method selects the main content element and retrieves its 'data-template' attribute.
  createContent () {
    this.content = document.querySelector('.content')
    this.template = this.content.getAttribute('data-template')
  }

  // The createPages method initializes instances of various page classes ('About', 'Collections', 'Detail', 'Home').
  createPages () {
    this.pages = {
      about: new About(),
      collections: new Collections(),
      detail: new Detail(),
      home: new Home(),
    }

    // Setting the current page ('this.page') based on the template obtained from the content element.
    this.page = this.pages[this.template]
    // Calling the create and show methods of the current page.
    this.page.create()
    this.page.show()
  }

  // The onPreloaded method is called when the preloading is completed.
  onPreloaded () {
    // It calls the destroy method of the preloader to clean up after preloading is done.
    this.preloader.destroy()
  }

  // The onChange method is called when a link is clicked.
  async onChange (url) {
    // Hiding the current page.
    await this.page.hide()

    // Asynchronous request to the specified URL using 'window.fetch'.
    const request = await window.fetch(url)

    // If the request is successful ('status === 200'), it processes the HTML response.
    if(request.status === 200){
      // Extracting the HTML content from the response using the text() method.
      const html = await request.text()
      // Creating a temporary div element in memory, to parse and manipulate the HTML content.
      const div = document.createElement('div')
      // Sets its 'innerHTML' property with the retrieved HTML content. This converts the HTML string into a DOM structure.
      div.innerHTML = html

      // Finds and selects an element with the class 'content' within the temporary 'div'.
      const divContent = div.querySelector('.content')

      // Retrieves the value of the 'data-template' attribute from the content section.
      this.template = divContent.getAttribute('data-template')
      // Updates the 'data-template' attribute of the main content element ('this.content') with the retrieved value.
      this.content.setAttribute('data-template', this.template)
      // Updating the inner HTML of the main content element('this.content') with the inner HTML of the content section extracted from the response.
      // Essentially replaces the existing content with the new content.
      this.content.innerHTML = divContent.innerHTML

      // Setting the current page ('this.page') based on the updated template.
      this.page = this.pages[this.template]
      // Calls the create method on the updated page, potentially initializing or updating its content.
      this.page.create()
      // Calls the show method on the updated page, making it visible.
      this.page.show()
      // Calls the addLinkListeners method to add listeners to links in the updated content. This enable navigation within the application without triggering
      // a full page reload.
      this.addLinkListeners()
    } else {
      console.log('Error')
    }
  }

  // The addLinkListeners method adds click event listeners to all anchor ('<a>') elements.
  addLinkListeners() {
    const links = document.querySelectorAll('a')

    // When a link is clicked, it prevents the default behavior (navigating to a new page) and calls the onChange method with the link's 'href'.
    each(links, link => {
      link.onclick = event => {
        const { href } = link
        event.preventDefault()

        this.onChange(href)
      }
    })
  }
}

new App()
