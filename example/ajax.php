<?php
header('Content-Type: application/json; charset=utf-8');
$data = array('msg' => '收到一个AJAX回包，可在[Network]中查看');
echo json_encode($data);