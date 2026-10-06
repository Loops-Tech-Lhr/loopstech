<?php
// Contact / lead form handler for loopstech.com (POST only). PHP 5.6+ compatible.
//
// 1. Every valid inquiry is first saved to ../leads/leads-YYYY-MM.jsonl (outside the web root),
//    so nothing is lost even if email is down.
// 2. It is then emailed to CONTACT_TO:
//    - via SMTP if ../contact-config.php exists (see docs/contact-config.sample.php), or
//    - via PHP mail() otherwise (some hosts disable it, e.g. Hostinger; the lead is still saved).
// The page gets {"ok":true} when the inquiry was saved or sent. JSON for the JS form, redirect for no-JS.

define('CONTACT_TO', 'info@loopstech.com');
define('CONTACT_FROM', 'info@loopstech.com');

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

function save_lead($data)
{
    $dir = dirname(__DIR__) . '/leads';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return false;
    }
    $line = json_encode($data) . "\n";
    return @file_put_contents($dir . '/leads-' . date('Y-m') . '.jsonl', $line, FILE_APPEND | LOCK_EX) !== false;
}

// Minimal SMTP client (implicit TLS on 465 or STARTTLS-less plain on others is not supported on purpose).
function smtp_send($cfg, $to, $subject, $body, $replyTo)
{
    $host = $cfg['host'];
    $port = isset($cfg['port']) ? (int) $cfg['port'] : 465;
    $fp = @stream_socket_client('ssl://' . $host . ':' . $port, $errno, $errstr, 12);
    if (!$fp) {
        return false;
    }
    stream_set_timeout($fp, 12);
    $read = function () use ($fp) {
        $out = '';
        while (($l = fgets($fp, 515)) !== false) {
            $out .= $l;
            if (strlen($l) < 4 || $l[3] === ' ') {
                break;
            }
        }
        return $out;
    };
    $cmd = function ($c, $expect) use ($fp, $read) {
        fwrite($fp, $c . "\r\n");
        $r = $read();
        return strpos($r, (string) $expect) === 0;
    };
    $read();
    $ok = $cmd('EHLO loopstech.com', 250)
        && $cmd('AUTH LOGIN', 334)
        && $cmd(base64_encode($cfg['user']), 334)
        && $cmd(base64_encode($cfg['pass']), 235)
        && $cmd('MAIL FROM:<' . $cfg['user'] . '>', 250)
        && $cmd('RCPT TO:<' . $to . '>', 250)
        && $cmd('DATA', 354);
    if ($ok) {
        $msg = 'From: Loops Technologies <' . $cfg['user'] . ">\r\n"
            . 'To: <' . $to . ">\r\n"
            . 'Reply-To: ' . $replyTo . "\r\n"
            . 'Subject: ' . $subject . "\r\n"
            . 'Date: ' . date('r') . "\r\n"
            . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($body));
        fwrite($fp, $msg . "\r\n.\r\n");
        $ok = strpos($read(), '250') === 0;
    }
    @fwrite($fp, "QUIT\r\n");
    fclose($fp);
    return $ok;
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

$saved = save_lead(array(
    'time' => date('c'),
    'ip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '',
    'source' => $source,
    'lang' => $lang,
    'name' => $name,
    'email' => $email,
    'company' => $company,
    'phone' => $phone,
    'interest' => $service,
    'message' => $message,
));

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
$subject = '=?UTF-8?B?' . base64_encode("Website inquiry ($source): $name") . '?=';

$sent = false;
$cfgFile = dirname(__DIR__) . '/contact-config.php';
if (is_file($cfgFile)) {
    $cfg = include $cfgFile;
    if (is_array($cfg) && !empty($cfg['host']) && !empty($cfg['user']) && !empty($cfg['pass'])) {
        $sent = smtp_send($cfg, CONTACT_TO, $subject, $body, $email);
    }
}
if (!$sent) {
    $headers = implode("\r\n", array(
        'From: Loops Technologies <' . CONTACT_FROM . '>',
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=UTF-8',
    ));
    $sent = @mail(CONTACT_TO, $subject, $body, $headers);
}

respond($saved || $sent, 200);
