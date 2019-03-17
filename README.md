# EasyAssetsPool
Simple Async Assets Pool

试着用nodejs做爬虫时需要用到代理池，顺便写了一个简单好用的通用资源池

用法举例：
```
const Pool = require("./AssetsPool");
let proxyA = 1;
let proxyB = 2;
Pool.init("Proxy", {}, [proxyA, proxyB]);
async function test() {
    console.log("fetch");
    let proxy = await Pool.fetch("Proxy");
    console.log("got:" + proxy);
    setTimeout(async() => {
        console.log("release:" + proxy);
        await Pool.release("Proxy", proxy);
    }, 1000);
}
async function go() {
    test();
    await test();
    test();
    test();
    await test();
    test();
}
go();
```
