module.exports = {
  apps: [
    {
      name: 'doctruyen-frontend',
      script: 'npm',
      args: 'start',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      merge_logs: true,
      // Restart on crash
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};

