<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../appointments/vendor/autoload.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Get form data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$subject_type = $_POST['subject'] ?? 'General Inquiry';
$message_body = $_POST['message'] ?? '';

if (empty($name) || empty($email) || empty($message_body)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.office365.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'noreply@rlcadvocates.co.ke';
    $mail->Password   = 'K.953614961451uf';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Recipients
    $mail->setFrom('noreply@rlcadvocates.co.ke', 'RLC Advocates Contact Form');
    $mail->addAddress('noreply@rlcadvocates.co.ke');
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = "New Inquiry: " . $subject_type . " from " . $name;
    
    // HTML Email Template
    $mail->Body = "
    <!DOCTYPE html>
    <html>
    <head>
        <link href='https://fonts.cdnfonts.com/css/satoshi' rel='stylesheet'>
        <style>
            body { font-family: 'Satoshi', 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #0d1e1e; margin: 0; padding: 0; background-color: #f6f7f7; }
            .wrapper { width: 100%; background-color: #f6f7f7; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: #ffffff; padding: 30px; border-bottom: 4px solid #FD641F; text-align: left; }
            .content { padding: 40px; }
            .footer { background-color: #0d1e1e; color: #ffffff; padding: 30px; text-align: center; font-size: 12px; }
            .label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0047AB; margin-bottom: 4px; }
            .value { font-size: 16px; margin-bottom: 24px; color: #0d1e1e; font-weight: 500; }
            .message-box { background-color: #f9fafb; border-radius: 8px; padding: 20px; border-left: 4px solid #0047AB; font-style: italic; }
            .logo { height: 40px; }
            h1 { font-size: 24px; font-weight: 900; margin: 0 0 10px 0; color: #0d1e1e; }
        </style>
    </head>
    <body>
        <div class='wrapper'>
            <div class='container'>
                <div class='header'>
                    <img src='https://rlcadvocates.co.ke/Images/rlc-small-logo.png' alt='RLC Advocates' class='logo'>
                </div>
                <div class='content'>
                    <h1>New Website Inquiry</h1>
                    <p style='color: #666; margin-bottom: 30px;'>You have received a new message from the contact form on your website.</p>
                    
                    <div class='label'>Sender Name</div>
                    <div class='value'>{$name}</div>
                    
                    <div class='label'>Email Address</div>
                    <div class='value'>{$email}</div>
                    
                    <div class='label'>Inquiry Type</div>
                    <div class='value'>{$subject_type}</div>
                    
                    <div class='label'>Message Content</div>
                    <div class='message-box'>
                        " . nl2br(htmlspecialchars($message_body)) . "
                    </div>
                </div>
                <div class='footer'>
                    <p>&copy; " . date('Y') . " RLC Advocates. All rights reserved.</p>
                    <p>Blueshield Towers, 5th Floor Hospital Rd, Nairobi, Kenya</p>
                    <p><a href='https://rlcadvocates.co.ke' style='color: #FD641F; text-decoration: none;'>www.rlcadvocates.co.ke</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $mail->AltBody = "New Inquiry from: {$name}\nEmail: {$email}\nSubject: {$subject_type}\n\nMessage:\n{$message_body}";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Thank you for your message. An advocate will contact you shortly.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
