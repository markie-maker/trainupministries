/**
 * Sync Events from Google Calendar to events.json
 * 
 * Usage: node sync-events.js
 * 
 * This script fetches events from your Google Calendar and saves them to events.json
 * for use on the website (avoids CORS issues).
 */

const fs = require('fs');
const https = require('https');

const CALENDAR_ID = 'c_bd45d0f766e9c88965f86aa975b1098f7721d70d2cac86b40d9a256ce351558b@group.calendar.google.com';
const API_KEY = 'AIzaSyAdBXJAoZw3MysefhIFJvxcTIgOj03dAC8';

const nowIsoString = new Date().toISOString();

const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events` + 
                `?timeMin=${nowIsoString}` +
                `&singleEvents=true` +
                `&orderBy=startTime` +
                `&key=${API_KEY}` +
                `&fields=items(summary,description,location,start)`;

function fetchGoogleCalendarEvents() {
    return new Promise((resolve, reject) => {
        https.get(API_URL, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    console.log('API Response:', JSON.stringify(response, null, 2));
                    
                    if (!response.items) {
                        reject(new Error('No items found in response'));
                        return;
                    }

                    const events = response.items.map(event => {
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

                            if (hasDateTime) {
                                formattedTime = dateObj.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                }).replace(/\s+/g, '');
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

                    resolve(events);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Failed to fetch from Google Calendar API: ${error.message}`));
        });
    });
}

async function syncEvents() {
    try {
        console.log('Fetching events from Google Calendar...');
        const events = await fetchGoogleCalendarEvents();
        
        const eventsPath = __dirname + '/events.json';
        fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
        
        console.log(`✓ Successfully synced ${events.length} event(s) to events.json`);
        console.log('Events:');
        events.forEach(e => {
            console.log(`  - ${e.title} (${e.date})`);
        });
    } catch (error) {
        console.error('✗ Error syncing events:', error.message);
        process.exit(1);
    }
}

syncEvents();
