export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // secure: true, // true for 465, false for other ports
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'no-reply@rlcadvocates.co.ke'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'info@rlcadvocates.co.ke'),
      },
    },
  },
});
