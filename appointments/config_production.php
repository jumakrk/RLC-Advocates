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
    // GOOGLE CALENDAR SYNC
    // ------------------------------------------------------------------------

    const GOOGLE_SYNC_FEATURE = false; // Enter TRUE or FALSE
    const GOOGLE_CLIENT_ID = '';
    const GOOGLE_CLIENT_SECRET = '';
}
