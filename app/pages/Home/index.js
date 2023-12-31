import Page from 'classes/Page';

export default class Home extends Page {
  constructor () {
    super({
      id: 'home',
      element: '.home',
      elements: {
        button: '.home__link',
        navigation: document.querySelector('.navigation')
      }
    })

  }
  create () {
    super.create()

    this.elements.button.addEventListener('click', _ => console.log('Oh, you clicked me!'))
  }
}
