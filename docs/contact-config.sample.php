<?php
// Copy this file to the server as  domains/loopstech.com/contact-config.php
// (one level ABOVE public_html, so it is never served and never overwritten by a deploy),
// then fill in the mailbox password. Never commit the real file.
//
// Titan email (Hostinger): host smtp.titan.email, port 465 (SSL).
return array(
    'host' => 'smtp.titan.email',
    'port' => 465,
    'user' => 'info@loopstech.com',
    'pass' => 'PUT-THE-MAILBOX-PASSWORD-HERE',
);
