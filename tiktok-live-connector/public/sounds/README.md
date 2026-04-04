# 🔊 Sound Files Folder

วางไฟล์เสียงของคุณไว้ที่นี่!

## 📁 ไฟล์ที่ใช้:

- `gift.mp3` - เสียงเมื่อได้ของขวัญทั่วไป
- `big-gift.mp3` - เสียงเมื่อได้ของขวัญพิเศษ (Rose, Lion, TikTok, etc.)
- `comment.mp3` - เสียงเมื่อมีคอมเมนต์

## 🎵 แนะนำเว็บหาเสียงฟรี:

1. **Freesound.org** - https://freesound.org/
2. **Mixkit** - https://mixkit.co/free-sound-effects/
3. **Zapsplat** - https://www.zapsplat.com/
4. **Pixabay Sounds** - https://pixabay.com/sound-effects/

## 💡 ตัวอย่างการใช้งาน:

```javascript
// แก้ไขรายชื่อของขวัญพิเศษใน client-example.html:
const specialGiftNames = [
    'Rose',
    'TikTok', 
    'Lion',
    'Galaxy',
    'Planet'
];
```

## 🔧 การใช้ไฟล์เสียงของคุณเอง:

1. ดาวน์โหลดไฟล์เสียง `.mp3` หรือ `.wav`
2. เปลี่ยนชื่อเป็น `gift.mp3`, `big-gift.mp3`, `comment.mp3`
3. วางในโฟลเดอร์นี้
4. แก้ไข `client-example.html` ให้ชี้ไปที่ไฟล์:

```javascript
const sounds = {
    gift: new Audio('/sounds/gift.mp3'),
    bigGift: new Audio('/sounds/big-gift.mp3'),
    comment: new Audio('/sounds/comment.mp3')
};
```

## ⚠️ หมายเหตุ:

ตอนนี้ใช้เสียงแบบ inline (base64) อยู่ ถ้าต้องการใช้ไฟล์จริง ให้:

1. เพิ่ม static file serving ใน `server.js`:
```javascript
app.use('/sounds', express.static('public/sounds'));
```

2. เปลี่ยน path ใน `client-example.html` เป็น:
```javascript
gift: new Audio('http://localhost:3002/sounds/gift.mp3')
```
