module.exports = {
  apps: [{
    name: 'auth-api',
    script: './src/app.js',
    instances: 1,              // จำนวน instances
    exec_mode: 'cluster',      // โหมด cluster
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    // การ restart อัตโนมัติ
    max_restarts: 10,          // restart สูงสุด 10 ครั้ง
    min_uptime: '10s',         // ต้องทำงานได้อย่างน้อย 10 วิก่อนถือว่าเป็น restart ที่สำเร็จ
    restart_delay: 4000,       // รอ 4 วินาทีก่อน restart
    
    // Exponential backoff restart delay
    exp_backoff_restart_delay: 100,
    
    // Error handling
    autorestart: true,         // restart อัตโนมัติเมื่อ crash
    
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};