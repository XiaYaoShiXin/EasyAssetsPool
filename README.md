# EasyAssetsPool
Simple Async Assets Pool

试着用nodejs做爬虫时需要用到代理池，顺便写了一个简单好用的通用资源池

用法举例：
const Pool = require("./AssetsPool");
let proxyA = 1;
let proxyB = 2;
Pool.init("Proxy",{},[proxyA,proxyB]);
async function test(){
  let proxy = await Pool.fetch("Proxy");
  Pool.log("Proxy");
  console.log("fetch:"+proxy);
  setTimeout(()=>{
    console.log("release:"+proxy);
    Pool.log("Proxy");
    Pool.release(proxy);
  },1000);
}
test();
test();
test();
