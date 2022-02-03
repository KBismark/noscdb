var net = require("net");
const {
    get_del_update_D_data,
    delAllRows,
    del_get_exist_row,
    create_update_row,
    createDTable,
    createTable,
    createDatabase,
    dbInstance,
    tbInstance,
    d_tbInstance,
    tbRows,
    d_tbRows,
    getAllRows,
    _wToDStorage,
    readFromDT
} = require(__dirname+"/middleware.js");
var server=net.createServer();
var unendedData = {},splitter='%$n&%';
var house = { clients:null};
var TIMEOUTS=[];
var TIMEOUTS_id=[];
/**
 * Does something after sometime and makes sure before the current process exists, all pending timeouts are cleared.
 * @param {(args:[])} callback Timeout callback will be passed `argsArr` provided or undefined if not provided.
 * @param {*} time_in_ms Time to timeout in milliseconds.
 * @param {*} argsArr Argument can be anything needed to be passed to the callback on time out.
 */
function SetTimeOut(callback,time_in_ms,argsArr,id){
    var n=TIMEOUTS.length;
    TIMEOUTS.push(setTimeout(function(a){
        TIMEOUTS.splice(n,1);
        TIMEOUTS_id.splice(n,1);
        callback(a);
    },time_in_ms,argsArr));

    TIMEOUTS_id.push(id);
};
function preclearTimeouts(id){
    var x=TIMEOUTS_id.indexOf(id);
    if(x>=0){
        clearTimeout(TIMEOUTS[x]);
        TIMEOUTS.splice(x,1);
        TIMEOUTS_id.splice(x,1);
        return 1;
    }else{
        return 0;
    }
};
process.on('exit',function(c){
    var i;
    for(i in TIMEOUTS){
        clearTimeout(TIMEOUTS[i]);
    }
    TIMEOUTS=[];
    TIMEOUTS_id=[];
});
function perf(socket,id,arr){
    var i;
    for(i in arr){
        if(arr[i].endsWith("}")){
            try {
                arr[i]=JSON.parse(arr[i]);
            } catch (error) {
                arr[i]=null;
            }
            arr[i]?serve(socket,arr[i]):1;
        }else if(arr[i].length>0){
            unendedData[id] = arr[i];
        }
    }
    socket = null;
};
function Write(){
    var writeStorage=[];
    var drained = true;
    return {
        write:function(data){
            if(drained){
                if(writeStorage.length>0){
                   try {
                        data = `${writeStorage.join('')}${data}`;
                        writeStorage=[];
                   } catch (error) {
                        writeStorage.push(data);
                        data = writeStorage.shift();
                   }
                }
                drained = this.socket.write(data,()=>{
                    if(writeStorage.length>0){
                        this.write(writeStorage.pop());
                    }
                    drained=true;
                });
            }else{
                writeStorage.push(data);
            }
        }
    };
};
function serve(socket,data){
    //if(data.e==1){
        switch (data.op) {
            case "dbInst":
                socket.write(`${JSON.stringify({i:dbInstance(),id:data.id})}${splitter}`);
                break;
            case "createDB":
                createDatabase(data.db,function(err){
                    if(!err){
                        socket.write(`${JSON.stringify({er:null,i:dbInstance()[data.db],e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:err,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "createDT":
                createDTable(data.db,data.d.tb,data.d.col,data.d.scol,function(err){
                    if(!err){
                        socket.write(`${JSON.stringify({er:null,i:d_tbInstance(data.db),e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:err,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "createT":
                createTable(data.db,data.d.tb,data.d.col,function(err){
                    if(!err){
                        socket.write(`${JSON.stringify({er:null,i:tbInstance(data.db),e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:err,e:1,id:data.id})}${splitter}`);
                })
                break;
            case "createR":
                create_update_row(data.db,data.d.tb,data.d.id,data.d.col,"createRow",function(crt){
                    if(crt){
                        socket.write(`${JSON.stringify({er:null,i:tbRows(data.db,data.d.tb),e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:true,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "createDR":
                create_update_row(data.db,data.d.tb,data.d.id,data.d.col,"createDispersedRow",function(crt){
                    if(crt){
                        socket.write(`${JSON.stringify({er:null,i:d_tbRows(data.db,data.d.tb),e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:true,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "updateR":
                create_update_row(data.db,data.d.tb,data.d.id,data.d.col,"updateRow",function(crt){
                    if(crt){
                        socket.write(`${JSON.stringify({u:true,e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "updateDR":
                create_update_row(data.db,data.d.tb,data.d.id,data.d.col,"updateDispersedRow",function(crt){
                    if(crt){
                        socket.write(`${JSON.stringify({u:true,e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "getR":
                del_get_exist_row(data.db,data.d.tb,data.d.id,"getRow",function(Data){
                    if(Data){
                        var Returns = false,er=null;
                        if(typeof (data.d.ret)==="string"){
                            try {
                                data.d.ret = new Function(`return ${data.d.ret}`);
                                data.d.ret = data.d.ret();
                                Returns = true;
                            } catch (error) {
                                er={message:"Found errors in return function",code:"FUNC_ERR"};
                                Data=null;
                                Returns = false;
                            }
                            if(Returns){
                                try {
                                    Data=data.d.ret(Data);
                                } catch (error) {
                                    er={message:"Found errors in return function",code:"FUNC_ERR"};
                                    Data=null;
                                }
                            }
                        }
                        socket.write(`${JSON.stringify({er:er,e:1,id:data.id,d:Data})}${splitter}`);
                        Data = null;
                    }else{
                        socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:null})}${splitter}`);
                    }  
                });
                break;
            case "gupdateR":
                del_get_exist_row(data.db,data.d.tb,data.d.id,"getRow",function(Data){
                    if(Data){
                        try {
                            Data = new Function(`return ${data.d.col}`)()(Data);
                            Data.$time=null;
                            delete Data.$time;
                            Data.$id=null;
                            delete Data.$id;
                        } catch (error) {
                            socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                            return;
                        }
                        create_update_row(data.db,data.d.tb,data.d.id,Data,"updateRow",function(crt){
                            if(crt){
                                socket.write(`${JSON.stringify({u:true,e:1,id:data.id})}${splitter}`);
                                return;
                            }
                            socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                        });
                    }else{
                        socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                    }  
                });
                break;
            case "gupdateDR":
            del_get_exist_row(data.db,data.d.tb,data.d.id,"getDispersedRow",function(Data){
                if(Data){
                    try {
                        Data = new Function(`return ${data.d.col}`)()(Data);
                        Data.$time=null;
                        delete Data.$time;
                        Data.$id=null;
                        delete Data.$id;
                    } catch (error) {
                        socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                        return;
                    }
                    create_update_row(data.db,data.d.tb,data.d.id,Data,"updateDispersedRow",function(crt){
                        if(crt){
                            socket.write(`${JSON.stringify({u:true,e:1,id:data.id})}${splitter}`);
                            return;
                        }
                        socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                    });
                }else{
                    socket.write(`${JSON.stringify({u:false,e:1,id:data.id})}${splitter}`);
                }  
            });
            break;
            case "getDR":
                del_get_exist_row(data.db,data.d.tb,data.d.id,"getDispersedRow",function(Data){
                    if(Data){
                        var Returns = false,er=null;
                        if(typeof (data.d.ret)==="string"){
                            try {
                                data.d.ret = new Function(`return ${data.d.ret}`);
                                data.d.ret = data.d.ret();
                                Returns = true;
                            } catch (error) {
                                er={message:"Found errors in return function",code:"FUNC_ERR"};
                                Returns = false;
                                Data=null;
                            }
                            if(Returns){
                                try {
                                    Data=data.d.ret(Data);
                                } catch (error) {
                                    er={message:"Found errors in return function",code:"FUNC_ERR"};
                                    Data=null;
                                }
                            }
                        }
                        socket.write(`${JSON.stringify({er:er,e:1,id:data.id,d:Data})}${splitter}`);
                        Data = null;
                    }else{
                        socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:null})}${splitter}`);
                    }
                });
                break;
            case "delR":
                del_get_exist_row(data.db,data.d.tb,data.d.id,"delRow",function(del){
                    if(del){
                        socket.write(`${JSON.stringify({er:null,e:1,d:del,id:data.id,i:tbRows(data.db,data.d.tb)})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:null,d:del,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "delDR":
                del_get_exist_row(data.db,data.d.tb,data.d.id,"delDispersedRow",function(del){
                    if(del){
                        socket.write(`${JSON.stringify({er:null,e:1,d:del,id:data.id,i:d_tbRows(data.db,data.d.tb)})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:null,d:del,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "rowEx":
                del_get_exist_row(data.db,data.d.tb,data.d.id,"rowExists",function(ex){
                    socket.write(`${JSON.stringify({er:null,e:1,id:data.id,x:ex})}${splitter}`);
                });
                break;
            case "d_rowEx":
                del_get_exist_row(data.db,data.d.tb,data.d.id,"dispersedRowExists",function(ex){
                    socket.write(`${JSON.stringify({er:null,e:1,id:data.id,x:ex})}${splitter}`);
                });
                break;
            case "delA_R":
                delAllRows(data.db,data.d.tb,"delTable",function(del){
                    if(del){
                        socket.write(`${JSON.stringify({er:null,e:1,d:del,id:data.id,i:tbRows(data.db,data.d.tb)})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:null,d:del,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "delA_DR":
                delAllRows(data.db,data.d.tb,"delDispersedTable",function(del){
                    if(del){
                        socket.write(`${JSON.stringify({er:null,e:1,d:del,id:data.id,i:d_tbRows(data.db,data.d.tb)})}${splitter}`);
                        return;
                    }
                    socket.write(`${JSON.stringify({er:null,d:del,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "getA_R":
                getAllRows(data.db,data.d.tb,"getAllRows",data.d.con,function(rData,dataRead){
                    socket.write(`${JSON.stringify({er:null,e:0,id:data.id,d:rData,dr:dataRead})}${splitter}`);
                    rData = null;
                },function(dataRead){
                    socket.write(`${JSON.stringify({e:1,id:data.id,dr:dataRead})}${splitter}`);
                });
                break;
            case "getA_DR":
                getAllRows(data.db,data.d.tb,"getAllDispersedRows",data.d.con,function(rData,dataRead){
                    socket.write(`${JSON.stringify({er:null,e:0,id:data.id,d:rData,dr:dataRead})}${splitter}`);
                    rData = null;
                },function(dataRead){
                    socket.write(`${JSON.stringify({e:1,id:data.id,dr:dataRead})}${splitter}`);
                });
                break;
            case "wToDS":
                _wToDStorage(data.db,data.d.tb,data.d.id,data.d.s_col,data.d.d,function(id){
                    socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:id})}${splitter}`);
                });
                break;
            case "gD_Data":
                get_del_update_D_data(data.db,data.d,"getDispersedStorageData",function(gData){
                    if(typeof (data.ret)==="string"){
                        try {
                            gData=new Function(`return ${data.ret};`)()(gData);
                        } catch (error) {}
                    }
                    socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:gData})}${splitter}`);
                    gData=null;
                });
                break;
            case "dD_Data":
                get_del_update_D_data(data.db,data.d,"delDispersedStorageData",function(del){
                    socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:del})}${splitter}`);
                });
                break;
            case "uD_Data":
                get_del_update_D_data(data.db,data.d,"updateDispersedStorageData",function(up){
                    socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:up})}${splitter}`);
                });
                break;
            case "guD_Data":
                var ID=data.d.id;
                get_del_update_D_data(data.db,data.d,"getDispersedStorageData",function(gData){
                    var ret=false;
                    try {
                        data.d.data= new Function(`return ${data.d.data};`)()(gData.data);
                        ret=true;
                    } catch (error) {
                        ret=false;
                    }
                    gData=null;
                    if(ret){
                        data.d.id=ID;
                        get_del_update_D_data(data.db,data.d,"updateDispersedStorageData",function(up){
                            socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:up})}${splitter}`);
                        });
                    }else{
                        socket.write(`${JSON.stringify({er:null,e:1,id:data.id,d:false})}${splitter}`);
                    }
                });
                break;
            case "rFromDS": 
                readFromDT(data.db,data.d.tb,data.d.s_col,data.d.id,data.d.con,function(rData){
                    socket.write(`${JSON.stringify({er:null,e:0,id:data.id,d:rData})}${splitter}`);
                    rData = null;
                },function(dr,ldrdate){
                    socket.write(`${JSON.stringify({er:null,e:1,id:data.id,dr:dr,ldrd:ldrdate})}${splitter}`);
                },function(err){
                    socket.write(`${JSON.stringify({er:err,e:1,id:data.id})}${splitter}`);
                });
                break;
            case "timeout":
                var stop=data.ms.s;
                SetTimeOut(function(args){
                    if(stop&&socket.destroyed){
                    }else{
                        serve(socket,args);
                    }
                },data.ms.t,data.d,data.t_id);
                break;
            case "c_timeout":
                socket.write(`${JSON.stringify({er:null,e:1,id:data.id,r:preclearTimeouts(data.t_id)})}${splitter}`);
                break;
            default:
                break;
        }
    //}
}
server.on("connection",(socket)=>{
    socket.allowHalfOpen=true;
    var socketId=socket.address().address;
if(!house.clients.includes(socketId)){socket.end();socket.destroy()}
else{
    var Writter=Write();
    Writter.socket= socket;
    unendedData[socketId]="";
    socket.on("data",(data)=>{
        data = unendedData[socketId]+data.toString();
        perf(Writter,socketId,data.split(splitter));
        data = null;
    });
    socket.on("error",(e)=>{
        if(e.code==="ECONNRESET"){
            unendedData[socketId]="";
        }
    });
}
});
module.exports = {
    server:server,
    clients:house,
    /**
     * 
     * @param {string} splitter 5 or more character sequence that is used to differentiate requests. Defaut is `%$n&%`.
     * 
     * Use this same splitter on NoscDB-client to prevent errors. All requests including this same character sequence will 
     * cause unexpected results and errors. Thus, it is safe to check your values for unsafe characters. 
     * 
     * This happens because, a lot of requests may be sent at the same time and NoscDB relies on the splitter to know each 
     * separate request.
     * 
     * It is ***`recommended`*** to include charaters that users of your application rarely use like those that are not easily
     * accessible on keyboards.
     * 
     * @example
     * 
     *  // When creating or updating rows or when writing to dispersed storage.
     *  // Do something like this to check your argument values.
     *  if(noscdb.isSafe(value)){
     *      // Go on 
     *  }else{
     *      // Do something about the value 
     *  }
     * 
     */
    splitter:function(Splitter){
        if(typeof (Splitter)==="string"&&Splitter.length>4){
            splitter=Splitter;
            return true;
        }else{
            return false;
        }
    }
}
