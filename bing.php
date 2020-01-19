<?php
/**
*Bing图片获取
*/
$str = file_get_contents('https://cn.bing.com/HPImageArchive.aspx?idx=0&n=1'); 
if(preg_match("/<url>(.+?)<\/url>/ies",$str,$matches)){
    $imgurl='https://cn.bing.com'.$matches[1];
}else{
    $imgurl='https://simstatic.plopco.com/bgimg/000039.jpg'; 
}
header("Location: $imgurl");
?>