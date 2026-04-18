const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Files to convert
const files = [
  'API_TikTokLiveQuiz.docx',
  'ARCH_TikTokLiveQuiz.docx',
  'PRD_TikTokLiveQuiz.docx',
  'README_TikTokLiveQuiz.docx'
];

async function convertDocxToMd(docxFile) {
  try {
    const docxPath = path.join(__dirname, docxFile);
    const mdFile = docxFile.replace('.docx', '.md');
    const mdPath = path.join(__dirname, mdFile);

    console.log(`📄 Converting: ${docxFile}...`);

    // Try using mammoth.extractRawText as fallback
    const result = await mammoth.extractRawText({ path: docxPath });
    
    if (!result || !result.value) {
      console.error(`❌ No content extracted from ${docxFile}`);
      return false;
    }

    let markdown = result.value;

    // Basic markdown formatting
    markdown = markdown
      .replace(/^## /gm, '### ')  // Convert level 2 headings to level 3
      .replace(/^# /gm, '## ');   // Convert level 1 headings to level 2

    // Trim extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    // Write to .md file
    fs.writeFileSync(mdPath, markdown, 'utf8');
    console.log(`✅ Saved to: ${mdFile}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${docxFile}:`, error.message);
    return false;
  }
}


async function main() {
  console.log('🚀 Starting .docx to .md conversion...\n');
  
  let successCount = 0;
  for (const file of files) {
    const success = await convertDocxToMd(file);
    if (success) successCount++;
  }

  console.log(`\n✨ Conversion complete! ${successCount}/${files.length} files converted successfully.`);
}

main();
