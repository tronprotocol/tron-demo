const express = require('express');
const app = express();
const GrpcClient= require('./src/client/grpc')
const grpcClient = new GrpcClient({hostname:'54.236.37.243',port:'50051'})
const {getHashByRawData,generateBlockId,SHA256} = require("./src/utils/crypto.js");

app.get('/', function (req, res) {
    //getNodes();
    //transferAccount();
    getBlockByNumber(116714)
    //GetTransactionInfoById('9581e0f3a3a5adbf9493d405ee0dfb188745204d5c8b1cd62d18e31e781461a3')
    res.send('Grpc api test!');
});


//获取block number
function GetTransactionInfoById(id) {
    const data = grpcClient.GetTransactionInfoById(id);
    data.then((result)=>{
        //根据rawData计算出 hash
        getHashByRawData(result);
        console.log('success');
    }).catch((msg)=>{
        console.log('error',msg);
    })
}

//获取block number
function getBlockByNumber(number) {
    const data = grpcClient.getBlockByNumber(number);
    data.then((result)=>{
        let number = result.getBlockHeader().getRawData().getNumber();
        let block_hash = SHA256(result.getBlockHeader().getRawData().serializeBinary());
        console.log('block_hash:',block_hash);
        generateBlockId(number,block_hash)
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