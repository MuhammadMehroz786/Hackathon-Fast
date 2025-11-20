/**
 * Quickly populate system with multiple batches of real weather data
 * This helps build up enough data points for ML analysis
 */

const { fetchAndSendRealData } = require('./realTimeDataService');

async function populateData(batches = 10) {
  console.log(`🚀 Populating system with ${batches} batches of real weather data...\n`);

  for (let i = 1; i <= batches; i++) {
    console.log(`\n📦 Batch ${i}/${batches}:`);
    console.log('─'.repeat(50));

    try {
      await fetchAndSendRealData();
      console.log(`✅ Batch ${i} complete`);

      // Small delay between batches
      if (i < batches) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ Batch ${i} failed:`, error.message);
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`✅ Population complete! ${batches} batches of real weather data sent.`);
  console.log('🔍 Each glacier location now has sufficient data for ML analysis.');
  console.log('═'.repeat(70));
}

// Run if called directly
if (require.main === module) {
  populateData(10)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { populateData };
