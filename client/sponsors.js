/* global Img
   loadJSON loadImage createVector int random
   windowWidth windowHeight imageMode CORNER
*/

var sponsorImages = []
var sponsorsReady = false

/* exported initSponsors */
function initSponsors() {
  loadJSON('/api/sponsors', addSponsorImages)
}

function addSponsorImages(list) {
  if (list.length !== sponsorImages.length) {
    sponsorsReady = false
    sponsorImages = []
    for (let i = 0; i < list.length; i++) {
      sponsorImages.push(loadImage('/img/sponsors/' + list[i]))
    }
    sponsorsReady = true
  }
}

/* exported SponsorPanel */
class SponsorPanel {
  constructor() {
    this.imgList = []
    this.leftPos = createVector(10, windowHeight - 310)
    this.rightPos = createVector(windowWidth - 310, windowHeight - 310)
    this.hidePos = createVector(-600, -600)
    this.leftIndex = int(random(0, this.imgList.length))
    this.rightIndex = int(random(0, this.imgList.length))
    this.maxTimer = 20
    this.timer = this.maxTimer
    this.panelReady = false
  }

  isReady() {
    return this.panelReady
  }

  setLeftPos(v) {
    this.leftPos = v
  }

  setRightPos(v) {
    this.rightPos = v
  }

  tick() {
    if (this.panelReady) {
      this.timer++
      if (this.timer >= this.maxTimer) {
        this.timer = 0
        this.imgList[this.leftIndex].setPosVec(this.hidePos)
        this.leftIndex = int(random(0, this.imgList.length))
        while (this.leftIndex === this.rightIndex) {
          this.leftIndex = int(random(0, this.imgList.length))
        }
        this.imgList[this.leftIndex].setPosVec(this.leftPos)
      }
      if (this.timer === this.maxTimer / 2) {
        this.imgList[this.rightIndex].setPosVec(this.hidePos)
        this.rightIndex = int(random(0, this.imgList.length))
        while (this.rightIndex === this.leftIndex) {
          this.rightIndex = int(random(0, this.imgList.length))
        }
        this.imgList[this.rightIndex].setPosVec(this.rightPos)
      }
    }
    if (sponsorsReady && !this.panelReady) {
      this.populateImgList()
    }
  }

  render() {
    if (sponsorsReady && this.panelReady) {
      imageMode(CORNER)
      this.imgList[this.leftIndex].render()
      this.imgList[this.rightIndex].render()
    }
  }

  populateImgList() {
    if (this.imgList.length !== sponsorImages.length) {
      this.panelReady = false
      this.imgList = []
      for (let i = 0; i < sponsorImages.length; i++) {
        this.imgList.push(new Img(this.hidePos, sponsorImages[i]))
      }
      this.panelReady = true
    }
  }
}
