
var fs = null;//require("fs");
var maxParrallelFiles=1000,maxCount=0;
const MANAGER = {};
const MANAGERESS = {};
const writef = {},readf={},readD={};
/**
 * 
 * @param {string} path 
 * @param {string} data 
 * @param {(err:NodeJS.ErrnoException)=>void} callback 
 */
function _writeFile(path,data,callback){
    const This = this;
    if(typeof (MANAGER[path])==="undefined"){
        MANAGER[path] = {busy:false,task:[]};
        writef[path] = {callbacks:[],registered:false,data:""};
        readf[path] = {callbacks:[],registered:false};
    }
    writef[path].data = data;
    maxCount++;
    if(MANAGER[path].busy||maxCount>=maxParrallelFiles){
        maxCount--;
        if(!writef[path].registered){
            writef[path].registered = true;
            MANAGER[path].task.push({callback:callback,operation:"writeFile"});
        }else{
            writef[path].callbacks.push(callback);
        }
        return;
    }else{
        MANAGER[path].busy=true;
        var CallBacks = writef[path].callbacks;
        writef[path].callbacks = [];
        var Data = writef[path].data;
        writef[path].data = "";
        writef[path].registered = false;
        fs.writeFile(path,Data,(err)=>{
            if(err){};
            maxCount--;
            Data = null;
            if(MANAGER[path].task.length>0){
                let nextTask = MANAGER[path].task.shift();
                MANAGER[path].busy=false;
                if(nextTask.operation!=="unlink"){
                    // For reads and writes
                    if(nextTask.operation==="writeFile"){
                        This.writeFile(path,writef[path].data,nextTask.callback);
                    }else{
                        This.readFile(path,nextTask.data,nextTask.callback);
                    }
                }else{
                    // For unlinks
                    This.unlink(path,nextTask.callback);
                }
                callback(err);
                var i;
                for(i in CallBacks){
                    CallBacks[i](err);
                    CallBacks[i]=null;
                }
                CallBacks = null;
            }else{
                MANAGER[path] = null;
                delete MANAGER[path];
                writef[path] = null;
                delete writef[path];
                readf[path] = null;
                delete readf[path];
                callback(err);
                var i;
                for(i in CallBacks){
                    CallBacks[i](err);
                    CallBacks[i]=null;
                }
                CallBacks = null;
            }
        });
    }
    
};
/**
 * 
 * @param {string} path 
 * @param {string} data 
 * @param {(err:NodeJS.ErrnoException,data:string|Buffer)=>void} callback 
 */
 function _readFile(path,data,callback){
    const This = this;
    if(typeof (MANAGER[path])==="undefined"){
        MANAGER[path] = {busy:false,task:[]};
        readf[path] = {callbacks:[],registered:false};
        writef[path] = {callbacks:[],registered:false,data:""};
    }
    maxCount++;
    if(MANAGER[path].busy||maxCount>=maxParrallelFiles){
        maxCount--;
        if(!readf[path].registered){
            readf[path].registered = true;
            MANAGER[path].task.push({data:data,callback:callback,operation:"readFile"});
        }else{
            readf[path].callbacks.push(callback);
        }
        return;
    }else{
        MANAGER[path].busy=true;
        var CallBacks = readf[path].callbacks;
        readf[path].callbacks = [];
        readf[path].registered = false;
        fs.readFile(path,data,(err,fdata)=>{
            if(err){};
            maxCount--;
            if(MANAGER[path].task.length>0){
                let nextTask = MANAGER[path].task.shift();
                MANAGER[path].busy=false;
                if(nextTask.operation!=="unlink"){
                    // For reads and writes
                    if(nextTask.operation==="writeFile"){
                        This.writeFile(path,writef[path].data,nextTask.callback);
                    }else{
                        This.readFile(path,nextTask.data,nextTask.callback);
                    }
                }else{
                    // For unlinks
                    This.unlink(path,nextTask.callback);
                }
                callback(err,fdata);
                var i;
                for(i in CallBacks){
                    CallBacks[i](err,fdata);
                    CallBacks[i]=null;
                }
                CallBacks = null;
            }else{
                MANAGER[path] = null;
                delete MANAGER[path];
                readf[path] = null;
                delete readf[path];
                writef[path] = null;
                delete writef[path];
                callback(err,fdata);
                var i;
                for(i in CallBacks){
                    CallBacks[i](err,fdata);
                    CallBacks[i]=null;
                }
                CallBacks = null;
            }
        });
    }
    
};
/**
 * 
 * @param {string} path 
 * @param {(err:NodeJS.ErrnoException)=>void} callback 
 */
 function _unlink(path,callback){
    const This = this;
    if(typeof (MANAGER[path])==="undefined"){
        MANAGER[path] = {busy:false,task:[]};
        readf[path] = {callbacks:[],registered:false};
        writef[path] = {callbacks:[],registered:false,data:""};
    }
    maxCount++;
    if(MANAGER[path].busy||maxCount>=maxParrallelFiles){
        maxCount--;
        MANAGER[path].task.push({callback:callback,operation:"unlink"});
        return;
    }else{
        MANAGER[path].busy=true;
        fs.unlink(path,(err)=>{
            if(err){
                if(err.code==="ENOENT"){err=false}
            }
            maxCount--;
            if(MANAGER[path].task.length>0){
                let nextTask = MANAGER[path].task.shift();
                MANAGER[path].busy=false;
                if(nextTask.operation!=="unlink"){
                    // For reads and writes
                    if(nextTask.operation==="writeFile"){
                        This.writeFile(path,writef[path].data,nextTask.callback);
                    }else{
                        This.readFile(path,nextTask.data,nextTask.callback);
                    }
                }else{
                    // For unlinks
                    This.unlink(path,nextTask.callback);
                }
                callback(err);
            }else{
                MANAGER[path] = null;
                delete MANAGER[path];
                readf[path] = null;
                delete readf[path];
                writef[path] = null;
                delete writef[path];
                callback(err);
            }
        });
    }
    
};
/**
 * 
 * @param {string} path 
 * @param {(err:NodeJS.ErrnoException)=>void} callback 
 */
 function _mkdir(path,callback){
    const This = this;
    if(typeof (MANAGERESS[path])==="undefined"){
        MANAGERESS[path] = {busy:false,task:[]};
        readD[path] = {callbacks:[],registered:false};
    }
    maxCount++;
    if(MANAGERESS[path].busy||maxCount>=maxParrallelFiles){
        maxCount--;
        MANAGERESS[path].task.push({callback:callback,operation:"mkdir"});
        return;
    }else{
        MANAGERESS[path].busy=true;
        fs.mkdir(path,(err)=>{
            if(err){}
            maxCount--;
            if(MANAGERESS[path].task.length>0){
                let nextTask = MANAGERESS[path].task.shift();
                MANAGERESS[path].busy=false;
                if(nextTask.operation==="readdir"){
                    // For reads 
                    This.readdir(path,nextTask.data,nextTask.callback);
                }else{
                    // For removes and makes
                    This[nextTask.operation](path,nextTask.callback);
                }
                callback(err);
            }else{
                MANAGERESS[path] = null;
                delete MANAGERESS[path];
                readD[path] = null;
                delete readD[path];
                callback(err);
            }
        });
    }
    
};
/**
 * 
 * @param {string} path 
 * @param {(err:NodeJS.ErrnoException)=>void} callback 
 */
 function _rmdir(path,callback){
    const This = this;
    if(typeof (MANAGERESS[path])==="undefined"){
        MANAGERESS[path] = {busy:false,task:[]};
        readD[path] = {callbacks:[],registered:false};
    }
    maxCount++;
    if(MANAGERESS[path].busy||maxCount>=maxParrallelFiles){
        maxCount--;
        MANAGERESS[path].task.push({callback:callback,operation:"rmdir"});
        return;
    }else{
        MANAGERESS[path].busy=true;
        fs.rmdir(path,(err)=>{
            if(err){if(err.code==="ENOENT"){err=false}}
            maxCount--;
            if(MANAGERESS[path].task.length>0){
                let nextTask = MANAGERESS[path].task.shift();
                MANAGERESS[path].busy=false;
                if(nextTask.operation==="readdir"){
                    // For reads 
                    This.readdir(path,nextTask.data,nextTask.callback);
                }else{
                    // For removes and makes
                    This[nextTask.operation](path,nextTask.callback);
                }
                callback(err);
            }else{
                MANAGERESS[path] = null;
                delete MANAGERESS[path];
                readD[path] = null;
                delete readD[path];
                callback(err);
            }
        });
    }
    
};
/**
 * 
 * @param {string} path 
 * @param {string} data
 * @param {(err:NodeJS.ErrnoException,files:string[])=>void} callback 
 */
 function _readdir(path,data,callback){
    const This = this;
    if(typeof (MANAGERESS[path])==="undefined"){
        MANAGERESS[path] = {busy:false,task:[]};
        readD[path] = {callbacks:[],registered:false};
    }
    maxCount++;
    if(MANAGERESS[path].busy||maxCount>=maxParrallelFiles){
        maxCount--;
        if(!readD[path].registered){
            readD[path].registered = true;
            MANAGERESS[path].task.push({callback:callback,operation:"readdir",data:data});
        }else{
            readD[path].callbacks.push(callback);
        }
        return;
    }else{
        MANAGERESS[path].busy=true;
        var CallBacks = readD[path].callbacks;
        readD[path].callbacks = [];
        readD[path].registered = false;
        fs.readdir(path,data,(err,files)=>{
            if(err){}
            maxCount--;
            if(MANAGERESS[path].task.length>0){
                let nextTask = MANAGERESS[path].task.shift();
                MANAGERESS[path].busy=false;
                if(nextTask.operation==="readdir"){
                    // For reads 
                    This.readdir(path,nextTask.data,nextTask.callback);
                }else{
                    // For removes and makes
                    This[nextTask.operation](path,nextTask.callback);
                }
                callback(err,files);
                var i;
                for(i in CallBacks){
                    CallBacks[i](err,files);
                    CallBacks[i]=null;
                }
                CallBacks = null;
            }else{
                MANAGERESS[path] = null;
                delete MANAGERESS[path];
                readD[path] = null;
                delete readD[path];
                callback(err,files);
                var i;
                for(i in CallBacks){
                    CallBacks[i](err,files);
                    CallBacks[i]=null;
                }
                CallBacks = null;
            }
        });
    }
    
};
/**
 * 
 * @param {object} newfs 
 */
function override(newfs){fs = newfs;}
module.exports = {
    writeFile:_writeFile,
    readFile:_readFile,
    unlink:_unlink,
    readdir:_readdir,
    mkdir:_mkdir,
    rmdir:_rmdir,
    override_fs:override,
    maxParrallelOpenedFiles:function(numb){
        if(typeof (numb)==="number"&&numb>0){
            maxParrallelFiles=numb;
        }
    }
};
