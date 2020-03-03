/* global
   loadJSON
*/

var presentationList = []
var eventList = []
var scheduleReady = false

/* exported Presentation */
class Presentation {
  constructor() {
    this.Name
    this.Description
    this.Location
    this.StartTime
    this.EndTime
    this.Speakers = []
    this.Topic
  }
}

/* exported Event */
class Event {
  constructor() {
    this.Name
    this.Description
    this.Location
    this.StartTime
    this.EndTime
  }
}

/* exported initSchedule */
function initSchedule() {
  loadJSON('/api/schedule', populateSchedule)
}

function populateSchedule(blob) {
  scheduleReady = false
  presentationList = []
  for (let i = 0; i < blob.Presentations.length; i++) {
    let item = blob.Presentations[i]
    let p = new Presentation()
    p.Name = item.Name
    p.Description = item.Description
    p.Location = item.Location
    p.StartTime = new Date(item.StartTime)
    p.EndTime = new Date(item.EndTime)
    p.Speakers = item.Speakers
    p.Topic = item.Topic
    presentationList.push(p)
  }
  scheduleReady = true
}

/* exported SchedulePanel */
class SchedulePanel {
  constructor() {
    this.presentations = []
    this.events = []
    this.panelReady = false
  }

  tick() {
    if (scheduleReady && !this.panelReady) {
      this.presentations = presentationList
      this.events = eventList
      this.panelReady = true
    }
  }
}
