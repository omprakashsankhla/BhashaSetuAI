const db = require('./db');
const webpush = require('web-push');
require('dotenv').config({ override: true });

// Ensure VAPID details are set if they weren't globally
let vapidSet = false;
try {
  webpush.setVapidDetails(
    'mailto:support@bhashasetu.example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  vapidSet = true;
} catch (e) {
  console.log("VAPID keys not configured, push notifications disabled.");
}

const sendDailyReminders = async () => {
  if (!vapidSet) return;
  try {
    console.log('Running daily reminder push job...');
    const [subscriptions] = await db.query('SELECT * FROM PushSubscriptions');
    
    if (subscriptions.length === 0) {
      console.log('No push subscriptions found. Skipping reminders.');
      return;
    }

    const payload = JSON.stringify({
      title: 'Time to learn! 📚',
      body: 'Keep your streak alive! Complete a short lesson today on BhashaSetu.',
      icon: '/pwa-192x192.png',
      data: { url: '/' }
    });

    let sent = 0;
    const sendPromises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      return webpush.sendNotification(pushSubscription, payload)
        .then(() => { sent++; })
        .catch(err => {
          if (err.statusCode === 410) {
            // Subscription has expired
            return db.query('DELETE FROM PushSubscriptions WHERE id = ?', [sub.id]);
          }
        });
    });

    await Promise.all(sendPromises);
    console.log(`Successfully sent ${sent} daily reminders.`);
  } catch (error) {
    console.error('Error running daily reminders:', error);
  }
};

const startReminderJob = () => {
  // Delay initial run by 5 mins to not block startup
  setTimeout(sendDailyReminders, 1000 * 60 * 5); 
  // Run every 24 hours
  setInterval(sendDailyReminders, 1000 * 60 * 60 * 24);
};

module.exports = { startReminderJob };
