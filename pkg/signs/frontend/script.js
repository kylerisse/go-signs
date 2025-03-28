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

let baseTime;       // The starting time (overridden or current)
let initTimestamp;  // The timestamp (in ms) when the clock was initialized

// Initialize the clock with override values if provided
function initClock() {
  const urlParams = new URLSearchParams(window.location.search);
  if (
    urlParams.has('year') &&
    urlParams.has('month') &&
    urlParams.has('day') &&
    urlParams.has('hour') &&
    urlParams.has('minute')
  ) {
    const year = parseInt(urlParams.get('year'), 10);
    // JavaScript months are 0-indexed (0 = January)
    const month = parseInt(urlParams.get('month'), 10) - 1;
    const day = parseInt(urlParams.get('day'), 10);
    const hour = parseInt(urlParams.get('hour'), 10);
    const minute = parseInt(urlParams.get('minute'), 10);
    baseTime = new Date(year, month, day, hour, minute);
  } else {
    baseTime = new Date();
  }
  // Record the initialization time in milliseconds
  initTimestamp = Date.now();
}

// Update the clock display based on the initial time plus elapsed time
function updateClock() {
  const clockEl = document.getElementById('clock');
  // Calculate elapsed time in ms since the clock was initialized
  const elapsed = Date.now() - initTimestamp;
  // Compute the current time by adding elapsed time to the base time
  const currentTime = new Date(baseTime.getTime() + elapsed);

  // Format date without seconds and without extra words
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  const dateString = currentTime.toLocaleDateString([], dateOptions);
  const timeString = currentTime.toLocaleTimeString([], timeOptions);
  clockEl.textContent = `${dateString} ${timeString}`;
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
  initClock();
  updateClock();
  autoScroll();

  // Fetch and display the schedule on initialization.
  const schedule = await fetchSchedule();
  displaySchedule(schedule);

  // Update the clock every minute.
  setInterval(updateClock, 60000);

  // Refresh the schedule every 5 minutes (300,000 milliseconds).
  setInterval(async () => {
    const refreshedSchedule = await fetchSchedule();
    displaySchedule(refreshedSchedule);
  }, 300000);
}

// Initialize the page once the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
