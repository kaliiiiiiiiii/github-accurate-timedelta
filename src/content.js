function formatTimeDelta(pastDate) {
  const now = new Date();
  let delta = Math.floor((now - pastDate) / 1000); // in seconds

  const SECOND = 1;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const MONTH = 30 * DAY; // Approximation
  const YEAR = 365 * DAY; // Approximation

  const parts = [];

  const units = [
    { label: 'year', seconds: YEAR },
    { label: 'month', seconds: MONTH },
    { label: 'day', seconds: DAY },
    { label: 'hour', seconds: HOUR },
    { label: 'minute', seconds: MINUTE },
    { label: 'second', seconds: SECOND },
  ];

  for (const unit of units) {
    const count = Math.floor(delta / unit.seconds);
    if (count) {
      delta -= count * unit.seconds;
      parts.push(`${count} ${unit.label}${count !== 1 ? 's' : ''}`);
    }
    if (parts.length === 3) break;
  }

  // If nothing added, add "0 seconds"
  if (parts.length === 0) {
    parts.push('0 seconds');
  }

  return `${parts.join(', ')} ago`;
}

function updateRunTimeDisplay() {
  const timeElements = document.querySelectorAll("relative-time:not(.full-time-updated)");

  timeElements.forEach((el) => {
    const fullTime = el.getAttribute("datetime");
    if (!fullTime) return;
    const date = new Date(fullTime)
    const niceDate = date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
    const timeAgo = formatTimeDelta(date).trim();

    const replacement = document.createElement("span");
    replacement.textContent = timeAgo;
    replacement.title = niceDate;

    replacement.style.display = 'inline-block';
    replacement.style.whiteSpace = 'nowrap';
    replacement.style.width = '100%';
    replacement.style.maxWidth = '100%';
    replacement.style.overflow = 'hidden';
    replacement.style.textOverflow = 'ellipsis';

    replacement.className = el.className;

    const parent = el.parentElement;
    if (parent) {
      parent.style.display = "inline";
      parent.style.whiteSpace = "nowrap";
    }

    el.replaceWith(replacement);
  });
}


function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.matches("relative-time") ||
              node.querySelector?.("relative-time")
            ) {
              shouldUpdate = true;
              break;
            }
          }
        }
      }
    }

    if (shouldUpdate) {
      updateRunTimeDisplay();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (window.location.href.match(/^https:\/\/github\.com\/.*$/)) {
  observeDOMChanges();
}
