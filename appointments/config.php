<?php
class Config
{
    // ------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------

    const BASE_URL = 'http://127.0.0.1:8000/appointments';
    const LANGUAGE = 'english';
    const DEBUG_MODE = false;

    // ------------------------------------------------------------------------
    // DATABASE SETTINGS
    // ------------------------------------------------------------------------

    const DB_HOST = 'localhost';
    const DB_NAME = 'easyappointments';
    const DB_USERNAME = 'root';
    const DB_PASSWORD = '';

    // ------------------------------------------------------------------------
    // EMAIL SETTINGS (SMTP)
    // ------------------------------------------------------------------------

    const SMTP_HOST = 'smtp.office365.com'; 
    const SMTP_USER = 'noreply@rlcadvocates.co.ke';
    const SMTP_PASS = 'K.953614961451uf';
    const SMTP_PORT = 587;
    const SMTP_CRYPTO = 'tls';

    // ------------------------------------------------------------------------
    // GOOGLE CALENDAR SYNC
    // ------------------------------------------------------------------------

    const GOOGLE_SYNC_FEATURE = false; // Enter TRUE or FALSE
    const GOOGLE_CLIENT_ID = '';
    const GOOGLE_CLIENT_SECRET = '';
}
