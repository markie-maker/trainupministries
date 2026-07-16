/**
 * Sync Events from Google Calendar to events.json
 * 
 * Usage: node sync-events.js
 * 
 * This script fetches events from your Google Calendar using a Service Account
 * and saves them to events.json for use on the website (avoids CORS issues).
 * 
 * Requires: credentials.json file (Google Service Account JSON key)
 */

const fs = require('fs');
const { google } = require('googleapis');

const CALENDAR_ID = 'c_bd45d0f766e9c88965f86aa975b1098f7721d70d2cac86b40d9a256ce351558b@group.calendar.google.com';

async function fetchGoogleCalendarEvents() {
    try {
        // Load credentials from file
        const credentialsPath = __dirname + '/credentials.json';
        if (!fs.existsSync(credentialsPath)) {
            throw new Error('credentials.json not found. Please download it from Google Cloud Console.');
        }

        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

        // Authenticate using Service Account
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly']
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const now = new Date();
        const timeMinIsoString = new Date(now.getFullYear(), 0, 1, 0, 0, 0).toISOString();
        const timeMaxIsoString = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59).toISOString();

        const allEventItems = [];
        let pageToken = null;

        do {
            const response = await calendar.events.list({
                calendarId: CALENDAR_ID,
                timeMin: timeMinIsoString,
                timeMax: timeMaxIsoString,
                singleEvents: true,
                orderBy: 'startTime',
                maxResults: 2500,
                pageToken,
                fields: 'items(summary,description,location,start,status,id),nextPageToken'
            });

            const pageItems = response.data.items || [];
            allEventItems.push(...pageItems);
            pageToken = response.data.nextPageToken || null;
        } while (pageToken);

        if (!allEventItems.length) {
            throw new Error('No items found in response');
        }

        const events = allEventItems.map(event => {
            const title = event.summary || "Untitled Event";
            const description = event.description || "Join us for this special session.";
            const location = event.location || "TBD";

            const cleanId = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');      

            let formattedDate = "TBD";
            let formattedTime = "TBD";

            const hasDateTime = !!event.start?.dateTime;
            const rawDateValue = event.start?.dateTime || event.start?.date;

            if (rawDateValue) {
                const dateObj = new Date(rawDateValue);
                
                formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                });

                // Hardcoded to Southern California timezone (PDT/PST)
                if (hasDateTime) {
                    formattedTime = new Intl.DateTimeFormat('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'America/Los_Angeles'
                    }).format(dateObj).replace(/\s+/g, '');
                }
            }

            return {
                "title": title,
                "modalId": cleanId,
                "description": description,
                "location": location,
                "date": formattedDate,
                "time": formattedTime,
                "image": "prayer&fasting.jpg",
                "formURL": ""
            };
        });

        return events;
    } catch (error) {
        throw new Error(`Failed to fetch from Google Calendar API: ${error.message}`);
    }
}

async function syncEvents() {
    try {
        console.log('Fetching events from Google Calendar...');
        const events = await fetchGoogleCalendarEvents();
        
        const eventsPath = __dirname + '/events.json';
        fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
        
        console.log(`✓ Successfully synced ${events.length} event(s) to events.json`);
        console.log('Events:');
        events?.forEach(e => {
            console.log(`  - ${e.title} (${e.date})`);
        });
    } catch (error) {
        console.error('✗ Error syncing events:', error.message);
        process.exit(1);
    }
}

syncEvents();
