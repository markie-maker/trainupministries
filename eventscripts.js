let prevYOffset = window.scrollY;
window.addEventListener('scroll', () => {
    const currentYOffset = window.scrollY;

    if (currentYOffset > prevYOffset) {
        document.querySelector('#nav').classList.add('scrolling-down');
    } else {
        document.querySelector('#nav').classList.remove('scrolling-down');
    }

    prevYOffset = currentYOffset;

    if (currentYOffset > (window.innerHeight * 0.5) + 4 + (parseFloat(getComputedStyle(document.documentElement).fontSize) * 4)) {
        document.querySelector('#nav').classList.add('main-nav');
    }
    else {
        document.querySelector('#nav').classList.remove('main-nav');
    }
});

function openModal(modalId) {
    document.querySelector('.eventModalBg').style.display = 'block';
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';

}

function closeModal(modalId) {
    document.querySelector('.eventModalBg').style.display = 'none';
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'scroll';
}

document.querySelector('.eventModalBg').addEventListener('click', () => {
    const modals = document.querySelectorAll('.eventModal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'scroll';
    document.querySelector('.eventModalBg').style.display = 'none';
});

// Calendar functionality
const calendar = document.getElementById('calendar');
const title = document.getElementById('calendar-title');

let currentDate = new Date();

function loadCalendar(month, year) {
    calendar.innerHTML = '';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = new Date(year, month, 1).getDay();

    title.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    for (let i = 0; i < startDayIndex; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'day';
        dayBox.id = `day-${year}-${month + 1}-${day}`;
        dayBox.innerHTML = `<strong>${day}</strong>`;
        calendar.appendChild(dayBox);
    }

    loadEvents(month + 1, year);
}

function resetCalendar() {
    currentDate = new Date();
    loadCalendar(currentDate.getMonth(), currentDate.getFullYear());
}


function changeMonth(step) {
    currentDate.setMonth(currentDate.getMonth() + step);
    loadCalendar(currentDate.getMonth(), currentDate.getFullYear());
}

function loadEvents(month, year) {
    fetch('events.json')
        .then(res => res.json())
        .then(events => {
            events.forEach(event => {
                const date = new Date(event.date);
                const eventYear = date.getFullYear();
                const eventMonth = date.getMonth() + 1;
                const eventDay = date.getDate();

                if (eventMonth === month && eventYear === year) {
                    const box = document.getElementById(`day-${eventYear}-${eventMonth}-${eventDay}`);
                    if (box) {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'calEvent';
                        eventDiv.textContent = event.title;
                        eventDiv.onclick = () => openModal(event.modalId);
                        box.appendChild(eventDiv);
                    }
                }
            });
        })
        .catch(err => {
            console.error('Could not load events:', err);
        });
}

// Load current month on start
loadCalendar(currentDate.getMonth(), currentDate.getFullYear());

// Global variable for events
let eventDivs;

//  Create event cards dynamically using JSON data

fetch('events.json')
    .then(response => response.json())
    .then(events => {
        const eventContainer = document.getElementById('eventContainer');
        events.forEach(e => {
            const event = document.createElement('div');
            event.className = 'event eventDivs';

            // Use date as string or show TBD if invalid
            const dateDisplay = !e.date || e.date.includes('TBD') ? 'TBD' : e.date;

            event.innerHTML = `
                <h4>${e.title}</h4>
                <img src="${e.image}" alt="" loading="lazy">
                <div class="dateTime">
                    <span class="date">${dateDisplay}</span>
                    <span class="time">${e.time}</span>
                </div>
                <span class="location">${e.location}</span>
                <p class="noMarginTop">${e.description}</p>
                <a onclick="openModal('${e.modalId}');" class="button primary fit">RSVP</a>
            `;
            eventContainer.appendChild(event);
        });
        eventDivs = document.querySelectorAll('.eventDivs');

        if (eventDivs.length <= 3) {
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {
            for (let i = 3; i < eventDivs.length; i++) {
                eventDivs[i].style.display = 'none';
            }
        }
    })
    .catch(error => {
        console.error('Error fetching or parsing JSON:', error);
    });


let eventsLoaded = false;
function loadOrShowEvents() {
    if (eventsLoaded == false) {
        loadMoreEvents();
    } else {
        showLessEvents();
    }
}

function loadMoreEvents() {
    eventDivs.forEach(div => {
        div.style.display = 'flex';
    });
    document.getElementById('loadMoreBtn').innerHTML = 'Show Less Events';
    eventsLoaded = true;
}

function showLessEvents() {
    for (let i = 3; i < eventDivs.length; i++) {
        eventDivs[i].style.display = 'none';
    }
    document.getElementById('loadMoreBtn').innerHTML = 'Load More Events';
    eventsLoaded = false;
}

// Add Modal for each event
fetch('events.json')
    .then(response => response.json())
    .then(events => {
        const modalContainer = document.querySelector('#modalContainer');
        events.forEach(e => {
            const modal = document.createElement('div');
            modal.className = 'fade eventModal event';
            modal.id = e.modalId;

            // Use date as string or show TBD if invalid
            const dateDisplay = !e.date || e.date.includes('TBD') ? 'TBD' : e.date;

            modal.innerHTML = `
                    <div style="display: flex; justify-content: space-between; padding: 1rem 0;">
                        <h3 style="display: inline; margin: 0;">${e.title}</h3>
                        <svg class="closeModal" onclick="closeModal('${e.modalId}');" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#000000">
                            <path d="m251.33-204.67-46.66-46.66L433.33-480 204.67-708.67l46.66-46.66L480-526.67l228.67-228.66 46.66 46.66L526.67-480l228.66 228.67-46.66 46.66L480-433.33 251.33-204.67Z"/>
                        </svg>
                    </div>
                    <img src="${e.image}" alt="" loading="lazy">
                    <p class="borderBottom">Date: ${dateDisplay}</p>
                    <p style="margin-bottom: 1rem !important;" class="borderBottom noMarginTop">${e.description}</p>
                    <form action="${e.formURL}" method="post">
                        <div style="margin: 0 auto; width: 100%;" class="modalForm row gtr-uniform">
                            <div style="width: 100%;" class="col-12">
                                <label for="name">Name</label>
                                <input type="text" name="name" id="${e.modalId}-name" value="" placeholder="Jane Doe" />
                            </div>
                            <div style="width: 100%;" class="col-12">
                                <label for="phone">Phone</label>
                                <input type="tel" name="phone" id="${e.modalId}-phone" value="" placeholder="(123)-456-789" />
                            </div>
                            <div style="width: 100%;" class="col-12">
                                <label for="guests">Guests attending with you:</label>
                                <input type="number" name="guests" id="${e.modalId}-guests" value="0" min="0" max="99" />
                            </div>
                            <div style="width: 100%;" class="col-12">
                                <ul class="actions">
                                    <li><input type="submit" value="RSVP" class="primary" /></li>
                                    <li><input type="reset" value="Reset" /></li>
                                </ul>
                            </div>
                        </div>
                    </form>
                `;
            modalContainer.appendChild(modal);
        });
    })
    .catch(err => {
        console.error('Could not load events:', err);
    });



// Events are now loaded from events.json in the fetch calls above
