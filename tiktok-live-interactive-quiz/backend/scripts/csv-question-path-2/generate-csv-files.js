const fs = require('fs');
const path = require('path');

// Question categories and topics
const categories = {
  'geography': {
    name: 'เกศาสตร์',
    questions: [
      'ประเทศไทยมีกี่จังหวัด?|77|76,78,79,80|ตอบว่า 77 จังหวัด|2',
      'เมืองอะไรคือเมืองหลวงของจีน?|Beijing|Shanghai,Tokyo,Seoul|หนึ่งในเมืองใหญ่ของเอเชีย|2',
      'ป่ากันใจขนาดใหญ่สุดของโลกอยู่ที่ไหน?|Brazil|Indonesia,Congo,Cameroon|ป่าน้ำสอบอาเมซอน|3',
    ]
  },
  'science': {
    name: 'วิทยาศาสตร์',
    questions: [
      'น้อยหนึ่งชั้นมาจากหลากหลายสิ่ง?|H2O|H2S,H2N,H2C|น้ำเป็นสารประกอบทางเคมี|2',
      'ประจุไฟฟ้าขององค์ประกอบไหลในวงจรจากเซลล์?|Electrons|Protons,Neutrons,Ions|อิเลกตรอนมีประจุลบ|2',
      'ดวงจันทร์โคจรรอบโลกในกี่วัน?|27.3|28,29,26|ประมาณ 27 วัน|1',
    ]
  },
  'history': {
    name: 'ประวัติศาสตร์',
    questions: [
      'สงครามโลกครั้งที่สองเริ่มปี?|1939|1940,1941,1938|ระหว่างปี ค.ศ. 1939-1945|2',
      'ประเทศไทยชื่อเดิมคือ?|Siam|Siamese,Thai,Kingdom|สยามเป็นชื่อเดิมของไทย|2',
      'อักษรลายลักษณ์ได้ถูกคิดค้นที่ใด?|Egypt|China,Mesopotamia,Rome|อักษรอียิปต์สมัยโบราณ|3',
    ]
  },
  'sports': {
    name: 'กีฬา',
    questions: [
      'ฟุตบอลมีผู้เล่นกี่คนในทีม?|11|10,12,9|มาตรฐานฟุตบอลโลก|1',
      'บาสเกตบอลมีวงแหวนที่ความสูงกี่ฟุต?|10|8,9,11|ความสูงมาตรฐาน|2',
      'เทนนิสมีกี่เซตในการแข่งขัน?|3|2,4,5|ในการแข่งขันใหญ่ๆ|3',
    ]
  },
  'movies': {
    name: 'หนังและทีวี',
    questions: [
      'ภาพยนตร์ Avatar ออกฉายปีไหน?|2009|2008,2010,2007|ผลงานของ James Cameron|1',
      'ชื่อของอนิเมะระดับตำนานเรื่อง?|Naruto|One Piece,Bleach,Death Note|เกี่ยวกับนินจา|2',
      'ภาพยนตร์ Titanic จมอยู่ที่ใด?|Atlantic Ocean|Pacific,Indian,Arctic|ในมหาสมุทรแอตแลนติก|1',
    ]
  },
  'general': {
    name: 'ทั่วไป',
    questions: [
      '2 + 2 เท่ากับเท่าไร?|4|3,5,6|ตอบ 4|1',
      'สีที่ประกอบประเด็นกับสีน้ำเงินคือ?|Orange|Yellow,Green,Red|สีเสริมกันในวงกลมสี|2',
      'มนุษย์มีกี่ซี่ฟัน?|32|30,33,28|ฟันถาวรทั่วไป|1',
    ]
  }
};

// Generate sample questions based on file number
function generateQuestions(fileNumber) {
  const categoryKeys = Object.keys(categories);
  const categoryIndex = (fileNumber - 1) % categoryKeys.length;
  const category = categoryKeys[categoryIndex];
  const categoryData = categories[category];

  const questions = [];
  const baseIndex = (fileNumber - 1) * 20; // 20 questions per file

  for (let i = 0; i < 20; i++) {
    const qIndex = (baseIndex + i) % categoryData.questions.length;
    const questionData = categoryData.questions[qIndex];
    const parts = questionData.split('|');

    questions.push({
      question: `[${category.toUpperCase()} #${baseIndex + i + 1}] ${parts[0]}`,
      answer: parts[1],
      options: parts[2],
      hint: parts[3],
      difficulty: parseInt(parts[4])
    });
  }

  return questions;
}

// Create CSV content
function createCSVContent(questions) {
  let csv = 'question,answer,options,hint,difficulty\n';

  questions.forEach(q => {
    const questionEscaped = `"${q.question.replace(/"/g, '""')}"`;
    const optionsEscaped = `"${q.options.replace(/"/g, '""')}"`;
    const hintEscaped = `"${q.hint.replace(/"/g, '""')}"`;

    csv += `${questionEscaped},${q.answer},${optionsEscaped},${hintEscaped},${q.difficulty}\n`;
  });

  return csv;
}

// Main function
async function generateCSVFiles() {
  const baseDir = __dirname;
  console.log('🎯 Generating 100 CSV question files...\n');

  let successCount = 0;
  const startTime = Date.now();

  for (let i = 1; i <= 101; i++) {
    try {
      const fileNumber = String(i).padStart(2, '0');
      const filename = `questions-${fileNumber}.csv`;
      const filepath = path.join(baseDir, filename);

      const questions = generateQuestions(i);
      const csvContent = createCSVContent(questions);

      fs.writeFileSync(filepath, csvContent, 'utf8');

      if (i % 10 === 0 || i === 1) {
        console.log(`✅ Created: ${filename} (${questions.length} questions)`);
      }

      successCount++;
    } catch (error) {
      console.error(`❌ Error creating questions-${String(i).padStart(2, '0')}.csv:`, error.message);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n✨ Generation complete!`);
  console.log(`📊 Statistics:`);
  console.log(`   - Total files: ${successCount}/101`);
  console.log(`   - Time taken: ${duration}s`);
  console.log(`   - Questions per file: ~20`);
  console.log(`   - Total questions: ~${successCount * 20}`);
  console.log(`\n📍 Location: ${baseDir}`);
}

generateCSVFiles();
