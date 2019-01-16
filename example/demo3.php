<?php
// 这个demo用于测试CSP的规则
$nonce = rand(10000, 99999);
header("Content-Security-Policy: script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-" . $nonce . "';");
?><!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>vConsole/Demo3</title>
  <link href="./lib/weui.min.css" rel="stylesheet"/>
  <link href="./lib/demo.css" rel="stylesheet"/>
  
  <!-- <script src="./lib/zepto.min.js" nonce="<?php echo $nonce; ?>"></script>
  <script src="./lib/zepto.touch.min.js" nonce="<?php echo $nonce; ?>"></script> -->

  <!-- 引入vConsole的JS库 -->
  <script src="../dist/vconsole.min.js" nonce="<?php echo $nonce; ?>"></script>
  <script nonce="<?php echo $nonce; ?>">
    // 初始化vConsole
    window.vConsole = new window.VConsole();
  </script>
</head>

<body>
  <div class="page">
    <h1 class="page_title">Demo 3</h1>
    <a href="javascript:;" class="weui_btn weui_btn_primary js_btn_log">Hello World</a>
  </div>
  <div class="weui_toptips weui_notice" id="js_tips">已打印log</div>
</body>

<script nonce="<?php echo $nonce; ?>">
$('.js_btn_log').on('tap', function(e) {
  // 打印log时无须判断是否为dev_mode，
  // 未加载vConsole时，console.log()不会显示到前台
  console.log('Hello World');
  showTips();
});

// 用于页面内展示顶部tips
var tipsTimer;
function showTips() {
  tipsTimer && clearTimeout(tipsTimer);
  $('#js_tips').show();
  tipsTimer = setTimeout(function() {
    $('#js_tips').hide();
  }, 1500);
}
</script>
</html>