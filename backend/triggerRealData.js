/**
 * Manually trigger real-time data fetch
 * Use this to immediately populate the system with real weather data
 */

const { fetchAndSendRealData } = require('./realTimeDataService');

console.log('🚀 Manually triggering real-time data fetch...\n');

fetchAndSendRealData()
  .then(() => {
    console.log('\n✅ Manual trigger complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
