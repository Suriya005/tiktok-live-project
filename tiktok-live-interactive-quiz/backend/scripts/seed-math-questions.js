require('dotenv').config();
const { getDB, connectDB } = require('../src/config/database');
const Question = require('../src/models/Question');

// Math question generators for each level
const questionGenerators = {
  // Level 1: Basic arithmetic (1-100)
  1: () => {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 100) + 1;
    const operations = ['+', '-', '*', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let answer, question;
    switch(op) {
      case '+':
        answer = a + b;
        question = `${a} + ${b} = ?`;
        break;
      case '-':
        answer = a - b;
        question = `${a} - ${b} = ?`;
        break;
      case '*':
        answer = a * b;
        question = `${a} × ${b} = ?`;
        break;
      case '÷':
        if (b === 0) return questionGenerators[1]();
        answer = Math.floor(a / b);
        question = `${a} ÷ ${b} = ? (ปัดลง)`;
        break;
    }
    
    return {
      text: question,
      answer: answer.toString(),
      hint: `ผลลัพธ์อยู่ระหว่าง ${Math.max(0, answer - 50)} ถึง ${answer + 50}`,
      points: 1,
      requiredCoins: 1
    };
  },

  // Level 2: Intermediate (1-1000)
  2: () => {
    const a = Math.floor(Math.random() * 1000) + 1;
    const b = Math.floor(Math.random() * 1000) + 1;
    const operations = ['+', '-', '*', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let answer, question;
    switch(op) {
      case '+':
        answer = a + b;
        question = `${a} + ${b} = ?`;
        break;
      case '-':
        answer = a - b;
        question = `${a} - ${b} = ?`;
        break;
      case '*':
        const x = Math.floor(Math.random() * 100) + 1;
        const y = Math.floor(Math.random() * 100) + 1;
        answer = x * y;
        question = `${x} × ${y} = ?`;
        break;
      case '÷':
        if (b === 0) return questionGenerators[2]();
        answer = Math.floor(a / b);
        question = `${a} ÷ ${b} = ? (ปัดลง)`;
        break;
    }
    
    return {
      text: question,
      answer: answer.toString(),
      hint: `ผลลัพธ์คือจำนวนเต็มใกล้เคียง ${answer}`,
      points: 5,
      requiredCoins: 5
    };
  },

  // Level 3: Advanced (Percentage, Power, Fraction)
  3: () => {
    const types = ['percentage', 'power', 'fraction', 'mixed'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let question, answer, hint;
    
    switch(type) {
      case 'percentage': {
        const num = Math.floor(Math.random() * 1000) + 100;
        const pct = Math.floor(Math.random() * 90) + 10;
        answer = Math.floor((num * pct) / 100);
        question = `${pct}% ของ ${num} เท่ากับเท่าไหร่?`;
        hint = `คำตอบใกล้เคียง ${answer}`;
        break;
      }
      case 'power': {
        const base = Math.floor(Math.random() * 10) + 2;
        const exp = Math.floor(Math.random() * 4) + 2;
        answer = Math.pow(base, exp);
        question = `${base}^${exp} = ?`;
        hint = `ผลลัพธ์ = ${base} ยกกำลัง ${exp}`;
        break;
      }
      case 'fraction': {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const den1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const den2 = Math.floor(Math.random() * 10) + 1;
        
        const resultNum = num1 * den2 + num2 * den1;
        const resultDen = den1 * den2;
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(resultNum, resultDen);
        
        answer = `${resultNum / divisor}/${resultDen / divisor}`;
        question = `${num1}/${den1} + ${num2}/${den2} = ?`;
        hint = `คำตอบเป็นเศษส่วน ${answer}`;
        break;
      }
      case 'mixed': {
        const n1 = Math.floor(Math.random() * 100) + 10;
        const n2 = Math.floor(Math.random() * 100) + 10;
        const n3 = Math.floor(Math.random() * 100) + 10;
        answer = (n1 * n2) + n3;
        question = `(${n1} × ${n2}) + ${n3} = ?`;
        hint = `ลำดับการคำนวณ: คูณก่อน แล้วจึงบวก`;
        break;
      }
    }
    
    return {
      text: question,
      answer: answer.toString(),
      hint: hint,
      points: 15,
      requiredCoins: 15
    };
  },

  // Level 4: Complex (Algebra, Square Root, Equations)
  4: () => {
    const types = ['algebra', 'sqrt', 'equation', 'sequence'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let question, answer, hint;
    
    switch(type) {
      case 'algebra': {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const c = Math.floor(Math.random() * 20) + 1;
        answer = (a * b) + c;
        question = `ถ้า x = ${a}, y = ${b} จงหาค่า xy + ${c} = ?`;
        hint = `ใส่ค่า x และ y แล้วคำนวณ`;
        break;
      }
      case 'sqrt': {
        const num = Math.floor(Math.random() * 20) + 1;
        const squared = num * num;
        answer = num;
        question = `√${squared} = ?`;
        hint = `ค่ารูทที่เป็นจำนวนเต็มบวก`;
        break;
      }
      case 'equation': {
        const x = Math.floor(Math.random() * 50) + 1;
        const a = Math.floor(Math.random() * 10) + 1;
        const b = a * x + Math.floor(Math.random() * 50) + 1;
        answer = x;
        question = `${a}x + ? = ${b} เมื่อ x = ${x}`;
        hint = `หา ? โดยแทน x= ${x}`;
        break;
      }
      case 'sequence': {
        const first = Math.floor(Math.random() * 20) + 1;
        const diff = Math.floor(Math.random() * 10) + 1;
        const term = Math.floor(Math.random() * 8) + 2;
        answer = first + (diff * (term - 1));
        question = `ลำดับเลขคณิต: พจน์แรก = ${first}, ผลต่าง = ${diff} หาพจน์ที่ ${term}`;
        hint = `ใช้สูตร an = a1 + (n-1)d`;
        break;
      }
    }
    
    return {
      text: question,
      answer: answer.toString(),
      hint: hint,
      points: 20,
      requiredCoins: 20
    };
  },

  // Level 5: Expert (Complex problems, Logic, Combinations)
  5: () => {
    const types = ['combinatorics', 'logic', 'advanced_algebra', 'series'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let question, answer, hint;
    
    switch(type) {
      case 'combinatorics': {
        const n = Math.floor(Math.random() * 8) + 3;
        const r = Math.floor(Math.random() * n) + 1;
        // Calculate nCr (simplified)
        let nCr = 1;
        for (let i = 0; i < r; i++) {
          nCr = nCr * (n - i) / (i + 1);
        }
        answer = Math.round(nCr);
        question = `จำนวนวิธีเลือก ${r} รายการจาก ${n} รายการ = ?`;
        hint = `ใช้สูตร C(n,r) = n! / (r!(n-r)!)`;
        break;
      }
      case 'logic': {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        answer = Math.min(a, b) + Math.max(a, b);
        question = `ถ้า x + y = ${a + b} และ x - y = ${a - b} จงหา x`;
        hint = `แก้ระบบสมการเชิงเส้น`;
        break;
      }
      case 'advanced_algebra': {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = a * b;
        answer = a + b;
        question = `เมื่อ x² + ${answer}x + ${c} = (x + ${a})(x + ${b}) จงหา x² + ${answer}x + ${c} ที่ x = 1`;
        hint = `แทน x = 1 ลงในสมการ`;
        break;
      }
      case 'series': {
        const first = Math.floor(Math.random() * 10) + 1;
        const ratio = Math.floor(Math.random() * 3) + 2;
        const count = Math.floor(Math.random() * 4) + 3;
        let sum = 0;
        for (let i = 0; i < count; i++) {
          sum += first * Math.pow(ratio, i);
        }
        answer = sum;
        question = `ผลบวก ${count} พจน์แรกของอนุกรมเรขาคณิต: ${first}, ${first * ratio}, ${first * ratio * ratio}, ... = ?`;
        hint = `ใช้สูตร Sn = a(r^n - 1)/(r - 1)`;
        break;
      }
    }
    
    return {
      text: question,
      answer: answer.toString(),
      hint: hint,
      points: 50,
      requiredCoins: 50
    };
  }
};

async function seedMathQuestions() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const db = getDB();
    const collection = db.collection('questions');

    // Clear existing math questions
    const deleteResult = await collection.deleteMany({ category: 'คณิตคิดไว' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing math questions`);

    let totalInserted = 0;

    // Generate 2000 questions per level (5 levels)
    for (let level = 1; level <= 5; level++) {
      console.log(`\n📝 Generating Level ${level} questions...`);
      
      const questionsToInsert = [];
      for (let i = 0; i < 2000; i++) {
        const baseQuestion = questionGenerators[level]();
        const question = new Question({
          text: baseQuestion.text,
          options: ['A', 'B', 'C', 'D'],
          answer: baseQuestion.answer,
          hint: baseQuestion.hint,
          category: 'คณิตคิดไว',
          tags: [`level-${level}`, 'math', 'arithmetic'],
          difficulty: level,
          points: baseQuestion.points,
          requiredCoins: baseQuestion.requiredCoins
        });
        
        questionsToInsert.push(question);
        
        if ((i + 1) % 500 === 0) {
          process.stdout.write(`  ✓ Generated ${i + 1}/2000\r`);
        }
      }

      // Batch insert
      const insertResult = await collection.insertMany(questionsToInsert);
      console.log(`  ✅ Level ${level}: Inserted ${insertResult.insertedIds.length} questions`);
      totalInserted += insertResult.insertedIds.length;
    }

    console.log(`\n🎉 Successfully seeded ${totalInserted} math questions!`);
    console.log('📊 Distribution:');
    console.log('  - Level 1 (Basic): 2000 questions');
    console.log('  - Level 2 (Intermediate): 2000 questions');
    console.log('  - Level 3 (Advanced): 2000 questions');
    console.log('  - Level 4 (Complex): 2000 questions');
    console.log('  - Level 5 (Expert): 2000 questions');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error.message);
    process.exit(1);
  }
}

seedMathQuestions();
