/* global Img
   createVector loadImage windowWidth imageMode CENTER
*/

/* exported LogoPanel */
class LogoPanel {
  constructor() {
    this.imgLogo = new Img(
      createVector(190, 100),
      loadImage('/img/logo-17x.png')
    )
    this.imgWifi = new Img(
      createVector(windowWidth - 200, 100),
      loadImage('/img/wifi.png')
    )
  }

  render() {
    imageMode(CENTER)
    this.imgLogo.render()
    this.imgWifi.render()
  }
}
