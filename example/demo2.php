<?php
// 这个demo示例如何通过PHP动态加载vConsole
// (1)访问 demo2.php 时（一般情况），不加载vConsole
// (2)访问 demo2.php?dev_mode=1 时（调试模式），加载vConsole

$dev_mode = isset($_GET['dev_mode']) ? $_GET['dev_mode'] : '0';
?><!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>vConsole/Demo2</title>
  <link href="./lib/weui.min.css" rel="stylesheet"/>
  <link href="./lib/demo.css" rel="stylesheet"/>
  
  <script src="./lib/zepto.min.js"></script>
  <script src="./lib/zepto.touch.min.js"></script>

  <?php if ($dev_mode == '1') { ?>
    <!-- 引入vConsole的JS库 -->
    <script src="../dist/vconsole.min.js"></script>
    <script>
      // 初始化vConsole
      window.vConsole = new window.VConsole();
    </script>
  <?php } ?>
</head>

<body ontouchstart>
  <div class="page">
    <h1 class="page_title">Demo 2</h1>
    <a href="javascript:;" class="weui_btn weui_btn_primary js_btn_log">Hello World</a>
  </div>
  <div class="weui_toptips weui_notice" id="js_tips">已打印log</div>
</body>

<script>
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