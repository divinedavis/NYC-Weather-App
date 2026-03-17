module.exports = {
  apps: [
    {
      name: 'cityweather',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/nycweather',
      max_memory_restart: '450M',
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
