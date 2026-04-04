1. คำสั่ง PM2 ที่ใช้บ่อย:
# เริ่ม app
pm2 start ecosystem.config.js --env production

# ดู status
pm2 status

# ดู logs แบบ real-time
pm2 logs auth-api

# ดู error logs อย่างเดียว
pm2 logs auth-api --err

# Restart app
pm2 restart auth-api

# Reload แบบ zero-downtime (สำหรับ cluster mode)
pm2 reload auth-api

# Monitor
pm2 monit

# ดูข้อมูล app
pm2 describe auth-api

# ดู logs ที่เก็บไว้
pm2 logs auth-api --lines 100

2. เพิ่ม Monitoring & Alerts
PM2 Plus (เสียเงิน) หรือใช้ฟรีแบบจำกัด:

# เชื่อม PM2 Plus
pm2 link <secret_key> <public_key>

3. ตั้งค่า Auto-start เมื่อ Server Reboot:

# บันทึก process list
pm2 save

# ตั้งค่า startup script
pm2 startup

# จะได้คำสั่งมาให้ run (copy แล้ว paste)
# เช่น: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user