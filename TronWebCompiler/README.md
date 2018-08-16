# tronwebcompiler

tron solidity compiler

## Installation

`npm install --save tronwebcompiler`

## Usage:
```
import getCompiler from tronwebcompiler

let test = async function(){
    let compile = await getCompiler();
    let resource = '
    contract Ballot {
                        
                        function test(int32 num1, int32 num2)  constant returns (int32) {
                           
                                return num1*num2;
                           } 
                    }'
    
                    
    
}

let optimize = 1;
let result = compile(source, optimize);
let arrContract = [];
let arrByteCode = [];
let arrAbi = [];
for(var name in result.contracts){
    arrContract.push(name);
    if(result.contracts[name].bytecode){
        bytecode = result.contracts[name].bytecode;
        arrByteCode.push(bytecode);
        var metadata = JSON.parse(result.contracts[name].metadata);
        abi = JSON.stringify(metadata.output.abi);
        arrAbi.push(abi);
    }
}



```


