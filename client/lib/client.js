var net = require("net");
var CallBacks = {};
var CallBacksTrash = {};
var unendedData = {};
var Connections = {};
var NOSCDB = {};
var Splitter={};
const sym = Symbol();
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
function perf(arr,connectionid){
    var i;
    for(i in arr){
        if(arr[i].endsWith("}")){
            callCallback(JSON.parse(arr[i]),connectionid);
            arr[i]=null;
        }else if(arr[i].length>0){
            unendedData[connectionid] = arr[i];
        }
    }
    arr = null;
};
function callCallback(data,connectionid){
  typeof(CallBacks[connectionid].CallBacks[data.id])==="function"?
   CallBacks[connectionid].CallBacks[data.id](data):1;
    data=null;
};
/**
 * 
 * @param {net.NetConnectOpts} options 
 */
function connect(options,callback,db,reconnect,splt,onclosed){
    if(!Connections[`${options.host}@${options.port}`]){
        options=JSON.parse(JSON.stringify(options));
        var client = net.createConnection(options);
        splt = typeof (splt)==="string"&&splt.length>4?splt:"%$n&%"
        client.allowHalfOpen=true;
        client.on("connect",function(){
            Splitter[`${options.host}@${options.port}`]=splt;
            CallBacks[`${options.host}@${options.port}`]={
                CallBacks:[],
                CallBacksTrash:[]
            };
            NOSCDB[`${options.host}@${options.port}`]=1;
            unendedData[`${options.host}@${options.port}`]='';
            var l = callbackPosition(`${options.host}@${options.port}`);
            client.write(`${JSON.stringify({id:l,e:1,op:"dbInst"})}${Splitter[`${options.host}@${options.port}`]}`);
            
            CallBacks[`${options.host}@${options.port}`].CallBacks[l]=function(response){
                var W = Write();
                Connections[`${options.host}@${options.port}`] = {
                    dbs:response.i,socket:client,write:W.write,onclose:onclosed
                };
                client = null;
                CallBacks[`${options.host}@${options.port}`].CallBacks[l] = null;
                CallBacks[`${options.host}@${options.port}`].CallBacksTrash.push(l);
                response = null;
                db[sym] = `${options.host}@${options.port}`;
                if(!reconnect){
                    db.reconnect = function(cb){
                        if(Connections[this[sym]]){
                            onclosed=Connections[this[sym]].onclose;
                            Connections[this[sym]] = null;
                            delete Connections[this[sym]];
                        }
                        connect(options,cb,this,true,splt,onclosed);
                    };
                    db.onclose=function(cb){
                        if(typeof (cb)==="function"){
                            Connections[`${options.host}@${options.port}`].onclose=cb;
                        }
                    };
                    db.isSafe=function(value){
                        var safe=true;
                        try {
                            value=JSON.stringify(value);
                            if(value.includes(splt)){
                                safe=false;
                            }
                        } catch (error) {
                            safe=false;
                        }
                        return safe;
                    };
                    callback(null,db);
                    db=null;
                }else{
                    callback(null);
                }
            };
        });
        client.on("data",(data)=>{
            data = unendedData[`${options.host}@${options.port}`]+data.toString();
            perf(data.split(Splitter[`${options.host}@${options.port}`]),`${options.host}@${options.port}`);
            data=null;
        }).on("error",(e)=>{
            if(e.code==="ECONNRESET"){
                if(CallBacks[`${options.host}@${options.port}`]){
                    var i;
                    for(i=0;i<CallBacks[`${options.host}@${options.port}`].CallBacks.length;i++){
                        if(typeof (CallBacks[`${options.host}@${options.port}`].CallBacks[i])==="function"){
                            CallBacks[`${options.host}@${options.port}`].CallBacks[i](
                                {er:{code:'NOSCDB_CLOSED',path:`${options.host}@${options.port}`}}
                            );
                        }
                    }
                }
                NOSCDB[`${options.host}@${options.port}`]=0;
                unendedData[`${options.host}@${options.port}`]='';
                if(Connections[`${options.host}@${options.port}`].onclose){
                    Connections[`${options.host}@${options.port}`].onclose();
                }
                //throw e;
            }else if(e.code==='ECONNREFUSED'){
                callback({code:'NOSCDB_REFUSED',path:`${options.host}@${options.port}`});
            }
        })
    }else{
        options = null;
        db = null;
        callback({code:'NOSCDB_RECONNECTION',path:`${options.host}@${options.port}`});
    }
};

function callbackPosition(a){
    var i=CallBacks[a].CallBacks.length;
    if(CallBacks[a].CallBacksTrash.length>0){
        i = CallBacks[a].CallBacksTrash[0];
        CallBacks[a].CallBacksTrash.shift();
    }else{
        CallBacks[a].CallBacks.push(null);
    }
    return i;
};
/**
 * 
 * @param {string} db_name 
 * @param {(err:Error,created:boolean)} callback 
 */
function createDatabase(db_name,callback,This,timeout){
    This=!This?this:This;
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},false);
        return;
    }
    if(typeof(db_name) === "string"){
        if(!This.isSafe(db_name)){callback(ERRORS.UNSAFE);return}
        db_name = db_name.toLowerCase();
        if(/[^a-z0-9_]/.test(db_name)||db_name.length<=0){callback(ERRORS.WRONG_ARGS);return}
        if(!Connections[This[sym]].dbs[db_name]){
            var l = callbackPosition(This[sym]);
            if(!timeout){
                Connections[This[sym]].write(`${JSON.stringify({e:1,id:l,db:db_name,op:"createDB"})}${Splitter[This[sym]]}`);
            }else{
                timeout.e=1;
                timeout.op="timeout";
                timeout.d={e:1,id:l,db:db_name,op:"createDB"};
                Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
            }
           CallBacks[This[sym]].CallBacks[l]=function(response){
                if(!response.er){
                    Connections[This[sym]].dbs[db_name] = response.i;
                    CallBacks[This[sym]].CallBacks[l] = null;
                    CallBacks[This[sym]].CallBacksTrash.push(l);
                    response = null;
                    callback(null,true);
                    return;
                }
                CallBacks[l] = null;
                CallBacksTrash.push(l);
                callback(response.er);
                response = null;
            };
        }else{
            callback(ERRORS.DB_EXIST(db_name));
        }
    }else{
        callback(ERRORS.WRONG_ARGS);
    }
};
function createTable(db_name,tb_name,cols,callback,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},false);
        return;
    }
    if(string(db_name,tb_name)&&stringArr(cols)){
        cols = JSON.parse(JSON.stringify(cols).toLowerCase());
        db_name = db_name.toLowerCase();
        tb_name = tb_name.toLowerCase();
        if(Connections[This[sym]].dbs[db_name]){
           if(!Connections[This[sym]].dbs[db_name].TABLES[tb_name]){
                var l = callbackPosition(This[sym]);
                if(!timeout){
                    Connections[This[sym]].write(`${JSON.stringify({e:1,id:l,db:db_name,op:"createT",d:{tb:tb_name,col:cols}})}${Splitter[This[sym]]}`);
                }else{
                    timeout.e=1;
                    timeout.op="timeout";
                    timeout.d={e:1,id:l,db:db_name,op:"createT",d:{tb:tb_name,col:cols}};
                    Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                }
                CallBacks[This[sym]].CallBacks[l]=function(response){
                    if(!response.er){
                        Connections[This[sym]].dbs[db_name].TABLES = response.i;
                        CallBacks[This[sym]]. CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        response = null;
                        callback(null,true);
                        return;
                    }
                    CallBacks[This[sym]].CallBacks[l] = null;
                    CallBacks[This[sym]].CallBacksTrash.push(l);
                    callback(response.er);
                    response = null;
                };
           }else{
                callback(ERRORS.TB_EXIST(tb_name,db_name));
           }
        }else{
            callback(ERRORS.DB_NOT_EXIST(db_name));
        }
    }else{callback(ERRORS.WRONG_ARGS)}
};
function createDTable(db_name,tb_name,cols,s_cols,callback,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},false);
        return;
    }
    if(string(db_name,tb_name)&&stringArr(cols)&&stringArr(s_cols)){
        cols = JSON.parse(JSON.stringify(cols).toLowerCase());
        s_cols = JSON.parse(JSON.stringify(s_cols).toLowerCase());
        db_name = db_name.toLowerCase();
        tb_name = tb_name.toLowerCase();
        if(Connections[This[sym]].dbs[db_name]){
            if(!Connections[This[sym]].dbs[db_name].DISPERSEDTABLES[tb_name]){
                var l = callbackPosition(This[sym]);
                if(!timeout){
                    Connections[This[sym]].write(`${JSON.stringify({
                        e:1,id:l,db:db_name,op:"createDT",d:{tb:tb_name,col:cols,scol:s_cols}
                    })}${Splitter[This[sym]]}`);
                }else{
                    timeout.e=1;
                    timeout.op="timeout";
                    timeout.d={
                        e:1,id:l,db:db_name,op:"createDT",d:{tb:tb_name,col:cols,scol:s_cols}
                    };
                    Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                }
                CallBacks[This[sym]].CallBacks[l]=function(response){
                    if(!response.er){
                        Connections[This[sym]].dbs[db_name].DISPERSEDTABLES = response.i;
                        CallBacks[This[sym]].CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        response = null;
                        callback(null,true);
                        return;
                    }
                    CallBacks[This[sym]].CallBacks[l] = null;
                    CallBacks[This[sym]].CallBacksTrash.push(l);
                    callback(response.er);
                    response = null;
                };
            }else{
                callback(ERRORS.TB_EXIST(tb_name,db_name));
            }
        }else{
            callback(ERRORS.DB_NOT_EXIST(db_name));
        }
    }else{callback(ERRORS.WRONG_ARGS)}
};
function createRow(db_name,tb_name,id,cols_obj,callback,dispersed,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},NaN);
        return;
    }
    if(string(db_name,tb_name,id)){
        if(This.isSafe(id)&&This.isSafe(cols_obj)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                let tableType = dispersed?["DISPERSEDTABLES","createDR"]:["TABLES","createR"];
                if(Connections[This[sym]].dbs[db_name][tableType[0]][tb_name]){
                    var l = callbackPosition(This[sym]);
                    var i,o={};
                    for(i in Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns){
                        if(cols_obj[Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns[i]]){
                            o[Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns[i]] = 
                            cols_obj[Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns[i]];
                        }
                    }
                    cols_obj = null;
                    if(!timeout){
                        Connections[This[sym]].write(`${JSON.stringify({
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,col:o,id:id}
                        })}${Splitter[This[sym]]}`);
                    }else{
                        timeout.e=1;
                        timeout.op="timeout";
                        timeout.d={
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,col:o,id:id}
                        };
                        Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                    }
                    o=null;
                    CallBacks[This[sym]].CallBacks[l]=function(response){
                        if(!response.er){
                            Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].rows = response.i;
                            CallBacks[This[sym]].CallBacks[l] = null;
                            CallBacks[This[sym]].CallBacksTrash.push(l);
                            response = null;
                            callback(null,true);
                            return;
                        }
                        CallBacks[This[sym]].CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        callback(null,false);
                        response = null;
                    };
                }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name));}
            }else{
                callback(ERRORS.DB_NOT_EXIST(db_name));
            }
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function updateRow(db_name,tb_name,id,cols_obj,callback,dispersed,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},false);
        return;
    }
    if(string(db_name,tb_name,id)){
        if(This.isSafe(id)&&This.isSafe(cols_obj)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                let tableType = dispersed===1?["DISPERSEDTABLES","updateDR"]:dispersed===2?["TABLES","updateR"]:dispersed===3?["DISPERSEDTABLES","gupdateDR"]:["TABLES","gupdateR"];
                if(Connections[This[sym]].dbs[db_name][tableType[0]][tb_name]){
                    var l = callbackPosition(This[sym]),i,o={};
                    if(dispersed<3){
                        for(i in Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns){
                            if(cols_obj[Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns[i]]){
                                o[Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns[i]] = 
                                cols_obj[Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].columns[i]];
                            }
                        }
                    }else{
                        o=cols_obj;
                    }
                    cols_obj = null;
                    if(!timeout){
                        Connections[This[sym]].write(`${JSON.stringify({
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,col:o,id:id}
                        })}${Splitter[This[sym]]}`);
                    }else{
                        timeout.e=1;
                        timeout.op="timeout";
                        timeout.d={
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,col:o,id:id}
                        };
                        Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                    }
                    o=null;
                    CallBacks[This[sym]].CallBacks[l]=function(response){
                        CallBacks[This[sym]].CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        callback(null,response.u);
                        response = null;
                    };
                }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name));}
            }else{
                callback(ERRORS.DB_NOT_EXIST(db_name));
            }
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function _wToDStorage(db_name,tb_name,id,s_col,data,callback,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},'');
        return;
    }
    if(string(db_name,tb_name,id,s_col)){
        if(This.isSafe(id)&&This.isSafe(data)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            s_col = s_col.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                if(Connections[This[sym]].dbs[db_name].DISPERSEDTABLES[tb_name]){
                    //if(Connections[This[sym]].dbs[db_name].DISPERSEDTABLES[tb_name].columns.includes(s_col)){
                        var l = callbackPosition(This[sym]);
                        if(!timeout){
                            Connections[This[sym]].write(`${JSON.stringify({
                                e:1,id:l,db:db_name,op:"wToDS",d:{tb:tb_name,id:id,s_col:s_col,d:data}
                            })}${Splitter[This[sym]]}`);
                        }else{
                            timeout.e=1;
                            timeout.op="timeout";
                            timeout.d={
                                e:1,id:l,db:db_name,op:"wToDS",d:{tb:tb_name,id:id,s_col:s_col,d:data}
                            };
                            Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                        }
                        CallBacks[This[sym]].CallBacks[l]=function(response){
                            if(response.d){
                                CallBacks[This[sym]].CallBacks[l] = null;
                                CallBacks[This[sym]].CallBacksTrash.push(l);
                                callback(null,response.d);
                                response = null;
                                return;
                            }
                            CallBacks[This[sym]].CallBacks[l] = null;
                            CallBacks[This[sym]].CallBacksTrash.push(l);
                            response = null;
                            callback({message:"Internal Error",code:"INERR"});
                            
                        };
                    //}else{}
                }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name));}
            }else{callback(ERRORS.DB_NOT_EXIST(db_name));}
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function up_get_del_D_Data(db_name,tb_name,id,s_col,data,data_id,op,callback,This,timeout,ret){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},null);
        return;
    }
    if(string(db_name,tb_name,id,s_col,data_id)){
        ret=ret?ret:1;
        if(This.isSafe(id)&&This.isSafe(data)&&This.isSafe(data_id)&&This.isSafe(ret)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            s_col = s_col.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                if(Connections[This[sym]].dbs[db_name].DISPERSEDTABLES[tb_name]){
                    //if(Connections[This[sym]].dbs[db_name].DISPERSEDTABLES[tb_name].storage.includes(s_col)){
                        var l = callbackPosition(This[sym]);
                        if(!timeout){
                            Connections[This[sym]].write(`${JSON.stringify({
                                e:1,id:l,db:db_name,op:op,d:{
                                    tablename:tb_name,id:id,storageColumn:s_col,dataId:data_id,data:data
                                },ret:ret
                            })}${Splitter[This[sym]]}`);
                        }else{
                            timeout.e=1;
                            timeout.op="timeout";
                            timeout.d={
                                e:1,id:l,db:db_name,op:op,d:{
                                    tablename:tb_name,id:id,storageColumn:s_col,dataId:data_id,data:data
                                },ret:ret
                            };
                            Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                        }
                        CallBacks[This[sym]].CallBacks[l]=function(response){
                            CallBacks[This[sym]].CallBacks[l] = null;
                            CallBacks[This[sym]].CallBacksTrash.push(l);
                            callback(null,response.d);
                            response = null;
                            
                        };
                    //}else{}
                }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name));}
            }else{callback(ERRORS.DB_NOT_EXIST(db_name));}
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function getRow(db_name,tb_name,id,callback,dispersed,returns,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},null);
        return;
    }
    if(string(db_name,tb_name,id)){
        if(This.isSafe(id)&&This.isSafe(returns)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                let tableType = dispersed?["DISPERSEDTABLES","getDR"]:["TABLES","getR"];
                if(Connections[This[sym]].dbs[db_name][tableType[0]][tb_name]){
                    var l = callbackPosition(This[sym]);
                    CallBacks[This[sym]].CallBacks[l]=function(response){
                        CallBacks[This[sym]].CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        callback(response.er,response.d);
                        response = null;
                    };
                    if(!timeout){
                        Connections[This[sym]].write(`${JSON.stringify({
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,id:id,ret:returns}
                        })}${Splitter[This[sym]]}`);
                    }else{
                        timeout.e=1;
                        timeout.op="timeout";
                        timeout.d={
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,id:id,ret:returns}
                        };
                        Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                    }
                }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name))}
            }else{callback(ERRORS.DB_NOT_EXIST(db_name))}
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function getAllRows(db_name,tb_name,dispersed,conditions,ondataArr,onendArr,onerr,callbacks,This,timeout){
    if(!NOSCDB[This[sym]]){
        onerr({code:'NOSCDB_CLOSED',path:This[sym]});
        return;
    }
    if(string(db_name,tb_name)){
        if(This.isSafe(conditions)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                let tableType = dispersed?["DISPERSEDTABLES","getA_DR"]:["TABLES","getA_R"];
                if(Connections[This[sym]].dbs[db_name][tableType[0]][tb_name]){
                    var l = callbackPosition(This[sym]);
                    if(!timeout){
                        Connections[This[sym]].write(`${JSON.stringify({
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,con:conditions}
                        })}${Splitter[This[sym]]}`);
                    }else{
                        timeout.e=1;
                        timeout.op="timeout";
                        timeout.d={
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,con:conditions}
                        };
                        Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                    }
                    conditions = null;
                    onerr = null;
                    CallBacks[This[sym]].CallBacks[l]=function(response){
                        callbacks.acceptOnDataFuncs = false;
                        var i;
                        if(response.e){
                            callbacks.acceptOnEndFuncs = false;
                            for(i in onendArr){
                                onendArr[i](response.dr);
                                onendArr[i]=null;
                            }
                            onendArr=null;
                            ondataArr = null;
                            CallBacks[This[sym]].CallBacks[l] = null;
                            CallBacks[This[sym]].CallBacksTrash.push(l);
                            response = null;
                            return;
                        }
                        for(i in ondataArr){
                            ondataArr[i](response.d,response.dr);
                        }
                        response=null;
                    };
                }else{
                    onendArr=null;
                    ondataArr = null;
                    conditions = null;
                    if(typeof (onerr)==="function"){onerr(ERRORS.TB_NOT_EXIST(tb_name,db_name));onerr=null;}
                }
            }else{
                onendArr=null;
                ondataArr = null;
                conditions = null;
                if(typeof (onerr)==="function"){onerr(ERRORS.DB_NOT_EXIST(db_name));onerr=null;}
            }
        }else{
            onendArr=null;
            ondataArr = null;
            conditions = null;
            if(typeof (onerr)==="function"){onerr(ERRORS.UNSAFE);onerr=null;}
        }
    }else{
        onendArr=null;
        ondataArr = null;
        conditions = null;
        if(typeof (onerr)==="function"){onerr(ERRORS.WRONG_ARGS);onerr=null;}
    }
};
function readFromDS(db_name,tb_name,id,storageColumn,conditions,ondataArr,onendArr,onerr,callbacks,This,timeout){
    if(!NOSCDB[This[sym]]){
        onerr({code:'NOSCDB_CLOSED',path:This[sym]});
        return;
    }
    if(string(db_name,tb_name,id,storageColumn)){
        if(This.isSafe(conditions)&&This.isSafe(id)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            storageColumn = storageColumn.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                if(Connections[This[sym]].dbs[db_name].DISPERSEDTABLES[tb_name]){
                    var l = callbackPosition(This[sym]);
                    if(!timeout){
                        Connections[This[sym]].write(`${JSON.stringify({
                            e:1,id:l,db:db_name,op:"rFromDS",d:{tb:tb_name,con:conditions,id:id,s_col:storageColumn}
                        })}${Splitter[This[sym]]}`);
                    }else{
                        timeout.e=1;
                        timeout.op="timeout";
                        timeout.d={
                            e:1,id:l,db:db_name,op:"rFromDS",d:{tb:tb_name,con:conditions,id:id,s_col:storageColumn}
                        };
                        Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                    }
                    conditions = null;
                    CallBacks[This[sym]].CallBacks[l]=function(response){
                        callbacks.acceptOnDataFuncs = false;
                        var i;
                        if(response.e){
                            callbacks.acceptOnEndFuncs = false;
                            if(response.er){
                                if(typeof (onerr)==="function"){onerr(response.er);}
                            }else{
                                for(i in onendArr){
                                    onendArr[i](response.dr,response.ldrd);
                                    onendArr[i]=null;
                                }
                            }
                            onendArr=null;
                            ondataArr = null;
                            CallBacks[This[sym]].CallBacks[l] = null;
                            CallBacks[This[sym]].CallBacksTrash.push(l);
                            response = null;
                            onerr = null;
                        }else{
                            for(i in ondataArr){
                                ondataArr[i](response.d);
                            }
                            response=null;
                        }
                    };
                }else{
                    onendArr=null;
                    ondataArr = null;
                    conditions = null;
                    if(typeof (onerr)==="function"){onerr(ERRORS.TB_NOT_EXIST(tb_name,db_name));onerr=null;}
                }
            }else{
                onendArr=null;
                ondataArr = null;
                conditions = null;
                if(typeof (onerr)==="function"){onerr(ERRORS.DB_NOT_EXIST(db_name));onerr=null;}
            }
        }else{
            onendArr=null;
            ondataArr = null;
            conditions = null;
            if(typeof (onerr)==="function"){onerr(ERRORS.UNSAFE);onerr=null;}
        }
    }else{
        onendArr=null;
        ondataArr = null;
        conditions = null;
        if(typeof (onerr)==="function"){onerr(ERRORS.WRONG_ARGS);onerr=null;}
    }
};
function rowExists(db_name,tb_name,id,callback,dispersed,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},NaN);
        return;
    }
    if(string(db_name,tb_name,id)){
        if(This.isSafe(id)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                let tableType = dispersed?["DISPERSEDTABLES","d_rowEx"]:["TABLES","rowEx"];
                if(Connections[This[sym]].dbs[db_name][tableType[0]][tb_name]){
                    var l = callbackPosition(This[sym]);
                    if(!timeout){
                        Connections[This[sym]].write(`${JSON.stringify({
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,id:id}
                        })}${Splitter[This[sym]]}`);
                    }else{
                        timeout.e=1;
                        timeout.op="timeout";
                        timeout.d={
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,id:id}
                        };
                        Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                    }
                    CallBacks[This[sym]].CallBacks[l]=function(response){
                        CallBacks[This[sym]].CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        callback(null,response.x);
                        response = null;
                    };
                }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name))}
            }else{callback(ERRORS.DB_NOT_EXIST(db_name))}
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function delRow(db_name,tb_name,id,callback,dispersed,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},NaN);
        return;
    }
    if(string(db_name,tb_name,id)){
        if(This.isSafe(id)){
            db_name = db_name.toLowerCase();
            tb_name = tb_name.toLowerCase();
            if(Connections[This[sym]].dbs[db_name]){
                let tableType = dispersed?["DISPERSEDTABLES","delDR"]:["TABLES","delR"];
                if(Connections[This[sym]].dbs[db_name][tableType[0]][tb_name]){
                    var l = callbackPosition(This[sym]);
                    if(!timeout){
                        Connections[This[sym]].write(`${JSON.stringify({
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,id:id}
                        })}${Splitter[This[sym]]}`);
                    }else{
                        timeout.e=1;
                        timeout.op="timeout";
                        timeout.d={
                            e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name,id:id}
                        };
                        Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                    }
                    CallBacks[This[sym]].CallBacks[l]=function(response){
                        if(response.d){
                            Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].rows = response.i;
                            CallBacks[This[sym]].CallBacks[l] = null;
                            CallBacks[This[sym]].CallBacksTrash.push(l);
                            response = null;
                            callback(null,true);
                            return;
                        }
                        CallBacks[This[sym]].CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        callback(null,false);
                        response = null;
                    };
                }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name))}
            }else{callback(ERRORS.DB_NOT_EXIST(db_name))}
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function delAllRows(db_name,tb_name,callback,dispersed,This,timeout){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},NaN);
        return;
    }
    if(string(db_name,tb_name)){
        db_name = db_name.toLowerCase();
        tb_name = tb_name.toLowerCase();
        if(Connections[This[sym]].dbs[db_name]){
            let tableType = dispersed?["DISPERSEDTABLES","delA_DR"]:["TABLES","delA_R"];
            if(Connections[This[sym]].dbs[db_name][tableType[0]][tb_name]){
                var l = callbackPosition(This[sym]);
                if(!timeout){
                    Connections[This[sym]].write(`${JSON.stringify({
                        e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name}
                    })}${Splitter[This[sym]]}`);
                }else{
                    timeout.e=1;
                    timeout.op="timeout";
                    timeout.d={
                        e:1,id:l,db:db_name,op:tableType[1],d:{tb:tb_name}
                    };
                    Connections[This[sym]].write(`${JSON.stringify(timeout)}${Splitter[This[sym]]}`);
                }
                CallBacks[This[sym]].CallBacks[l]=function(response){
                    if(response.d){
                        Connections[This[sym]].dbs[db_name][tableType[0]][tb_name].rows = response.i;
                        CallBacks[This[sym]].CallBacks[l] = null;
                        CallBacks[This[sym]].CallBacksTrash.push(l);
                        response = null;
                        callback(null,true);
                        return;
                    }
                    CallBacks[This[sym]].CallBacks[l] = null;
                    CallBacks[This[sym]].CallBacksTrash.push(l);
                    callback(null,false);
                    response = null;
                };
            }else{callback(ERRORS.TB_NOT_EXIST(tb_name,db_name))}
        }else{callback(ERRORS.DB_NOT_EXIST(db_name))}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function ClearTimeout(id,callback,This){
    if(!NOSCDB[This[sym]]){
        callback({code:'NOSCDB_CLOSED',path:This[sym]},NaN);
        return;
    }
    if(typeof (id)==="string"){
        if(This.isSafe(id)){
            var l = callbackPosition(This[sym]);
            Connections[This[sym]].write(`${JSON.stringify({
                e:1,id:l,t_id:id,op:"c_timeout"
            })}${Splitter[This[sym]]}`);
            CallBacks[This[sym]].CallBacks[l]=function(response){
                CallBacks[This[sym]].CallBacks[l] = null;
                CallBacks[This[sym]].CallBacksTrash.push(l);
                callback(null,response.r?true:false);
                response = null;
            };
        }else{callback(ERRORS.UNSAFE)}
    }else{callback(ERRORS.WRONG_ARGS)}
};
function stringObj(obj){
    var i,y=true;
    for(i in obj){
        if(typeof (obj[i])!=="string"){
            y = false;break;
        }
    }
    return y;
}
function getInstance(){
    if(!Connections[this[sym]]){return null;}
    var o = {};
    if(arguments.length>0&&stringObj(arguments)){
        var i,args=JSON.parse(JSON.stringify(arguments).toLowerCase());
        if(arguments.length===1){
            return JSON.parse(JSON.stringify(Connections[this[sym]].dbs[args[0]]));
        }
        for(i in args){
            o[args[i]] = Connections[this[sym]].dbs[args[i]];
        }
        args = null;
    }else{
        o = Connections[this[sym]].dbs;
    }
    return JSON.parse(JSON.stringify(o));
};
/**
 * Returns the number of rows in a table.
 * @param {string} db_name 
 * @param {string} tablename 
 */
function NumberOfRows(db_name,tablename){
    var n = NaN;
    if(!Connections[this[sym]]){return n;}
    db_name = db_name.toLowerCase();
    tablename = tablename.toLowerCase();
    if(Connections[this[sym]].dbs[db_name]&&Connections[this[sym]].dbs[db_name].TABLES[tablename]){
        n = Connections[this[sym]].dbs[db_name].TABLES[tablename].rows;
    }
    return n;
};
/**
 * Returns the number of rows in a dispersed table.
 * @param {string} db_name 
 * @param {string} tablename 
 */
function NumberOfDRows(db_name,tablename){
    var n = NaN;
    if(!Connections[this[sym]]){return n;}
    db_name = db_name.toLowerCase();
    tablename = tablename.toLowerCase();
    if(Connections[this[sym]].dbs[db_name]&&Connections[this[sym]].dbs[db_name].DISPERSEDTABLES[tablename]){
        n = Connections[this[sym]].dbs[db_name].DISPERSEDTABLES[tablename].rows;
    }
    return n;
};
function string(){
    var i,yes=true;
    for(i in arguments){
        if(typeof (arguments[i])!=="string"){
            yes = false;break;
        }
    }
    return yes;
};
function stringArr(arr){
    if(!Array.isArray(arr)){return false;}
    var i,yes=true;
    for(i in arr){
        if(typeof (arr[i])!=="string"){
            yes = false;break;
        }
    }
    return yes;
};
const ERRORS = {
    WRONG_ARGS:{message:"Received wrong arguments",code:"W_ARGS"},
    DB_NOT_EXIST:function(db_name){return {message:`No database exists as: <${db_name}>`,code:"DB_!EX"}},
    DB_EXIST:function(db_name){return {message:`Database name <${db_name}> exists`,code:"DB_EX"}},
    TB_NOT_EXIST:function(tb_name,db_name){return {message:`Table name: <${tb_name}> does not exist in database name: <${db_name}>`,code:"TB_!EX"}},
    TB_EXIST:function(tb_name,db_name){return {message:`Table name: <${tb_name}> exists in database name: <${db_name}>`,code:"TB_EX"}},
    COL_NOT_EXIST:function(col_name,tb_name){return {message:`Column name: <${col_name}> does not exist in database name: <${tb_name}>`,code:"TB_!EX"}},
    UNSAFE:{message:"Unsafe request",code:"UNSAFE_CHARS"}
};
module.exports = {
    connect,
    createDatabase,
    createDTable,
    createTable,
    NumberOfDRows,
    NumberOfRows,
    createRow,
    updateRow,
    getRow,
    delRow,
    rowExists,
    delAllRows,
    getInstance,
    getAllRows,
    _wToDStorage,
    up_get_del_D_Data,
    readFromDS,
    ClearTimeout
}
