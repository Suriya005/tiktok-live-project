const fs = require('fs');
const path = require('path');

// Clear all CSV files
async function clearCSVFiles() {
  const baseDir = __dirname;
  console.log('🧹 Clearing all CSV files...\n');

  let clearedCount = 0;
  let errorCount = 0;

  // Get all CSV files
  const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.csv'));

  for (const file of files) {
    try {
      const filepath = path.join(baseDir, file);
      
      // Write only CSV header
      const header = 'question,answer,options,hint,difficulty\n';
      fs.writeFileSync(filepath, header, 'utf8');

      if (clearedCount % 10 === 0) {
        process.stdout.write(`\r✨ Cleared: ${clearedCount + 1}/${files.length} files`);
      }

      clearedCount++;
    } catch (error) {
      console.error(`\n❌ Error clearing ${file}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n\n✅ Clearing complete!`);
  console.log(`📊 Statistics:`);
  console.log(`   - Cleared: ${clearedCount} files`);
  console.log(`   - Errors: ${errorCount} files`);
  console.log(`\n📍 All CSV files now contain only headers`);
  console.log(`💡 Ready to import new questions!\n`);
}

clearCSVFiles();
