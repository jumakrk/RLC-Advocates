<?php defined('BASEPATH') or exit('No direct script access allowed');

// Add custom values by settings them to the $config array.
// Example: $config['smtp_host'] = 'smtp.gmail.com';
// @link https://codeigniter.com/user_guide/libraries/email.html

$config['useragent'] = 'Easy!Appointments';
$config['protocol'] = 'smtp'; 
$config['mailtype'] = 'html'; 
$config['smtp_host'] = Config::SMTP_HOST;
$config['smtp_user'] = Config::SMTP_USER;
$config['smtp_pass'] = Config::SMTP_PASS;
$config['smtp_port'] = Config::SMTP_PORT;
$config['smtp_crypto'] = Config::SMTP_CRYPTO;
$config['smtp_auth'] = true;       
$config['smtp_debug'] = 0;         
$config['charset'] = 'utf-8';
$config['wordwrap'] = TRUE;

// Deprecated or unused but kept for compatibility
// $config['from_name'] = '';
// $config['from_address'] = '';
// $config['reply_to'] = '';
$config['crlf'] = "\r\n";
$config['newline'] = "\r\n";
