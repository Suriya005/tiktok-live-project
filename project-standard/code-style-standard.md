# Backend Code Style Standard

มาตรฐานแนวทางปฏิบัติในการเขียนโค้ด (Naming, JavaScript, Linting, และ Git) เพื่อความเป็นระเบียบและความเป็นสากลของโค้ดในระดับสถาปัตยกรรม

---

## 1. มาตรฐานการตั้งชื่อ (Naming Convention)

| รูปแบบ | ตัวอย่าง | การใช้งาน |
|---|---|---|
| `camelCase` | `findProducts` | Variable, Function |
| `PascalCase` | `ProductService` | Class, Interface |
| `snake_case` | `product_name`, `ou_id` | Database Field, JSON API |
| `UPPER_CASE` | `MAX_LIMIT` | Constants |

---

## 2. แนวทางปฏิบัติ JavaScript (Best Practices)

- **Variable Declaration:** บังคับใช้ `const` เป็นหลัก ใช้ `let` เฉพาะกรณีที่มีการเปลี่ยนค่า (ห้ามใช้ `var` อย่างเด็ดขาด)
- **Constant Management:** หลีกเลี่ยง Magic Number / Magic String — กำหนดค่าเป็น Constant อย่างชัดเจน
- **Asynchronous Logic:** บังคับใช้ `async/await` แทน `.then()/.catch()`
- **Logging:** ห้ามใช้ `console.log` ใน Production — บังคับใช้ระบบ Logger มาตรฐานของโครงการแทน

---

## 3. การควบคุมคุณภาพโค้ด (Linting & Formatting)

### 3.1 ESLint Config

กฎ Custom Core Rules ที่จำเป็น:

| Rule | Description | Severity |
|---|---|---|
| `no-var` | ห้ามใช้ `var` — บังคับใช้ `const` หรือ `let` | Error |
| `prefer-const` | บังคับใช้ `const` สำหรับตัวแปรที่ไม่มีการเปลี่ยนแปลงค่า | Error |
| `eqeqeq` | บังคับใช้ `===` (Strict Equality) ในการเปรียบเทียบ | Error |
| `camelcase` | ตัวแปรในระบบต้องเป็น `camelCase` (ยกเว้น Properties) | Error |
| `no-console` | ห้ามใช้ `console.log` — บังคับใช้ Logger แทน | Error |

```js
// eslint.config.js
const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-n');
const securityPlugin = require('eslint-plugin-security');

module.exports = [
  js.configs.recommended,
  nodePlugin.configs['flat/recommended'],
  securityPlugin.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
      camelcase: ['error', { properties: 'never' }],
      'no-console': 'error',
    },
  },
];
```

### 3.2 Prettier Config

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

| Option | Value | หมายเหตุ |
|---|---|---|
| `singleQuote` | `true` | บังคับใช้ Single Quote `''` |
| `semi` | `true` | บังคับจบประโยคด้วย Semicolon `;` |
| `tabWidth` | `2` | Indentation 2 Spaces |
| `trailingComma` | `"all"` | ใส่ลูกน้ำตัวสุดท้ายเสมอ |
| `printWidth` | `100` | ความยาวบรรทัดสูงสุด 100 ตัวอักษร |
| `endOfLine` | `"lf"` | ขึ้นบรรทัดใหม่แบบ LF `\n` |

---

## 4. มาตรฐานการออกแบบฟังก์ชัน (Function Design)

### ✅ Single Responsibility

ฟังก์ชัน 1 อันควรปฏิบัติหน้าที่เพียงอย่างเดียว — แนะนำไม่เกิน **50 บรรทัด**

### ✅ Guard Clauses (Early Return)

ใช้การตรวจสอบเงื่อนไขล่วงหน้าเพื่อ `return` ทันที แทนการใช้ `if/else` ซ้อนกัน:

```js
// ✅ Good: Guard Clause
const processData = (data) => {
  if (!data) return null;
  if (!data.isActive) return null;

  const result = executeBusinessLogic(data);
  return result;
};

// ❌ Bad: Nested logic
const processData = (data) => {
  if (data) {
    if (data.isActive) {
      const result = executeBusinessLogic(data);
      return result;
    }
  }
};
```

---

## 5. มาตรฐานการเขียน Middleware (Middleware Practices)

| | กฎ |
|---|---|
| **Do** | ใช้สำหรับ Auth, Logging, Header/Body Parser, Rate Limiting |
| **Don't** | ห้ามนำ Business Logic หรือ Database Query ขนาดใหญ่มาไว้ใน Middleware |
