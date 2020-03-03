/* global image */

/* exported Img */
class Img {
  constructor(posVec, image) {
    this.pos = posVec
    this.image = image
  }

  render() {
    image(this.image, this.pos.x, this.pos.y)
  }

  setPosVec(v) {
    this.pos = v
  }
}
