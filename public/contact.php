<?php
// Contact / lead form handler for loopstech.com (POST only).
// Sends the inquiry to info@loopstech.com. Returns JSON when the page asks for it,
// otherwise redirects back to the form so the no-JavaScript path also works.

const TO = 'info@loopstech.com';
const FROM = 'no-reply@loopstech.com';

function respond(bool $ok, int $status = 200): void {
    $wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;
    if ($wantsJson) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok]);
    } else {
        $lang = ($_POST['lang'] ?? 'en') === 'ar' ? '/ar' : '';
        header('Location: ' . $lang . '/contact/?' . ($ok ? 'sent=1' : 'error=1'), true, 303);
    }
    exit;
}

function clean(string $v, int $max): string {
    $v = trim(preg_replace('/[\r\n]+/', ' ', $v)); // strip line breaks: blocks header injection
    return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit;
}

// Honeypot: real visitors never fill this in. Pretend success to bots.
if (!empty($_POST['website'])) {
    respond(true);
}

$name = clean($_POST['name'] ?? '', 120);
$email = clean($_POST['email'] ?? '', 160);
$company = clean($_POST['company'] ?? '', 160);
$phone = clean($_POST['phone'] ?? '', 40);
$service = clean($_POST['service'] ?? '', 160);
$source = clean($_POST['source'] ?? 'contact', 40);
$message = mb_substr(trim($_POST['message'] ?? ''), 0, 4000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 422);
}

$lines = [
    "Name: $name",
    "Email: $email",
    $company !== '' ? "Company: $company" : null,
    $phone !== '' ? "Phone: $phone" : null,
    "Interest: $service",
    "Form: $source (" . ($_POST['lang'] ?? 'en') . ')',
    '',
    $message,
];
$body = implode("\n", array_filter($lines, fn($l) => $l !== null));

$headers = [
    'From: Loops Technologies <' . FROM . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];
$subject = '=?UTF-8?B?' . base64_encode("Website inquiry ($source): $name") . '?=';

respond(mail(TO, $subject, $body, implode("\r\n", $headers)), 200);
