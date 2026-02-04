<?php
class Config
{
    // ------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------

    const BASE_URL = 'http://localhost:8080';
    const LANGUAGE = 'english';
    const DEBUG_MODE = true;

    // ------------------------------------------------------------------------
    // DATABASE SETTINGS (Update these if your XAMPP/MySQL uses different credentials)
    // ------------------------------------------------------------------------

    const DB_HOST = 'localhost';
    const DB_NAME = 'vwkldenh_rlc_appointments'; // You must create this DB in PHPMyAdmin
    const DB_USERNAME = 'vwkldenh_rlc_booking_admin'; // Standard XAMPP default
    const DB_PASSWORD = 'XJwa._8yIMUYuX2$';     // Standard XAMPP default

    // ------------------------------------------------------------------------
    // GOOGLE CALENDAR SYNC
    // ------------------------------------------------------------------------

    const GOOGLE_SYNC_FEATURE = false; 
    const GOOGLE_CLIENT_ID = '';
    const GOOGLE_CLIENT_SECRET = '';
}
