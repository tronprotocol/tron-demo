# 安装
npm install
* nodejs 版本 v8.11.3

# 运行
node server.js 打开localhost:3005 进行接口测试

#说明

* 引用 grpc 并实例化

```
    const GrpcClient= require('./src/client/grpc')
    const grpcClient = new GrpcClient({hostname:'192.168.1.102',port:'50051'})
    
    
```
* 在页面加载时进行调用并在Nodejs 控制台查看接口输出
```
    app.get('/', function (req, res) {
        //getNodes();
        transferAccount();
        res.send('Grpc api test!');
    });
```

* 其它方法在 src >client> grpc.js中，需要添加可以仿照着继续写
* grpc 端口号地址参考：https://github.com/tronprotocol/Documentation/blob/master/TRX/Official_Public_Node.md
      
* 后端rpc文档参考：
https://github.com/tronprotocol/protocol/tree/master/api
