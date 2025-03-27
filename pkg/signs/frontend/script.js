// URL of the schedule endpoint (adjust if needed)
const SCHEDULE_API_URL = '/schedule/';

async function fetchSchedule() {
  try {
    const response = await fetch(SCHEDULE_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch schedule:", err);
    return null;
  }
}

function createPresentationElement(pres) {
  const container = document.createElement('div');
  container.className = 'presentation';

  const title = document.createElement('h2');
  title.textContent = pres.Name;
  container.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'meta';

  // Format start and end times assuming they are in ISO format
  const startTime = new Date(pres.StartTime);
  const endTime = new Date(pres.EndTime);
  meta.textContent = `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()} | ${pres.Location}`;
  container.appendChild(meta);

  if (pres.Speakers && pres.Speakers.length > 0) {
    const speakers = document.createElement('div');
    speakers.className = 'meta';
    speakers.textContent = `Speakers: ${pres.Speakers.join(', ')}`;
    container.appendChild(speakers);
  }

  if (pres.Topic) {
    const topic = document.createElement('div');
    topic.className = 'meta';
    topic.textContent = `Topic: ${pres.Topic}`;
    container.appendChild(topic);
  }

  if (pres.Description) {
    const description = document.createElement('div');
    description.className = 'description';
    description.textContent = pres.Description;
    container.appendChild(description);
  }

  return container;
}

function displaySchedule(schedule) {
  const container = document.getElementById('schedule-container');
  container.innerHTML = ''; // Clear any existing content

  if (!schedule || !schedule.Presentations) {
    container.textContent = 'No presentations found.';
    return;
  }

  // Sort presentations by StartTime (this sorts by date and time)
  const sortedPresentations = schedule.Presentations.sort((a, b) => {
    return new Date(a.StartTime) - new Date(b.StartTime);
  });

  // Group presentations by day
  const groups = {};
  sortedPresentations.forEach(pres => {
    const day = new Date(pres.StartTime).toDateString();
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(pres);
  });

  // Render each group with a day header
  Object.keys(groups).forEach(day => {
    const dayHeader = document.createElement('h2');
    dayHeader.textContent = day;
    container.appendChild(dayHeader);

    groups[day].forEach(pres => {
      container.appendChild(createPresentationElement(pres));
    });
  });
}

// Update the clock to show the current hour and minute only
function updateClock() {
  const clockEl = document.getElementById('clock');
  const now = new Date();
  // Options to show only hour and minute
  const options = { hour: '2-digit', minute: '2-digit' };
  clockEl.textContent = now.toLocaleTimeString([], options);
}

// Auto-scroll function that creates a seamless wrap-around effect
function autoScroll() {
  const container = document.getElementById('schedule-container');

  // Duplicate the content to allow for seamless scrolling if not already done.
  // We use a data attribute flag to ensure we only duplicate once.
  if (!container.dataset.duplicated) {
    container.dataset.duplicated = "true";
    container.innerHTML += container.innerHTML;
  }

  const scrollStep = 1;         // pixels to scroll each step
  const scrollInterval = 20;      // time in ms between steps

  setInterval(() => {
    container.scrollTop += scrollStep;
    // When scrollTop reaches half the scrollHeight, we've reached the end of the first copy.
    if (container.scrollTop >= container.scrollHeight / 2) {
      container.scrollTop = 0;
    }
  }, scrollInterval);
}

async function init() {
  const schedule = await fetchSchedule();
  displaySchedule(schedule);
  autoScroll();
  updateClock();
  // Update clock every minute (60,000 ms)
  setInterval(updateClock, 60000);
}

// Initialize the page once the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
