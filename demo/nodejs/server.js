const express = require('express');
const app = express();
const GrpcClient= require('./src/client/grpc')
const grpcClient = new GrpcClient({hostname:'54.236.37.243',port:'50051'})
const {getHashByRawData,generateBlockId} = require("./src/utils/crypto.js");

app.get('/', function (req, res) {
    //getNodes();
    //transferAccount();
    getBlockByNumber(100)
    //GetTransactionInfoById('4963fec4faf08e03229bf83de4cd94cccb6957fa2085f88ea54fb4933e9bb686')
    res.send('Grpc api test!');
});


//获取block number
function GetTransactionInfoById(msg) {
    const data = grpcClient.GetTransactionInfoById(msg);
    data.then((result)=>{
        console.log(result);
        console.log(getHashByRawData(result));
        console.log('success');
    }).catch((msg)=>{
        console.log('error',msg);
    })
}

//获取block number
function getBlockByNumber(msg) {
    const data = grpcClient.getBlockByNumber(msg);
    data.then((result)=>{
        //console.log(result['wrappers_']['2']['wrappers_']);
        console.log(result.getBlockHeader().getRawData().getNumber());
        console.log('success');
    }).catch((msg)=>{
        console.log('error',msg);
    })
}
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