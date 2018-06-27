const express = require('express');
const app = express();
const GrpcClient= require('./src/client/grpc')
const grpcClient = new GrpcClient({hostname:'192.168.1.102',port:'50051'})
app.get('/', function (req, res) {
    //getNodes();
    transferAccount();
    res.send('Grpc api test!');
});
//获取节点
function getNodes() {
    const data = grpcClient.getNodes();
    data.then((result)=>{
        console.log(result);
        console.log('success');
    }).catch((msg)=>{
        console.log('error',msg);
    })
}
//转账
function transferAccount(){
    const data = grpcClient.transferAccount()
    data.then((result)=>{
        console.log('result::',result);
        console.log('success');
    }).catch((msg)=>{
        console.log('error',msg);
    })

}

const server = app.listen(3005,()=>{
    const host = server.address().address;
    const port = server.address().port;
    console.log('app listening at http://%s:%s',host,port);
})