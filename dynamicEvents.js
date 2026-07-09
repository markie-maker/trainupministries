// const CALENDAR_ID = 'c_bd45d0f766e9c88965f86aa975b1098f7721d70d2cac86b40d9a256ce351558b@group.calendar.google.com';
// const API_KEY = 'AIzaSyAdBXJAoZw3MysefhIFJvxcTIgOj03dAC8';

// const nowIsoString = new Date().toISOString();

// const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events` + 
//                 `?timeMin=${nowIsoString}` +
//                 `&singleEvents=true` +
//                 `&orderBy=startTime` +
//                 `&key=${API_KEY}` +
//                 `&fields=items(summary,description,location,start)`;

// async function loadEvents() {
//   try {
//     const response = await fetch(API_URL);

//     if (!response.ok) {
//       throw new Error(`Google API Error! Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return renderCards(data.items);

//   } catch (error) {
//     console.error('Error fetching calendar:', error);
//     document.getElementById('eventContainer').innerHTML = 
//       '<p>Unable to load upcoming events at this time.</p>';
//   }
// }

// function renderCards(googleEvents) {
//   if (!googleEvents || googleEvents.length === 0) return [];

//     const convertedArray = googleEvents.map(event => {
//         const title = event.summary || "Untitled Event";
//         const description = event.description || "Join us for this special session.";
//         const location = event.location || "TBD";

//         const cleanId = title
//         .toLowerCase()
//         .replace(/\s+/g, '-');      

//         let formattedDate = "TBD";
//         let formattedTime = "TBD";

//         const hasDateTime = !!event.start?.dateTime;
//         const rawDateValue = event.start?.dateTime || event.start?.date;

//         if (rawDateValue) {
//         const dateObj = new Date(rawDateValue);
        
//         formattedDate = dateObj.toLocaleDateString('en-US', {
//             month: '2-digit',
//             day: '2-digit',
//             year: 'numeric'
//         });

//         if (hasDateTime) {
//             formattedTime = dateObj.toLocaleTimeString('en-US', {
//             hour: 'numeric',
//             minute: '2-digit',
//             hour12: true
//             }).replace(/\s+/g, '');
//         }
//         }

//         return {
//         "title": title,
//         "modalId": cleanId,
//         "description": description,
//         "location": location,
//         "date": formattedDate,
//         "time": formattedTime,
//         "image": "prayer&fasting.jpg",
//         "formURL": ""
//         };
//     });

//   console.log("=== COPY AND PASTE THIS DIRECTLY INTO YOUR JSON FILE ===");
//   console.log(JSON.stringify(convertedArray, null, 4));
  
//   return convertedArray;
// }

// async function initializeApp () {
//   const eventsDataJson = await loadEvents();
  
// }

// initializeApp();