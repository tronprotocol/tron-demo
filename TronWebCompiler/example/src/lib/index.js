import browserSolc from 'browser-solc-tron';
const getCompiler = function(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            window.BrowserSolc.loadSolcJson('',(compiler)=>{
                if(compiler){
                    resolve(compiler.compile)
                }else{
                    reject('it is an error')
                }
            })

        })

    })
}

export default getCompiler;
