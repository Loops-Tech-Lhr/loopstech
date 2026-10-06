<?php
// Contact / lead form handler for loopstech.com (POST only).
// Works on PHP 5.6+ shared hosting (cPanel). Uses mail(); mbstring is optional.
// Sends the inquiry to info@loopstech.com. Returns JSON when the page asks for it,
// otherwise redirects back to the form so the no-JavaScript path also works.

define('CONTACT_TO', 'info@loopstech.com');
define('CONTACT_FROM', 'no-reply@loopstech.com');

function cut($v, $max)
{
    return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}

function respond($ok, $status = 200)
{
    $accept = isset($_SERVER['HTTP_ACCEPT']) ? $_SERVER['HTTP_ACCEPT'] : '';
    if (strpos($accept, 'application/json') !== false) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array('ok' => (bool) $ok));
    } else {
        $lang = (isset($_POST['lang']) && $_POST['lang'] === 'ar') ? '/ar' : '';
        header('Location: ' . $lang . '/contact/?' . ($ok ? 'sent=1' : 'error=1'), true, 303);
    }
    exit;
}

function clean($v, $max)
{
    // strip line breaks: blocks mail header injection
    return cut(trim(preg_replace('/[\r\n]+/', ' ', (string) $v)), $max);
}

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit;
}

// Honeypot: real visitors never fill this in. Pretend success to bots.
if (!empty($_POST['website'])) {
    respond(true);
}

$name = clean(isset($_POST['name']) ? $_POST['name'] : '', 120);
$email = clean(isset($_POST['email']) ? $_POST['email'] : '', 160);
$company = clean(isset($_POST['company']) ? $_POST['company'] : '', 160);
$phone = clean(isset($_POST['phone']) ? $_POST['phone'] : '', 40);
$service = clean(isset($_POST['service']) ? $_POST['service'] : '', 160);
$source = clean(isset($_POST['source']) ? $_POST['source'] : 'contact', 40);
$lang = (isset($_POST['lang']) && $_POST['lang'] === 'ar') ? 'ar' : 'en';
$message = cut(trim(isset($_POST['message']) ? (string) $_POST['message'] : ''), 4000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 422);
}

$lines = array("Name: $name", "Email: $email");
if ($company !== '') {
    $lines[] = "Company: $company";
}
if ($phone !== '') {
    $lines[] = "Phone: $phone";
}
$lines[] = "Interest: $service";
$lines[] = "Form: $source ($lang)";
$lines[] = '';
$lines[] = $message;
$body = implode("\n", $lines);

$headers = implode("\r\n", array(
    'From: Loops Technologies <' . CONTACT_FROM . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
));
$subject = '=?UTF-8?B?' . base64_encode("Website inquiry ($source): $name") . '?=';

respond(mail(CONTACT_TO, $subject, $body, $headers), 200);
