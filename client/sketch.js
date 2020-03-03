/* global sp lp sch SponsorPanel LogoPanel SchedulePanel initSponsors 
   initSchedule
   createCanvas background resizeCanvas noCursor
   windowWidth windowHeight createVector frameRate
*/

/* exported setup */
function setup() {
  frameRate(1)
  noCursor()
  createCanvas(windowWidth, windowHeight)
  initSponsors()
  initSchedule()

  // .eslintrc: "no-global-assign": ["error", {"exceptions": ["sp", "lp", "scp"]}]
  sp = new SponsorPanel()
  lp = new LogoPanel()
  sch = new SchedulePanel()
}

/* exported draw */
function draw() {
  update()
  background(255)
  if (sp.isReady()) {
    sp.render()
  }
  lp.render()
}

/* exported windowResized */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  sp.setLeftPos(createVector(10, windowHeight - 310))
  sp.setRightPos(createVector(windowWidth - 310, windowHeight - 310))
}

/* exported update */
function update() {
  sp.tick()
  sch.tick()
}
