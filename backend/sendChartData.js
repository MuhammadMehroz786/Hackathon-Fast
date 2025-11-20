/**
 * Send multiple real-time updates quickly to populate charts
 */

const { fetchAndSendRealData } = require('./realTimeDataService');

async function sendMultipleUpdates() {
  console.log('📊 Sending real-time updates to populate charts...\n');

  for (let i = 1; i <= 20; i++) {
    console.log(`Update ${i}/20:`);
    await fetchAndSendRealData();
    // Small delay to allow WebSocket to broadcast
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n✅ Chart data sent! Charts should now display.');
  console.log('🔄 Refresh your browser if needed.');
}

sendMultipleUpdates()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
