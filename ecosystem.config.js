module.exports = {
  apps: [
    {
      name: "nyc-listings-scraper",
      script: "pnpm",
      args: "pnpx tsx scripts/run-scraper-cron.ts",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
        CHROME_PATH: "/usr/bin/google-chrome-stable",
      },
      error_file: "logs/scraper-error.log",
      out_file: "logs/scraper-out.log",
      time: true,
    },
  ],
};
