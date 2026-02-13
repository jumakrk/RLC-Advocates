<?php
class Config
{
    // ------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------

    // UPDATE THIS: Your actual domain
    const BASE_URL = 'https://rlcadvocates.co.ke/appointments'; 
    const LANGUAGE = 'english';
    const DEBUG_MODE = false;

    // ------------------------------------------------------------------------
    // DATABASE SETTINGS
    // ------------------------------------------------------------------------

    // UPDATE THESE: Your cPanel database credentials
    const DB_HOST = 'localhost';
    const DB_NAME = 'rlc_appointments'; // Change to your cPanel DB name
    const DB_USERNAME = 'rlc_admin';    // Change to your cPanel DB user
    const DB_PASSWORD = 'your_password'; // Change to your cPanel DB password
    
    // ------------------------------------------------------------------------
    // EMAIL SETTINGS (SMTP)
    // ------------------------------------------------------------------------
    
    const SMTP_HOST = 'mail.rlcadvocates.co.ke'; // e.g., mail.yourdomain.com
    const SMTP_USER = 'info@rlcadvocates.co.ke'; // Your email address
    const SMTP_PASS = 'your_email_password';     // Your email password
    const SMTP_PORT = 465;                       // Common SSL port
    const SMTP_CRYPTO = 'ssl';                   // 'ssl' or 'tls'

    // ------------------------------------------------------------------------
    // GOOGLE CALENDAR SYNC
    // ------------------------------------------------------------------------

    const GOOGLE_SYNC_FEATURE = false; // Enter TRUE or FALSE
    const GOOGLE_CLIENT_ID = '';
    const GOOGLE_CLIENT_SECRET = '';
}
