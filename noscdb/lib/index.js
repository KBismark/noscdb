"use strict"
let fs = require("fs");
const fsm = require(__dirname+"/fsmanager.js");
fsm.override_fs(fs);
const dirhandle = require(__dirname+"/ndbtools/dir.js"),
removeDir=dirhandle.removeDir;
dirhandle.use_fsm(fsm);
const noscDate = require(__dirname+"/ndbtools/date.js");
const { date , roundUpDate }=noscDate;
const db_EXT=".db",n_ne=Symbol();
var MAX_DROW_RECUR = 100000;
const SECONDWAITER = {};
const Databases={};
var ndbServer=false;
Databases[""]=[""];
Databases["***"]={};//usage not yet implemented

/*------------Heler Functions-----------------*/

function enId(a){
    var s="",i;
    for(i in a){
        s+=endIDx[Number(a[i])];
    }
    return s;
};
function deId(a){
    var s="",i;
    for(i in a){
        if(a[i]!=="z"){
            s+=""+endIDx.indexOf(a[i]);
        }else{
            s+="z";
        }
    }
    return s.split("z");
};
function Err(mes){
    ERR(mes);
};
function _createDirr(dir_path,callback){
    fsm.mkdir(dir_path,function(er){
        if(er){
            if(er.code==='EEXIST'){callback(true)}
            else{callback(false)}
            return;
        }
        callback(true)
    });
};
function _check4dirNoChecks(dir_path,callback,returnn){
    fsm.readdir(dir_path,"utf8",function(er,files){
        if(er){
            callback(false);
            return;
        }
        if(typeof (returnn)==="boolean"&&returnn){callback(files);files=null;return;}
        files=null;
        callback(true);
    });
};
function _check4dfileNoChecks(file_path,callback,returnn){
    fsm.readFile(file_path,"utf8",function(err,data){
        if(err){
            callback(false);
            return;
        }
        if(typeof (returnn)==="boolean"&&returnn){callback(data);data=null;return;}
        data = null;
        callback(true);
    });
};
function create_File(file_path,data,callback){
    _check4dfileNoChecks(file_path,function(exists){
        if(exists){
            callback(true);
            return;
        }
        if(typeof (data)==="undefined"){data="";};
        fsm.writeFile(file_path,data,function(err){
            if(err){
                callback(false);
                return;
            }
            callback(true);
        });
    });
};
function ERR(mes){
    throw new Error(mes);
};
function fAble(s){
    var ret=true;
    if(s.length<1){ret=false}
    else{
        if(/[^a-z0-9_]/.test(s)){
            ret = false;
        }
    };
    return ret;
};
function stringArr(arr){
    var i,ret=true;
    if(Array.isArray(arr)){
        for(i=0;i<arr.length;i++){
            if(typeof (arr[i])!=="string"){
                ret = false;
                break;
            }
        }
    }else{
        ret = false;
    }
    return ret;
};
function select(value,arr,start){
    if(arr.length<1){return [];}
    var f = value.charCodeAt(start);
    var mid = Math.floor((arr.length)/2);
    var arrMidVallue = arr[mid];
    arrMidVallue.length>start?arrMidVallue = arrMidVallue.charCodeAt(start):arrMidVallue=f+2;
    if(f>arrMidVallue){
        return select(value,arr.slice(mid+1),start);
    }else if(f<arrMidVallue){
        return select(value,arr.slice(0,mid),start);
    }else{
        var separator = String.fromCharCode(7543);
        arr = `${separator}${arr.join(separator)}${separator}`;
        value=value.replace(/[\\[.*+(?{^$|})]/g,'\\$&');
        var requiredString = arr.match(RegExp(`${separator}${value}(.*)${separator}${value}`,"g"));
        if(requiredString){
            arr = arr.split(requiredString[0]);
            if(arr.length>1){
                arr = arr.pop().split(separator)[0];
                requiredString = requiredString[0]+arr;
                arr = null;
            }else{
                arr = null;
                requiredString = requiredString[0];
            }
        }else{
            requiredString = arr.match(RegExp(`${separator}${value}(.*?)${separator}`,"g"));
            if(requiredString){
                requiredString = requiredString[0];
            }else{
                requiredString = `${separator}`;
            }
        }
        requiredString = requiredString.split(separator);
        requiredString.shift();
        if(requiredString[requiredString.length-1].length===0){
            requiredString.pop();
        }
        return requiredString;
    }
};
function selectStartsWith(value,arr){
    arr = arr.sort();
    var i,val='';
    for(i = 1;i<value.length;i++){
        val += value[i];
        arr = select(val,arr,i);
        if(arr.length<1){return arr;}
    }
    return arr;
};
function selectIncludesMain(value,arr){
    var i,arrs,narrs=[];
    try{
        arrs=`,${arr.join()}`.match(RegExp(',(.*?)'+value.replace(/[\\[.*+(?{^$|})]/g,'\\$&'),'g'));
        if(arrs){
            for(i=0;i<arrs.length;i++){
                arrs[i]=arrs[i].replace(',','');
                arrs[i]=arrs[i].split(',').pop();
                if(narrs.indexOf(arrs[i])<0){
                    narrs.push(arrs[i])
                }
                arrs[i]=null;
            }
            arrs=null;
        }
    } catch (error) {
        for(i=0;i<arr.length;i++){
            if(arr[i].indexOf(value)>=0&&narrs.indexOf(arr[i])<0){
                narrs.push(arr[i]);
            }
        }
    }
    var marrs=[];
    for(i=0;i<narrs.length;i++){
        marrs=marrs.concat(select1StartsWith(narrs[i],arr));
    }
    return marrs;
};
function selectIncludes(value,arr){
    var i,arrs,narrs=[];
    try{
        arrs=`,${arr.join()}`.match(RegExp(',a(.*?)'+value.replace(/[\\[.*+(?{^$|})]/g,'\\$&'),'g'));
        if(arrs){
            for(i=0;i<arrs.length;i++){
                arrs[i]=arrs[i].replace(',','');
                arrs[i]=arrs[i].split(',').pop();
                if(narrs.indexOf(arrs[i])<0){
                    narrs.push(arrs[i])
                }
                arrs[i]=null;
            }
            arrs=null;
        }
    } catch (error) {
        for(i=0;i<arr.length;i++){
            if(arr[i].indexOf(value)>=0&&narrs.indexOf(arr[i])<0){
                narrs.push(arr[i]);
            }
        }
    }
    var marrs=[];
    for(i=0;i<narrs.length;i++){
        marrs=marrs.concat(select1StartsWith(narrs[i],arr));
    }
    return marrs;
};
function selectEndsWithDivide(value,arr){
    var separator = String.fromCharCode(7543);
    arr = arr.join(separator).split("").reverse().join("").split(separator).sort();
    value = value.split("").reverse().join("");
    var i,val='';
    for(i = 0;i<value.length;i++){
        val += value[i];
        arr = select(val,arr,i);
        if(arr.length<1){return arr;}
    }
    return arr.join(separator).split("").reverse().join("").split(separator);
};
/**
 * 
 * @param {string} value **FORMAT**: `'endsWithValue'`
 * @param {string[]} arr The string array to select values.
 * @returns 
 */
function selectEndsWith(value,arr){
    if(arr.length<1){return arr;}
    var mid = Math.floor(arr.length/2);
    if(mid>1000){
        var midd = Math.floor(mid/2);
        return selectEndsWithDivide(value,arr.slice(0,midd))
        .concat(selectEndsWithDivide(value,arr.slice(midd,mid)))
        .concat(selectEndsWithDivide(value,arr.slice(mid,mid+midd)))
        .concat(selectEndsWithDivide(value,arr.slice(midd+mid)))
        .sort();
    }else{
        return selectEndsWithDivide(value,arr.slice(0,mid))
        .concat(selectEndsWithDivide(value,arr.slice(mid)))
        .sort();
    }
};
function selectStartsWithDivide(value,arr){
    arr = arr.sort();
    var i,val='';
    for(i = 0;i<value.length;i++){
        val += value[i];
        arr = select(val,arr,i);
        if(arr.length<1){return arr;}
    }
    return arr;
};
/**
 * 
 * @param {string} value **FORMAT**: `'startsWithValue'`
 * @param {string[]} arr The string array to select values.
 * @returns 
 */
function select1StartsWith(value,arr){
    if(arr.length<1){return arr;}
    var mid = Math.floor(arr.length/2);
    if(mid>1000){
        var midd = Math.floor(mid/2);
        return selectStartsWithDivide(value,arr.slice(0,midd))
        .concat(selectStartsWithDivide(value,arr.slice(midd,mid)))
        .concat(selectStartsWithDivide(value,arr.slice(mid,mid+midd)))
        .concat(selectStartsWithDivide(value,arr.slice(midd+mid)))
        .sort();
    }else{
        return selectStartsWithDivide(value,arr.slice(0,mid))
        .concat(selectStartsWithDivide(value,arr.slice(mid)))
        .sort();
    }
};
/**
 * 
 * @param {string} value **FORMAT**: `'startsWithValue...endsWithValue'`
 * @param {string[]} arr The string array to select values.
 * @returns 
 */
function selectStartsAndEndsWith(value,arr){
    value = value.split("...");
    arr = select1StartsWith(value[0],arr);
    if(value.length>1){
        arr = selectEndsWith(value[1],arr);
    }
    return arr;
};
function select3(value,arr){
    if(arr.length<1){return [];}
        arr = select4(value,arr,0)[0];
        var separator = String.fromCharCode(7543);
        arr = `${separator}${arr.join(separator)}${separator}`;
        var requiredString = arr.match(RegExp(`${separator}${value}(.*)${separator}${value}`,"g"));
        if(requiredString){
            arr = arr.split(requiredString);
            if(arr.length>1){
                arr = arr.pop().split(separator)[0];
                requiredString = requiredString[0]+arr;
                arr = null;
            }else{
                arr = null;
                requiredString = requiredString[0];
            }
        }else{
            requiredString = arr.match(RegExp(`${separator}${value}(.*?)${separator}`,"g"));
            if(requiredString){
                requiredString = requiredString[0];
            }else{
                requiredString = `${separator}`;
            }
        }
        requiredString = requiredString.split(separator);
        requiredString.shift();
        if(requiredString[requiredString.length-1].length===0){
            requiredString.pop();
        }
        return requiredString;
};
function select2(value,arr,start){
    if(arr.length<1){return [];}
    var f = value.charCodeAt(start);
    var mid = Math.floor((arr.length)/2);
    var arrMidVallue = arr[mid];
    arrMidVallue.length>start?arrMidVallue = arrMidVallue.charCodeAt(start):arrMidVallue=f+2;
    if(f>arrMidVallue){
        return arr.slice(mid+1);
    }else if(f<arrMidVallue){
        return arr.slice(0,mid);
    }else{
        return arr;
    }
};
function select1(value,arr,start,st){
    if(arr.length<1){return [];}
    var mid = Math.floor((arr.length)/2);
    var arrMidVallue = arr[mid];
    if(arrMidVallue.startsWith(value,0)){
        if(mid>0){
            if(arr[mid-1].startsWith(value)){
                if(arr[0].startsWith(value)){
                    start = start.concat(arr.slice(0,mid));
                }else{
                    start = start.concat(select1(value,arr.slice(0,mid),[],st));
                }
            }
            if(arr[arr.length-1].startsWith(value)){
                start = start.concat(arr.slice(mid));
            }else{
                start =  start.concat(select1(value,arr.slice(mid),[],st));
            }
        }else{
            start = start.concat(arrMidVallue);
        }
    }else{
        if(st<value.length){
            arr = select4(value,arr,st);
            st = arr[1];
            arr = arr[0];
            start = start.concat(select1(value,arr,[],st+1));
        }else{
            start = start.concat(select3(value,arr));
        }
    }
    return start;
};
function select4(value,arr,st){
    var l = arr.length;
    arr = select2(value,arr,st);
    if(l===arr.length){
        if(st+1<value.length){
            st+=1;
            arr = select4(value,arr,st)[0];
        }
    }
    return [arr,st];
};
function select1StartsWithh(value,arr){
    if(arr.length<1){return arr;}
    arr = arr.sort();
    return select1(value,arr,[],0);
};
const endIDx = "GS3b5kx8VW";
//A comma `,` separated names of columns for the new table
/**
* @param {(noscDBReturnType: void)=>void} callback `'Optional'` Called after successful table creation.
 * 
 * @param {{tablename:string,columns:string[],created:boolean}} o 
  An object with noscDB table creation properties. 

 * ##### Object Properties:
 * `o.tablename` The name of the table to be created 
 *  
 * `o.columns` An array of column names.
 * 
 * `o.created` A `boolean` to indicate whether the table is created already `'true'` or not `'false'`
 *
 * If sets to true, sets table object only.
 *
 * If sets to false or not defined, sets table object and create table path if not already existed.
 * 
 
  ---
 * #### NOTE:

 * - A tablename or a table-column-name can only include lowercase alphabets and numbers.  
  
 * - A tablename or a table-column-name must always begin with an alphabet.
   
 */
  function _createTable(o,callback){
    _table(o,0,callback,this);
};
/**
 * @param {(noscDBReturnType: void)=>void} callback
  `'Optional'` Called after successful table creation
 *
 * @param {{tablename:string,columns:string,created:boolean,storageColumns:string[]}} o 
  An object with noscDB table creation properties. 
 
 * ##### Object Properties:
 * `o.tablename` The name of the table to be created 
 *  
 * `o.columns` An array of column names.
 * 
 * `o.created` A `boolean` to indicate whether the table is created already `'true'` or not `'false'`
 *
 * If sets to true, sets table object only.
 *
 * If sets to false or not defined, sets table object and create table path if not already existed.
 * 
 * If sets to false or not defined, sets table object and create table path if not already existed.
 * @param o.storageColumns A `Required` comma `,` separated names of columns where dispersed data will be written to and read from.
 *  
  ---
 * #### NOTE:

 * - A dispersed tablename, table-column-name or storage-column-name can only include lowercase alphabets and numbers. 
 *
 * - A dispersed tablename, table-column-name or storage-column-name must always begin with an alphabet.
 *
 */
  function _createDtable(o,callback){
    _table(o,1,callback,this);
};
/**
 * Returns the number of rows in a table
 * @param {string} tablename 
 * 
 */
 function _N_Rows(tablename){
    return _nOfRows(tablename,0,this);
};
/**
 * Returns the number of rows in a dispersed table
 * @param {string} tablename 
 * 
 */
function _N_dRows(tablename){
    return _nOfRows(tablename,1,this);
};
/**
 * 
 * @param {string} dirpath 
 * @param {string[]} dirArr 
 * @param {0} start 
 * @param {(ReturnType:boolean)=>void} callback 
 * 
 */
 function _createDirSteps(dirpath,dirArr,start,callback){
    if(start<dirArr.length){
        _createDirr(dirpath+"/"+dirArr[start],function(created){
            if(created){
                _createDirSteps(dirpath+"/"+dirArr[start],dirArr,start+1,callback);
                return;
            }
            callback(false);
        });

        return;
    }
    callback(true);
};
/**
 * @param {string[]} s Must be an array of strings
 */
 function _column(s){
    var ret=true;
    if(s.length>0){
        var i;
        for(i in s){;
            if(/[^a-z]/.test(s[i][0])){
                ret = false;
            }
        }
        if(ret){
            for(i in s){
                if(!fAble(s[i])){
                    ret=false;
                    break;
                }
            }
        }
    }else{ret=false};
    return ret;
};
 /**
 * 
 * @param {string} tablename The table for which a new row is to be created
 * 
 * @param {string} id An identifier for the row to be created. 

  An identifier can only include lowercase letters and numbers.  
  
  An identifier must always begin with a letter.  
 * 
 * @param {{}} columnsObject An optional object with the columns of the table as properties set to their corrsponding values.
 * If a column is not provided, `null` is used as its value.
 *
 * Accepted value types: [`String`,`Number`,`Boolean`,`Serializable objects`]
 * 
 * If value type is not accepted, `null` is used instead.
 * @param {(noscDBReturnType: boolean)=>void} callback An optional callback that is called with a boolean as argument.
 * 
 *  A `true` passed as argument to the callback indicates that a new row is succesfully created. 
 
 *  A `false` passed as argument to the callback indicates that the identifier already exists
  hence, row creation was unsuccessful. 


 */
  function _crtRow(tablename,id,columnsObject,callback){
    _createRow(tablename,id,0,this,columnsObject,callback);
};
/**
 * 
 * @param {string} tablename The table for which a new row is to be created
 * 
 * @param {string} id An identifier for the row to be created. 
 * 
 * @param {{}} columnsObject An object with the columns of the table as properties set to their corrsponding values.
 * If a column is not provided, `null` is used as its value.
 * 
 * Accepted value types: [`String`,`Number`,`Boolean`,`Serializable objects`]
 * 
 * If value type is not accepted, `null` is used instead.
 * @param {(noscDBReturnType: boolean)=>void} callback An optional callback that is called with a boolean as argument.
 * 
 *  A `true` passed as argument to the callback indicates that a new row is succesfully created. 
 
 *  A `false` passed as argument to the callback indicates that the identifier already exists
  hence, row creation was unsuccessful. 
 *
 */
function _crtDrow(tablename,id,columnsObject,callback){
    _createRow(tablename,id,1,this,columnsObject,callback);
};
/**
 * Upadtes a row in a table.
 * @param {string} tablename The table for which a row is to be updated.
 * @param {string} id The identifier of the row to update.
 * @param {{}} columnsObject An `object` with the column(s) to update as properties set to their corresponding values.
 * 
 * Accepted value types: [`String`,`Number`,`Boolean`,`Serializable objects`]
 * 
 * If value type is not accepted, `null` is used instead.
 * @param {(noscDBReturnType: boolean)=>void} callback An `'Optional'` callback that receives a `boolean` as an argument
 * indicating whether updation was successful or not.
 *  
 */
 function _updateRow(tablename,id,columnsObject,callback){
    _updteRow(tablename,id,columnsObject,0,this,callback);
 };
/**
 * Upadtes a row in a dispersed table.
 * @param {string} tablename The table for which a row is to be updated.
 * @param {string} id The identifier of the row to update.
 * @param {{}} columnsObject An `object` with the column(s) to update as properties set to their corresponding values.
 * 
 * Accepted value types: [`String`,`Number`,`Boolean`,`Serializable objects`]
 * 
 * If value type is not accepted, `null` is used instead.
 * @param {(noscDBReturnType: boolean)=>void} callback An `'Optional'` callback that receives a `boolean` as an argument
 * indicating whether updation was successful or not.
 *  
 */
  function _updateDRow(tablename,id,columnsObject,callback){
    _updteRow(tablename,id,columnsObject,1,this,callback);
 };
 function dirCount(a){
    let s=1;
    while(a>MAX_DROW_RECUR){
        a-=MAX_DROW_RECUR;
        s++;
    }
    return s;
};
function _searcher(s,path,id,callback){
    
    if(s>0){
        _check4dirNoChecks(path+s+"/"+id,function(ex){
            if(ex){
                callback(true,s);
                return;
            }
            _searcher(s-1,path,id,callback);
        });
        return;
    }
    callback(false);

};
var allRowsCallCount=0;
var allRowsOnEndTracker=[];
var allRowsCallEnded=[];
var allRowsOnEndCallbacks=[];
var stopDataRetreival = [];
var allOperations = [];
function _allRowsOnData(path,callbacksArr,callerId,callback){
    if(!stopDataRetreival[callerId][0]){
        allRowsCallEnded[callerId]=false;
        fsm.readFile(path+"/r"+db_EXT,"utf8",function(err,data){
            if(err){
                callbacksArr=null;
                allRowsOnEndTracker[callerId][0]+=1;
                if(allRowsOnEndTracker[callerId][0]===allRowsOnEndTracker[callerId][1]){
                    allRowsCallEnded[callerId]=true;
                    allOperations[callerId]=null;
                    var x;
                    for(x in allRowsOnEndCallbacks[callerId]){
                        allRowsOnEndCallbacks[callerId][x]();
                        allRowsOnEndCallbacks[callerId][x]=null;
                    }
                    allRowsOnEndCallbacks[callerId]=null;
                    if(!allRowsCallEnded.includes(false)){
                        allRowsCallCount=0;
                        allRowsOnEndTracker=[];
                        allRowsCallEnded=[];
                        allRowsOnEndCallbacks=[];
                        stopDataRetreival=[];
                        allOperations=[];
                    }
                }
                return;
            }
            var func,Data,i;
            try {
                func= new Function(`return ${data}`);
                data=null;
                Data=func();
                func=null;
            } catch (error) {
                Data = null;
                data = null;
            }
            for(i in callbacksArr){
                callbacksArr[i](Data);
                callbacksArr[i]=null;
            }
            Data=null;
            callbacksArr=null;
            allRowsOnEndTracker[callerId][0]+=1;
            if(allRowsOnEndTracker[callerId][0]===allRowsOnEndTracker[callerId][1]){
                allRowsCallEnded[callerId]=true;
                allOperations[callerId]=null;
                for(i in allRowsOnEndCallbacks[callerId]){
                    allRowsOnEndCallbacks[callerId][i]();
                    allRowsOnEndCallbacks[callerId][i]=null;
                }
                allRowsOnEndCallbacks[callerId]=null;
                if(!allRowsCallEnded.includes(false)){
                    allRowsCallCount=0;
                    allRowsOnEndTracker=[];
                    allRowsCallEnded=[];
                    allRowsOnEndCallbacks=[];
                    stopDataRetreival=[];
                    allOperations=[];
                }
            }else{callback()}
            
            
        });
    }else{
        if(!stopDataRetreival[callerId][1]){
            allRowsCallEnded[callerId]=true;
            stopDataRetreival[callerId][1]=true;
            allOperations[callerId]=null;
            var i;
            for(i in allRowsOnEndCallbacks[callerId]){
                allRowsOnEndCallbacks[callerId][i]();
                allRowsOnEndCallbacks[callerId][i]=null;
            }
            allRowsOnEndCallbacks[callerId]=null;
            if(!allRowsCallEnded.includes(false)){
                allRowsCallCount=0;
                allRowsOnEndTracker=[];
                allRowsCallEnded=[];
                allRowsOnEndCallbacks=[];
                stopDataRetreival=[];
                allOperations=[];
            }
        }
    }
};
/**
 * Gets all rows data in a table.
 * @param {string} tablename A table from which to get all rows data.
 * 
 *@returns A `Data Event Object` if tablename provided exists else, returns `void`
 * ---
 * #### NOTE:
 *
 * Rows data are retrieved in a sequential manner. 
 * Use the `ondata` and the `onend` properties of the 
 * `Data Event Object` returned to handle each row's data retrived.
 * 
 */
function _getAllRows_t(tablename){
    var _path=this[n_ne]();
    return _getAllRows(_path,tablename,0,this);
};
/**
 * Gets all rows data in a table.
 * @param {string} tablename A table from which to get all rows data.
 * 
 *@returns A `Data Event Object` if tablename provided exists else, returns `void`
 * ---
 * #### NOTE:

 * Rows data are retrieved in a sequential manner. 
 * Use the `ondata` and the `onend` properties of the 
 * `Data Event Object` returned to handle each row's data retrived.
 * 
 */
 function _getAllRows_d(tablename){
    var _path=this[n_ne]();
    if(Databases[_path]){
        if(Databases[_path].dTables.includes(tablename)){
            let i=Databases[_path].dTablesObject[tablename].rows;
            if(i>0){
                return _getAllRows(_path,tablename,i,this);
            }
        }
    }
};
function updateAllowedTypes(t){
    let types=["string","object","number","boolean"];
    if(!types.includes(t)){return false;}
    return true;
};
function toString(item){
    if(typeof (item)==="function"){
        return item.toString();
    }else{
        try {
            return JSON.stringify(item);
        } catch (error) {
            return "null";
        }
    }
};
function resolveName(name){
    if(string(name)&&""!==name){
        if(/[^0-9a-zA-Z]/.test(name)){
            var i,s="a";
            for(i in name){
                if(/[^0-9a-zA-Z]/.test(name[i])){
                    s+=`${name[i].charCodeAt(0)}`;
                }else{
                    s+=name[i];
                }
            };
            return s.toLowerCase();
        }else{
            return `a${name.toLowerCase()}`;
        }
    };
    return "?|\\/*.\\/";
 };
 /**
 * 
 * @param {string} path 
 * @param {string} dirArr 
 * @param {0} start 
 * @param {(ReturnType:boolean)} callback 
 */
function _recreateDir(path,dirArr,start,callback){
    if(start<dirArr.length){
        _createDirr(path+"/"+dirArr[start],function(res){
            
           if(res){
                _recreateDir(path,dirArr,start+1,callback);
                return;
           }
           if(typeof (callback)==="function"){callback(false);}
        });
        return;
    }
    if(typeof (callback)==="function"){callback(true);}
    
};
function recreateDBFile(path,dirArr,start,callback,data){
    if(start<dirArr.length){
        create_File(path+"/"+dirArr[start][0]+db_EXT,dirArr[start][1],function(s){
            if(s){
                recreateDBFile(path,dirArr,start+1,callback);
            }else{
                if(typeof (callback)==="function"){callback(false);}
            }
        });
    }else{
        if(typeof (callback)==="function"){callback(true);}
    }
};
function string(){
    var i,ret=true;
    for(i in arguments){
        if(typeof (arguments[i])!=="string"){
            ret=false;break;
        }
    }
    return ret;
};
function _createDir(dir_path,callback){
    fsm.mkdir(dir_path,function(er){
        if(er){
            callback(false); //exists
            return;
        }
        callback(true);
    });
};
function getmData(path,cont,a,b,c,d,onDarr,callback,mm,dd,atoz,time,lim,end,startf){
    if(a!==b){
        if(startf.month!==''&&typeof (startf.month)!=="boolean"){
            var stdec=mm<0?a<=startf.month:a>=startf.month;
            if(!stdec){
                getmData(path,cont,a+mm,b,c,d,onDarr,callback,mm,dd,atoz,time,lim,end,startf);
                return;
            }else{
                startf.month=true;
            }
        }
        if(cont.includes(a+"")){
            fsm.readdir(path+"/"+a,"utf8",(err,content)=>{
                if(err){
                    getmData(path,cont,a+mm,b,c,d,onDarr,callback,mm,dd,atoz,time,lim,end,startf);
                    return;
                }
                getdData(path+"/"+a,content,c,d,onDarr,()=>{
                    getmData(path,cont,a+mm,b,c,d,onDarr,callback,mm,dd,atoz,time,lim,end,startf);
                },dd,atoz,time,lim,end,startf);
            });
            return;
        }
        getmData(path,cont,a+mm,b,c,d,onDarr,callback,mm,dd,atoz,time,lim,end,startf);
    }else{
        if(cont.includes(a+"")){
            fsm.readdir(path+"/"+a,"utf8",(err,content)=>{
                if(err){
                    cont = null,content=null;
                    callback();
                    return;
                }
                getdData(path+"/"+a,content,c,d,onDarr,callback,dd,atoz,time,lim,end,startf);
            });
            return;
        }
        cont = null;
        callback();
    }
};
function getdData(path,cont,a,b,onDarr,callback,dd,atoz,time,lim,end,startf){
    if(a!==b){
        if(startf.day!==''&&typeof (startf.day)!=="boolean"){
            var stdec=dd<0?a<=startf.day:a>=startf.day;
            if(!stdec){
                getdData(path,cont,a+dd,b,onDarr,callback,dd,atoz,time,lim,end,startf);
                return;
            }else{
                startf.day=true;
            }
        }
        if(cont.includes(a+"")){
            fsm.readdir(path+"/"+a,"utf8",(err,content)=>{
                if(err){
                    getdData(path,cont,a+dd,b,onDarr,callback,dd,atoz,time,lim,end,startf);
                    return;
                }
                if(atoz){
                    content.sort();
                }else{
                    content.sort().reverse();
                }
                retriveData(path+"/"+a,content,0,onDarr,()=>{
                    getdData(path,cont,a+dd,b,onDarr,callback,dd,atoz,time,lim,end,startf);
                },time,lim,end,startf,atoz);
            });
            return;
        }
        getdData(path,cont,a+dd,b,onDarr,callback,dd,atoz,time,lim,end,startf);
    }else{
        if(cont.includes(a+"")){
            fsm.readdir(path+"/"+a,"utf8",(err,content)=>{
                if(err){
                    cont = null,content=null;
                    callback();
                    return;
                }
                if(atoz){
                    content.sort();
                }else{
                    content.sort().reverse();
                }
                retriveData(path+"/"+a,content,0,onDarr,callback,time,lim,end,startf,atoz);
            });
            return;
        }
        cont = null;
        callback();
    }
};
function retriveData(path,cont,file,onDarr,callback,time,lim,end,startf,atoz){
    if(end.end){
        cont=null;
        return;
    }
    if(lim.start>1){
        lim.start--;
        if(file<cont.length){
            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
        }else{
            cont=null;
            callback();
        }
        
    }else if((file<cont.length&&lim.diff!==0)){
        if(cont[file].endsWith(db_EXT)&&cont[file].split(".").length===2){
            if(!string(time.hr)){
                if(typeof (time.hr)==='number'){
                    if(!string(time.min)){
                        if(typeof (time.min)==="number"){
                            if(!string(time.sec)){
                                if(typeof (time.sec)==="number"){
                                    if((cont[file]===""+zeroTime(time.hr)+"d"+zeroTime(time.min)+"d"+zeroTime(time.sec)+db_EXT)/*||(typeof (time.endSTART)==="boolean"&&time.endSTART)*/){
                                        /*if(time.end){
                                            time.endSTART=true;
                                        }*/
                                        fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                            if(er){
                                                var i;
                                                for(i in onDarr){
                                                    onDarr[i](null);
                                                }
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                return;
                                            }
                                            var i;
                                            try {
                                                data = chainDispersedData(JSON.parse(data),time.withTime);
                                            } catch (error) {
                                                data=null;
                                            }
                                            for(i in onDarr){
                                                onDarr[i](data);
                                            }
                                            data=null;
                                            lim.diff--;
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        });
                                    }else{
                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    }
                                }else{
                                    var sp = cont[file].split("d"),spm=Number(sp[2].split(".")[0]);
                                    if(spm>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                    if(spm<=time.sec.to&&spm>=time.sec.from&&cont[file].startsWith(""+zeroTime(time.hr)+"d"+zeroTime(time.min))){
                                        if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                            var stdec=atoz?spm>=startf.second:spm<=startf.second;
                                            if(!stdec){
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                return;
                                            }else{
                                                startf.second=true;
                                            }
                                        }
                                        fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                            if(er){
                                                var i;
                                                for(i in onDarr){
                                                    onDarr[i](null);
                                                }
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                return;
                                            }
                                            var i;
                                            try {
                                                data = chainDispersedData(JSON.parse(data),time.withTime);
                                            } catch (error) {
                                                data=null;
                                            }
                                            for(i in onDarr){
                                                onDarr[i](data);
                                            }
                                            data=null;
                                            lim.diff--;
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        });
                                    }else{
                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    }
                                }
                            }else{
                                var sp = cont[file].split("d"),sps=Number(sp[2].split(".")[0]);
                                if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                    let stdec=atoz?sps>=startf.second:sps<=startf.second;
                                    if(!stdec){
                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        return;
                                    }else{
                                        startf.second=true;
                                    }
                                }
                                if(cont[file].startsWith(""+zeroTime(time.hr)+"d"+zeroTime(time.min))){
                                    fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                        if(er){
                                            var i;
                                            for(i in onDarr){
                                                onDarr[i](null);
                                            }
                                            lim.diff--;
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            return;
                                        }
                                        var i;
                                        try {
                                            data = chainDispersedData(JSON.parse(data),time.withTime);
                                        } catch (error) {
                                            data=null;
                                        }
                                        for(i in onDarr){
                                            onDarr[i](data);
                                        }
                                        data=null;
                                        lim.diff--;
                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    });
                                }else{
                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                }
                            }
                        }else{
                            var sp = cont[file].split("d"),spm=Number(sp[1]);
                            if(spm>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                            if(spm<=time.min.to&&spm>=time.min.from&&cont[file].startsWith(""+zeroTime(time.hr))){
                                if(startf.minute!==''&&typeof (startf.minute)!=="boolean"){
                                    let stdec=atoz?spm>=startf.minute:spm<=startf.minute;
                                    if(!stdec){
                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        return;
                                    }else{
                                        startf.minute=true;
                                    }
                                }
                                if(!string(time.sec)){
                                    if(typeof (time.sec)==="number"){
                                        if(cont[file]===""+zeroTime(time.hr)+"d"+zeroTime(spm)+"d"+zeroTime(time.sec)+db_EXT/*||(typeof (time.endSTART)==="boolean"&&time.endSTART)*/){
                                            /*if(time.end){time.endSTART=true}*/
                                            fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                                if(er){
                                                    var i;
                                                    for(i in onDarr){
                                                        onDarr[i](null);
                                                    }
                                                    lim.diff--;
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                    return;
                                                }
                                                var i;
                                                try {
                                                    data = chainDispersedData(JSON.parse(data),time.withTime);
                                                } catch (error) {
                                                    data=null;
                                                }
                                                for(i in onDarr){
                                                    onDarr[i](data);
                                                }
                                                data=null;
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            });
                                        }else{
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        }
                                    }else{
                                        var sps=Number(sp[2].split(".")[0]);
                                        if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                        if(sps<=time.sec.to&&sps>=time.sec.from){
                                            if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                                let stdec=atoz?sps>=startf.second:sps<=startf.second;
                                                if(!stdec){
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                    return;
                                                }else{
                                                    startf.second=true;
                                                }
                                            }
                                            fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                                if(er){
                                                    var i;
                                                    for(i in onDarr){
                                                        onDarr[i](null);
                                                    }
                                                    lim.diff--;
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                    return;
                                                }
                                                var i;
                                                try {
                                                    data = chainDispersedData(JSON.parse(data),time.withTime);
                                                } catch (error) {
                                                    data=null;
                                                }
                                                for(i in onDarr){
                                                    onDarr[i](data);
                                                }
                                                data=null;
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            });
                                        }else{
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        }
                                    }
                                }else{
                                    var sps=Number(sp[2].split(".")[0]);
                                    if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                    if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                        let stdec=atoz?sps>=startf.second:sps<=startf.second;
                                        if(!stdec){
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            return;
                                        }else{
                                            startf.second=true;
                                        }
                                    }
                                    if(cont[file].startsWith(""+zeroTime(time.hr)+"d"+zeroTime(spm))){
                                        fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                            if(er){
                                                var i;
                                                for(i in onDarr){
                                                    onDarr[i](null);
                                                }
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                return;
                                            }
                                            var i;
                                            try {
                                                data = chainDispersedData(JSON.parse(data),time.withTime);
                                            } catch (error) {
                                                data=null;
                                            }
                                            for(i in onDarr){
                                                onDarr[i](data);
                                            }
                                            data=null;
                                            lim.diff--;
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        });
                                    }else{
                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    }
                                }
                            }else{
                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                            }
                        }
                    }else{
                        var sp = cont[file].split("d"),spm=Number(sp[1]);
                        if(spm>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                        if(startf.minute!==''&&typeof (startf.minute)!=="boolean"){
                            let stdec=atoz?spm>=startf.minute:spm<=startf.minute;
                            if(!stdec){
                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                return;
                            }else{
                                startf.minute=true;
                            }
                        }
                        var sps=Number(sp[2].split(".")[0]);
                        if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                        if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                            let stdec1=atoz?sps>=startf.second:sps<=startf.second;
                            if(!stdec1){
                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                return;
                            }else{
                                startf.second=true;
                            }
                        }
                        if(cont[file].startsWith(""+zeroTime(time.hr))){
                            fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                if(er){
                                    var i;
                                    for(i in onDarr){
                                        onDarr[i](null);
                                    }
                                    lim.diff--;
                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    return;
                                }
                                var i;
                                try {
                                    data = chainDispersedData(JSON.parse(data),time.withTime);
                                } catch (error) {
                                    data=null;
                                }
                                for(i in onDarr){
                                    onDarr[i](data);
                                }
                                data=null;
                                lim.diff--;
                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                            });
                        }else{
                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                        }
                    }
                }else{
                    var sp = cont[file].split("d"),sph=Number(sp[0]);
                    if(sph>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                    if(sph<=time.hr.to&&sph>=time.hr.from){
                        if(startf.hour!==''&&typeof (startf.hour)!=="boolean"){
                            let stdec=atoz?sph>=startf.hour:sph<=startf.hour;
                            if(!stdec){
                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                return;
                            }else{
                                startf.hour=true;
                            }
                        }
                        if(!string(time.min)){
                            if(typeof (time.min)==="number"){
                                if(!string(time.sec)){
                                    if(typeof (time.sec)==="number"){
                                        if(cont[file]===""+zeroTime(sph)+"d"+zeroTime(time.min)+"d"+zeroTime(time.sec)+db_EXT/*||(typeof (time.endSTART)==="boolean"&&time.endSTART)*/){
                                            /*if(time.end){time.endSTART=true}*/
                                            fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                                if(er){
                                                    var i;
                                                    for(i in onDarr){
                                                        onDarr[i](null);
                                                    }
                                                    lim.diff--;
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                    return;
                                                }
                                                var i;
                                                try {
                                                    data = chainDispersedData(JSON.parse(data),time.withTime);
                                                } catch (error) {
                                                    data=null;
                                                }
                                                for(i in onDarr){
                                                    onDarr[i](data);
                                                }
                                                data=null;
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            });
                                        }else{
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        }
                                    }else{
                                        var sps=Number(sp[2].split(".")[0]);
                                        if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                        if(sps<=time.sec.to&&sps>=time.sec.from&&cont[file].startsWith(""+zeroTime(sph)+"d"+zeroTime(time.min))){
                                            if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                                let stdec=atoz?sps>=startf.second:sps<=startf.second;
                                                if(!stdec){
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                    return;
                                                }else{
                                                    startf.second=true;
                                                }
                                            }
                                            fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                                if(er){
                                                    var i;
                                                    for(i in onDarr){
                                                        onDarr[i](null);
                                                    }
                                                    lim.diff--;
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                    return;
                                                }
                                                var i;
                                                try {
                                                    data = chainDispersedData(JSON.parse(data),time.withTime);
                                                } catch (error) {
                                                    data=null;
                                                }
                                                for(i in onDarr){
                                                    onDarr[i](data);
                                                }
                                                data=null;
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            });
                                        }else{
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        }
                                    }
                                }else{
                                    var sps=Number(sp[2].split(".")[0]);
                                    if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                    if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                        let stdec=atoz?sps>=startf.second:sps<=startf.second;
                                        if(!stdec){
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            return;
                                        }else{
                                            startf.second=true;
                                        }
                                    }
                                    if(cont[file].startsWith(""+zeroTime(sph)+"d"+zeroTime(time.min))){
                                        fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                            if(er){
                                                var i;
                                                for(i in onDarr){
                                                    onDarr[i](null);
                                                }
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                return;
                                            }
                                            var i;
                                            try {
                                                data = chainDispersedData(JSON.parse(data),time.withTime);
                                            } catch (error) {
                                                data=null;
                                            }
                                            for(i in onDarr){
                                                onDarr[i](data);
                                            }
                                            data=null;
                                            lim.diff--;
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        });
                                    }else{
                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    }
                                }
                            }else{
                                var spm=Number(sp[1]);
                                if(spm>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                if(spm<=time.min.to&&spm>=time.min.from&&cont[file].startsWith(""+zeroTime(sph))){
                                    if(startf.minute!==''&&typeof (startf.minute)!=="boolean"){
                                        let stdec=atoz?spm>=startf.minute:spm<=startf.minute;
                                        if(!stdec){
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            return;
                                        }else{
                                            startf.minute=true;
                                        }
                                    }
                                    if(!string(time.sec)){
                                        if(typeof (time.sec)==="number"){
                                            if(cont[file]===""+zeroTime(sph)+"d"+zeroTime(spm)+"d"+zeroTime(time.sec)+db_EXT/*||(typeof (time.endSTART)==="boolean"&&time.endSTART)*/){
                                                //if(time.end){time.endSTART=true}
                                                fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                                    if(er){
                                                        var i;
                                                        for(i in onDarr){
                                                            onDarr[i](null);
                                                        }
                                                        lim.diff--;
                                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                        return;
                                                    }
                                                    var i;
                                                    try {
                                                        data = chainDispersedData(JSON.parse(data),time.withTime);
                                                    } catch (error) {
                                                        data=null;
                                                    }
                                                    for(i in onDarr){
                                                        onDarr[i](data);
                                                    }
                                                    data=null;
                                                    lim.diff--;
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                });
                                            }else{
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            }
                                        }else{
                                            var sps=Number(sp[2].split(".")[0]);
                                            if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                            if(sps<=time.sec.to&&sps>=time.sec.from){
                                                if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                                    let stdec=atoz?sps>=startf.second:sps<=startf.second;
                                                    if(!stdec){
                                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                        return;
                                                    }else{
                                                        startf.second=true;
                                                    }
                                                }
                                                fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                                    if(er){
                                                        var i;
                                                        for(i in onDarr){
                                                            onDarr[i](null);
                                                        }
                                                        lim.diff--;
                                                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                        return;
                                                    }
                                                    var i;
                                                    try {
                                                        data = chainDispersedData(JSON.parse(data),time.withTime);
                                                    } catch (error) {
                                                        data=null;
                                                    }
                                                    for(i in onDarr){
                                                        onDarr[i](data);
                                                    }
                                                    data=null;
                                                    lim.diff--;
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                });
                                            }else{
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            }
                                        }
                                    }else{
                                        var sps=Number(sp[2].split(".")[0]);
                                        if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                                        if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                                            let stdec=atoz?sps>=startf.second:sps<=startf.second;
                                            if(!stdec){
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                return;
                                            }else{
                                                startf.second=true;
                                            }
                                        }
                                        //if(cont[file].startsWith(""+time.hr+"d"+time.min)){
                                            fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                                if(er){
                                                    var i;
                                                    for(i in onDarr){
                                                        onDarr[i](null);
                                                    }
                                                    lim.diff--;
                                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                                    return;
                                                }
                                                var i;
                                                try {
                                                    data = chainDispersedData(JSON.parse(data),time.withTime);
                                                } catch (error) {
                                                    data=null;
                                                }
                                                for(i in onDarr){
                                                    onDarr[i](data);
                                                }
                                                data=null;
                                                lim.diff--;
                                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                            });
                                        /*}else{
                                            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                        }*/
                                    }
                                }else{
                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                }
                            }
                        }else{
                            var spm=Number(sp[1]);
                            if(spm>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                            if(startf.minute!==''&&typeof (startf.minute)!=="boolean"){
                                let stdec=atoz?spm>=startf.minute:spm<=startf.minute;
                                if(!stdec){
                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    return;
                                }else{
                                    startf.minute=true;
                                }
                            }
                            fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                                if(er){
                                    var i;
                                    for(i in onDarr){
                                        onDarr[i](null);
                                    }
                                    lim.diff--;
                                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                                    return;
                                }
                                var i;
                                try {
                                    data = chainDispersedData(JSON.parse(data),time.withTime);
                                } catch (error) {
                                    data=null;
                                }
                                for(i in onDarr){
                                    onDarr[i](data);
                                }
                                data=null;
                                lim.diff--;
                                retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                            });
                        }
                    }else{
                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                    }
                }
            }else{
                var sp = cont[file].split("d"),sph=Number(sp[0]);
                if(sph>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                if(startf.hour!==''&&typeof (startf.hour)!=="boolean"){
                    let stdec1=atoz?sph>=startf.hour:sph<=startf.hour;
                    if(!stdec1){
                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                        return;
                    }else{
                        startf.hour=true;
                    }
                }
                var spm=Number(sp[1]);
                if(spm>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                if(startf.minute!==''&&typeof (startf.minute)!=="boolean"){
                    let stdec2=atoz?spm>=startf.minute:spm<=startf.minute;
                    if(!stdec2){
                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                        return;
                    }else{
                        startf.minute=true;
                    }
                }
                var sps=Number(sp[2].split(".")[0]);
                if(sps>=0){}else{retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);return;}
                if(startf.second!==''&&typeof (startf.second)!=="boolean"){
                    let stdec3=atoz?sps>=startf.second:sps<=startf.second;
                    if(!stdec3){
                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                        return;
                    }else{
                        startf.second=true;
                    }
                }
                fsm.readFile(path+"/"+cont[file],"utf8",(er,data)=>{
                    if(er){
                        var i;
                        for(i in onDarr){
                            onDarr[i](null);
                        }
                        lim.diff--;
                        retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                        return;
                    }
                    var i;
                    try {
                        data = chainDispersedData(JSON.parse(data),time.withTime);
                    } catch (error) {
                        data=null;
                    }
                    for(i in onDarr){
                        onDarr[i](data);
                    }
                    data=null;
                    lim.diff--;
                    retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
                });
            }
        }else{
            retriveData(path,cont,file+1,onDarr,callback,time,lim,end,startf,atoz);
        }
    }else{
        cont=null;
        callback();
    }
};
function chainDispersedData(data,withTime){
    var i,chainedData=[],dt=data.$time.created;
    if(withTime){
        if(withTime===1){
            for(i=0;i<data.length;i++){
                data[i].$time = data.$time;
                chainedData.push(data[i]);
                data[i]=null;
            }
        }else{
            for(i=0;i<data.length;i++){
                data[i].$timestamp = data.$time.created.stamp;
                chainedData.push(data[i]);
                data[i]=null;
            }
        }
    }else{
        for(i=0;i<data.length;i++){
            chainedData.push(data[i]);
            data[i]=null;
        }
    }
    data=null;
    ndbServer?chainedData.push(dt):1;
    return chainedData;
};
function zeroTime(a){if(a<10){return `0${a}`;}else{return `${a}`;}};
function toJSON(text){return new Function(`var a;try{a=${text};}catch(e){a=null;}return a;`)();};
//Asynchronise set up
function setAsyncDBObject(database_path,callback,extName){
    var dir=database_path.split("/").pop();
    if(!dir.includes(".")){
        if(typeof (Databases[database_path])==="undefined"){
            Databases[""].push(database_path);
            _check4dirNoChecks(database_path,function(path_exists){
                if(!path_exists){
                    Err("No such directory exists. Ref: "+[database_path]);
                }
                _recreateDir(database_path,["t","d"],0,function(c){
                    if(c){
                        Databases[database_path]={tablesObject:{},dTablesObject:{},dataPath:database_path,tables:[],dTables:[]};
                        if(extName!==""){Databases["***"][extName]=database_path;}
                        const DBobject={
                            PATH:database_path,
                            TABLES:{},
                            DISPERSEDTABLES:{},
                            setExternal:_setExt,
                            N_ofRows:_N_Rows,
                            N_ofDispersedRows:_N_dRows,
                            updateRow:_updateRow,
                            updateDispersedRow:_updateDRow,
                            getRow:_getRow,
                            getDispersedRow:_getDRow,
                            getAllRows:_getAllRows_t,
                            getAllDispersedRows:_getAllRows_d,
                            createRow:_crtRow,
                            createDispersedRow:_crtDrow,
                            createTable:_createTable,
                            createDispersedTable:_createDtable,
                            writeToDispersedStorage:_wToDStorage,
                            readFromDispersedStorage:readFromDT,
                            rowExists:_exists,
                            dispersedRowExists:_existsD,
                            delRow:_delRow,
                            delDispersedRow:_delDRow,
                            delAllRows:_delAllRows,
                            delAllDispersedRows:_delAllDRows,
                            delDispersedStorageData:_delDMessage,
                            updateDispersedStorageData:_updateDMessage,
                            getDispersedStorageData:_getDMessage
                        };
                        DBobject[n_ne]=function(){return database_path;};
                        callback=callback.bind(DBobject);
                        callback(DBobject);
                    }
                });
            });
        }else{
            Err("Database with path: '"+[database_path]+"' is in use...");
        }
    }else{
        Err("Unaccepted database path. Ref: "+[database_path]);
    }
};
//Synchronise set up
function getSyncDBObject(database_path,callback,extName){
    var dir=database_path.split("/").pop();
    if(!dir.includes(".")){
        if(typeof (Databases[database_path])==="undefined"){
            var y=fs.existsSync(database_path);
            if(y){
                let ff=fs.existsSync(database_path+"/t");
                if(!ff){
                    fs.mkdirSync(database_path+"/t");
                }
                let ss=fs.existsSync(database_path+"/d");
                if(!ss){
                    fs.mkdirSync(database_path+"/d");
                }
                var dataPath="";
                Databases[dataPath].push(database_path);
                dataPath=database_path;
                Databases[database_path]={tablesObject:{},dTablesObject:{},dataPath:database_path,tables:[],dTables:[]};
                if(extName!==""){Databases["***"][extName]=database_path;}
                const DBobject={
                    PATH:dataPath,
                    TABLES:{},
                    DISPERSEDTABLES:{},
                    setExternal:_setExt,
                    N_ofRows:_N_Rows,
                    N_ofDispersedRows:_N_dRows,
                    updateRow:_updateRow,
                    updateDispersedRow:_updateDRow,
                    getRow:_getRow,
                    getDispersedRow:_getDRow,
                    getAllRows:_getAllRows_t,
                    getAllDispersedRows:_getAllRows_d,
                    createRow:_crtRow,
                    createDispersedRow:_crtDrow,
                    createTable:_createTable,
                    createDispersedTable:_createDtable,
                    writeToDispersedStorage:_wToDStorage,
                    readFromDispersedStorage:readFromDT,
                    rowExists:_exists,
                    dispersedRowExists:_existsD,
                    delRow:_delRow,
                    delDispersedRow:_delDRow,
                    delAllRows:_delAllRows,
                    delAllDispersedRows:_delAllDRows,
                    delDispersedStorageData:_delDMessage,
                    updateDispersedStorageData:_updateDMessage,
                    getDispersedStorageData:_getDMessage
                };
                DBobject[n_ne]=function(){return dataPath;};
                if(typeof (callback)==="function"){
                    callback=callback.bind(DBobject);
                    callback(DBobject);
                };
                return DBobject;
            }
            Err("No such directory exists. Ref: "+[database_path]);
        }else{
            Err("Database with path: '"+[database_path]+"' is in use...");
        }
    }else{
        Err("Unaccepted database path. Ref: "+[database_path]);
    }
    
};
function nullifyObject(a){
    var i;
    for(i in a){
        a[i]=null;
    }
};

//---------------------End of helping functions---------------------------


/**
 * Reads data from dispersed storage. Data is retrieved in a sequential manner. 
 * Use the `'ondata'` and the `'onend'` properties of the object returned to handle data retrieved.
 * 
 * @param {{tablename:string,id:string,storageColumn:string}} o 
 * An object with the table name, id and the dispersed storage column to retreive data from. 
 * @param {(noscDBReturnType:void)=>void} errorCallback `'Optional'` A callback that will be called only if an error occurs.
 * 
 */
 function readFromDT(o,errorCallback){
    var _path=this[n_ne](),callback=errorCallback;
    var year = "-/*\\.\\/+",limit={start:1,end:-1},lim=false;
    var mfrom = "", mto = "", dfrom = "", dto = "",end={end:false},idd=o.id,startf={month:'',day:'',hour:'',minute:'',second:''};
    var ondataFuncs = [],acceptOnDataFuncs = true,onendFuncs = [],acceptOnEndFuncs = true,allowStartF=true;
    var allowDate = true,atoz=true,Time={hr:"",min:"",sec:"",end:false,withTime:false},allowTime = true;
    o.id=resolveName(o.id);
    var dt=Databases[_path].dTablesObject[o.tablename].rows;
    _searcher(dirCount(dt),_path+"/d/"+o.tablename+"/d",o.id,function(ex,ii){
        if(ex){
            allowDate = false,acceptOnDataFuncs=false,acceptOnEndFuncs=false;allowTime = false;
            fsm.readdir(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+year,"utf8",(er,content)=>{
                if(er){
                        callback({
                            message:`Can't find some files in database.`,code:`INERR`
                        });
                    return;
                }
                if(string(mfrom,dfrom)){
                        callback({message:`A date field was not specified.`,code:`W_ARGS`});
                    return;
                }
                if(string(mto)){
                    mto = mfrom;
                }
                if(string(dto)){
                    dto = dfrom;
                }
                var mdif = mto - mfrom,ddif = dto - dfrom,m,d;
                if(mdif<0){
                    m=-1;
                }else{
                    m=1;
                }
                if(ddif<0){
                    d=-1;
                }else{
                    d=1;
                }
                lim=true;allowStartF=false;
                if(limit.end<0){limit.diff=-1}else{limit.diff=(limit.end-limit.start)+1;}
                getmData(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+year,content,mfrom,mto,dfrom,dto,ondataFuncs,()=>{
                    end.end=true;
                    var i;
                    for(i in onendFuncs){
                        onendFuncs[i]();
                    }
                },m,d,atoz,Time,limit,end,startf);
                
            });
            return;
        }
            callback({message:`Can't find the ID: <${idd}> in database.`,code:`INERR`});
    });
    return {
        
        /**
         * `Required` 
         * 
         * @param {number} yr The `year` must always be a `number` corresponding to the year from which to retreive data. 
         * @param {{from:number,to:number}|number} month **RANGE**: 1 to 12. [January to December]
         * 
         * The `month` is either a `number` corresponding to the month in which 
         * data is to be retreived or an `object` with two properties; `from`: the start month and `to`: the end month from which data is to be retreived.
         *  
         * 
         * @param {{from:number,to:number}|number} day **RANGE**: 1 to 31.
         * 
         * The `day` is either a `number` corresponding to the day in which 
         * data is to be retreived or an `object` with two properties; `from`: the start day and `to`: the end day from which data is to be retreived.
         * 
         *
         * 
         */
        date:function(yr,month,day){
            if(allowDate){
                if(typeof (yr)==="number"){
                    if(typeof (month)==="number"){
                        if(month>0&&month<13){
                            if(typeof (day)==="number"){
                                if(day>0&&day<32){
                                    year = yr+"";
                                    mfrom = month;
                                    dfrom = day;
                                    allowDate = false;
                                }
                            }else if(typeof (day)==="object"&&null!==day){
                                if(typeof (day.from)==="number"&&typeof (day.to)==="number"){
                                    if(day.from>0&&day.from<32&&day.to>0&&day.to<32){
                                        year = yr+"";
                                        mfrom = month;
                                        dfrom = day.from;
                                        dto = day.to;
                                        allowDate=false;
                                    }
                                }
                            }
                        }
                    }else if(typeof (month)==="object"&&null!==month){
                        if(typeof (month.from)==="number"&&typeof (month.to)==="number"){
                            if(month.from>0&&month.from<13&&month.to>0&&month.to<13){
                                if(typeof (day)==="number"){
                                    if(day>0&&day<32){
                                        year = yr+"";
                                        mfrom = month.from;
                                        mto = month.to;
                                        dfrom = day;
                                        allowDate = false;
                                    }
                                }else if(typeof (day)==="object"&&null!==day){
                                    if(typeof (day.from)==="number"&&typeof (day.to)==="number"){
                                        if(day.from>0&&day.from<32&&day.to>0&&day.to<32){
                                            year = yr+"";
                                            mfrom = month.from;
                                            mto = month.to;
                                            dfrom = day.from;
                                            dto = day.to;
                                            allowDate=false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return this;
        },
        /**
         * 
         * @param {number|{from:number,to:number}} hour **RANGE**: 0 to 23. [Uses the 24-Hour format]
         * 
         * The `hour` is either a `number` corresponding to the hour in which 
         * data is to be retreived or an `object` with two properties; `from`: the start hour and `to`: the end hour from which data is to be retreived.
         *  
         * 
         * 
         * @param {number|{from:number,to:number}} min **RANGE**: 0 to 59
         * 
         * The `minute` is either a `number` corresponding to the minute in which 
         * data is to be retreived or an `object` with two properties; `from`: the start minute and `to`: the end minute from which data is to be retreived.
         *  
         * 
         * 
         * @param {number|{from:number,to:number}} sec **RANGE**: 0 to 59
         * 
         * The `second` is either a `number` corresponding to the second in which 
         * data is to be retreived or an `object` with two properties; `from`: the start second and `to`: the end second from which data is to be retreived.
         *  
         * 
         * 
         * @param {boolean} end The `end` argument if provided, must be a boolean value to indicate whether to read data until there is no more
         * data within a specific **minute** starting from the `second` argument provided. 
         * Provide `true` as the argument if you wish to retreive all data within a specific minute starting from the second argument provided.
         * 
         * **REMEBER**: The direction in which data will be retreived depends on the method you choose to retreive data, ie. either `ztoa` or `atoz`
         */
        time:function(hour,min,sec,end){
            if(allowTime){
                if(typeof (end)!=="boolean"){end=false;}
                if(typeof (hour)==="number"&&hour>=0&&hour<24){
                    if(typeof (min)==="number"&&min>=0&&min<60){
                        if(typeof (sec)==="number"&&sec>=0&&sec<60){
                            allowTime = false;
                            Time.hr = hour;
                            Time.min = min;
                            Time.sec = sec;
                            Time.end = end;
                        }else if(typeof (sec)==="object"&&null!==sec){
                            if(typeof (sec.from)==="number"&&typeof (sec.to)==="number"){
                                if(sec.from>=0&&sec.from<60&&sec.to>=0&&sec.to<60&&sec.from<sec.to){
                                    allowTime = false;
                                    Time.hr = hour;
                                    Time.min = min;
                                    Time.sec = sec;
                                    Time.end = end;
                                }
                            }
                        }else{
                            allowTime = false;
                            Time.hr = hour;
                            Time.min = min;
                        }
                    }else if(typeof (min)==="object"&&null!==min){
                        if(typeof (min.from)==="number"&&typeof (min.to)==="number"){
                            if(min.from>=0&&min.from<60&&min.to>=0&&min.to<60&&min.from<min.to){
                                if(typeof (sec)==="number"&&sec>=0&&sec<60){
                                    allowTime = false;
                                    Time.hr = hour;
                                    Time.min = min;
                                    Time.sec = sec;
                                    Time.end = end;
                                }else if(typeof (sec)==="object"&&null!==sec){
                                    if(typeof (sec.from)==="number"&&typeof (sec.to)==="number"){
                                        if(sec.from>=0&&sec.from<60&&sec.to>=0&&sec.to<60&&sec.from<sec.to){
                                            allowTime = false;
                                            Time.hr = hour;
                                            Time.min = min;
                                            Time.sec = sec;
                                            Time.end = end;
                                        }
                                    }
                                }else{
                                    allowTime = false;
                                    Time.hr = hour;
                                    Time.min = min;
                                }
                            }
                        }
                    }else{
                        allowTime = false;
                        Time.hr = hour;
                    }

                }else if(typeof (hour)==="object"&&null!==hour){
                    if(typeof (hour.from)==="number"&&typeof (hour.to)==="number"){
                        if(hour.from>=0&&hour.from<24&&hour.to>=0&&hour.to<24&&hour.from<hour.to){
                            if(typeof (min)!=="number"&&min>=0&&min<60){
                                if(typeof (sec)==="number"&&sec>=0&&sec<60){
                                    allowTime = false;
                                    Time.hr = hour;
                                    Time.min = min;
                                    Time.sec = sec;
                                    Time.end = end;
                                }else if(typeof (sec)==="object"&&null!==sec){
                                    if(typeof (sec.from)==="number"&&typeof (sec.to)==="number"){
                                        if(sec.from>=0&&sec.from<60&&sec.to>=0&&sec.to<60&&sec.from<sec.to){
                                            allowTime = false;
                                            Time.hr = hour;
                                            Time.min = min;
                                            Time.sec = sec;
                                            Time.end = end;
                                        }
                                    }
                                }else{
                                    allowTime = false;
                                    Time.hr = hour;
                                    Time.min = min;
                                }
                            }else if(typeof (min)==="object"&&null!==min){
                                if(typeof (min.from)==="number"&&typeof (min.to)==="number"){
                                    if(min.from>=0&&min.from<60&&min.to>=0&&min.to<60&&min.from<min.to){
                                        if(typeof (sec)==="number"&&sec>=0&&sec<60){
                                            allowTime = false;
                                            Time.hr = hour;
                                            Time.min = min;
                                            Time.sec = sec;
                                            Time.end = end;
                                        }else if(typeof (sec)==="object"&&null!==sec){
                                            if(typeof (sec.from)==="number"&&typeof (sec.to)==="number"){
                                                if(sec.from>=0&&sec.from<60&&sec.to>=0&&sec.to<60&&sec.from<sec.to){
                                                    allowTime = false;
                                                    Time.hr = hour;
                                                    Time.min = min;
                                                    Time.sec = sec;
                                                    Time.end = end;
                                                }
                                            }
                                        }else{
                                            allowTime = false;
                                            Time.hr = hour;
                                            Time.min = min;
                                        }
                                    }
                                }
                            }else{
                                allowTime = false;
                                Time.hr = hour;
                            }
                        }
                    }
                }
            }
            return this;
        },
        /**
         * Data is retreived in ascending order with respect to the time stored in database.
         * It uses a First-In-First-Out method to retreive data.
         * 
         * `Default`
         */
        FIFO:function(){
            atoz = true;
            return this;
        },
        /**
         * Data is retreived in descending order with respect to the time stored in database.
         * It uses a Last-In-First-Out method to retreive data.
         * 
         */
        LIFO:function(){
            atoz = false;
            return this;
        },
        /**
         * 
         * @param {(noscDBReturnType: object[])=>void} callback 
         * A callback that is executed anytime data is retrieved. 
         * Data retrieved is passed as argument to the callback anytime data is retrieved.
         * 
         * ---
         * #### NOTE:

         * All `callbacks` passed as argument to this method is executed anytime data is retrieved.
         */
        ondata:function(callback){
            if(acceptOnDataFuncs&&typeof (callback)==="function"){
                ondataFuncs.push(callback);
            }
            return this;
        },
        /**
         * 
         * @param {(noscDBReturnType: void)=>void} callback 
         * A callback that is executed after all data is retrieved.
         * 
         * ---
         * #### NOTE:

         * All `callbacks` passed as argument to this method is executed after all data is retrieved.
        
         */
        onend:function(callback){
            if(acceptOnEndFuncs&&typeof (callback)==="function"){
                onendFuncs.push(callback);
            }
            return this;
        },
        /**
         * 
         * @param {{start:number|undefined,end:number|undefined}} limObject 
         * Determine the number of seconds to retreive written data. The number of data retreived may be more than expected 
         * because many data might have been written at the same second.
         * 
         * `start` Number or Undefined. 
         * 
         * `end` Number or Undefined. 
         * 
         */
        limit:function(limObject){
            if(!lim){
                if(typeof (limObject)==="object"&&null!==limObject){
                    if(typeof (limObject.start)==='number'&&typeof (limObject.end)==="number"){
                        if(limObject.start>0&&limObject.start<=limObject.end){
                            lim=true;
                            limit.start=limObject.start;
                            limit.end=limObject.end;
                        }
                    }else if(typeof (limObject.start)==='number'&&typeof (limObject.end)!=="number"){
                        if(limObject.start>0){
                            lim=true;
                            limit.start=limObject.start;
                        }
                    }else if(typeof (limObject.start)!=='number'&&typeof (limObject.end)==="number"){
                        if(limObject.end>0){
                            lim=true;
                            limit.end=limObject.end;
                        }
                    }
                }
            }
            return this;
        },
        /**
         * The end method is used to stop data retreival.
         */
        end:function(){
            if(!end.end){
                end.end=true;
                var i;
                for(i in onendFuncs){
                    onendFuncs[i]();
                }
                onendFuncs = null;
            }
        },
        withTime:function(){
            if(allowTime){
                Time.withTime=1;
            }
            return this;
        },
        withTimeStamp:function(){
            if(allowTime){
                Time.withTime=2;
            }
            return this;
        },
        /**
         * 
         * @param {{}} o 
         */
        startFrom:function(month,day,hour,min,sec){
            if(!allowStartF){return this};
            if(typeof (month)==="number"&&month>0&&month<13){
                startf.month=month;
            }
            if(typeof (day)==="number"&&day>0&&day<32){
                startf.day=day;
            }
            if(typeof (hour)==="number"&&hour>=0&&hour<24){
                startf.hour=hour;
            }
            if(typeof (min)==="number"&&min>=0&&min<60){
                startf.minute=min;
            }
            if(typeof (sec)==="number"&&sec>=0&&sec<60){
                startf.second=sec;
            }
            return this;
        }
    };
};
const DELDMESS = {},DELETING_D={};
/**
 *  
 * @param {{tablename:string,id:string,storageColumn:string,dataId:string}} o
 * -
 * - `o.tablename` 
 * - `o.id` 
 * - `o.storageColumn` 
 * - `o.dataId`  
 * 
 * @param {(noscDBReturnType: boolean)=>void} callback
 * 
 */
function _delDMessage(o,callback){
    var _path=this[n_ne]();
        o.id=resolveName(o.id);
        var mesId=o.dataId.split("-"),mespath=deId(mesId[0]);
        mesId.length===2?o.messageIndex=Number(mesId[1]):o.messageIndex = NaN;
        // If messageIndex is NaN, Return.
        if(o.messageIndex>-1&&mespath.length===6){}else{callback(false);return;}
        if(typeof (DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]])==="undefined"){
            DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]]=[[],[],[]];
        }
        var indx = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][0].indexOf(mesId[0]);
        if(indx>-1){
            if(!DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][1][indx].includes(o.messageIndex)){
                DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][1][indx].push(o.messageIndex);
                DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx].push(callback);
                return;
            }else{
                DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx].push(callback);
            }
        }else{
            indx = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][0].length;
            DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][0].push(mesId[0]);
            DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][1].push([]);
            DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2].push([]);
        }
        var dt=Databases[_path].dTablesObject[o.tablename].rows;
        if(UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]]){
            UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]].push(function(){
                if(!DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]]){
                    DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = [];
                }
                _searcher(dirCount(dt),_path+"/d/"+o.tablename+"/d",o.id,function(ex,ii){
                    if(ex){
                            fsm.readFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,"utf8",(er,data)=>{
                                if(er){
                                    var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],
                                    delIds = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][1][indx],l;
                                    delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    callback(false);
                                    for(l in CallBacks){
                                            CallBacks[l](false);
                                    }
                                    CallBacks = null;
                                    var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                    delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    for(l in UpWaiting){
                                        UpWaiting[l]();
                                    }
                                    UpWaiting = null;
                                    return;
                                }
                                try {
                                    data = JSON.parse(data);
                                    data.length;
                                } catch (error) {
                                    data = null;
                                }
                                if(!data){
                                    var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],l;
                                    delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        callback(false);
                                    for(l in CallBacks){
                                            CallBacks[l](false);
                                    }
                                    CallBacks=null;
                                    var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                    delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    for(l in UpWaiting){
                                        UpWaiting[l]();
                                    }
                                    UpWaiting = null;
                                    return;
                                }
                                var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],l,
                                delIds = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][1][indx],x;
                                delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                if(data[o.messageIndex]){
                                    data[o.messageIndex] = null;
                                    delete data[o.messageIndex];
                                    data.length--;
                                }
                                for(x in delIds){
                                    if(data[delIds[x]]){
                                        data[delIds[x]] = null;
                                        delete data[delIds[x]];
                                        data.length--;
                                    }
                                }
                                if(data.length>0){
                                    fsm.writeFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                        mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,JSON.stringify(data),(er)=>{
                                            data = null;
                                            if(er){
                                                callback(false);
                                                for(l in CallBacks){
                                                        CallBacks[l](false);
                                                }
                                                CallBacks = null;
                                                var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                                DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                                delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                                for(l in UpWaiting){
                                                    UpWaiting[l]();
                                                }
                                                UpWaiting = null;
                                                return;
                                            }
                                            callback(true);
                                            for(l in CallBacks){
                                                    CallBacks[l](true);
                                            }
                                            CallBacks = null;
                                            var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                            DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                            delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                            for(l in UpWaiting){
                                                UpWaiting[l]();
                                            }
                                            UpWaiting = null;
                                        });
                                }else{
                                    fsm.unlink(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                        mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,(er)=>{
                                            if(er){
                                                callback(false);
                                                for(l in CallBacks){
                                                        CallBacks[l](false);
                                                }
                                                CallBacks = null;
                                                var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                                DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                                delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                                for(l in UpWaiting){
                                                    UpWaiting[l]();
                                                }
                                                UpWaiting = null;
                                                return;
                                            }
                                            callback(true)
                                            for(l in CallBacks){
                                                    CallBacks[l](true);
                                            }
                                            CallBacks = null;
                                            var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                            DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                            delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                            for(l in UpWaiting){
                                                UpWaiting[l]();
                                            }
                                            UpWaiting = null;
                                        })
                                }
                            });
                        }else{
                            var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],l;
                            delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            callback(false);
                            for(l in CallBacks){
                                    CallBacks[l](false);
                            }
                            CallBacks = null;
                            var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                            delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            for(l in UpWaiting){
                                UpWaiting[l]();
                            }
                            UpWaiting = null;
                        }
                });
            });
            return;
        }
        if(!DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]]){
            DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = [];
        }
        _searcher(dirCount(dt),_path+"/d/"+o.tablename+"/d",o.id,function(ex,ii){
            if(ex){
                    fsm.readFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                        mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,"utf8",(er,data)=>{
                        if(er){
                            var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],
                            delIds = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][1][indx],l;
                            delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            callback(false);
                            for(l in CallBacks){
                                    CallBacks[l](false);
                            }
                            CallBacks = null;
                            var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                            delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            for(l in UpWaiting){
                                UpWaiting[l]();
                            }
                            UpWaiting = null;
                            return;
                        }
                        try {
                            data = JSON.parse(data);
                            data.length;
                        } catch (error) {
                            data = null;
                        }
                        if(!data){
                            var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],l;
                            delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                callback(false);
                            for(l in CallBacks){
                                    CallBacks[l](false);
                            }
                            CallBacks=null;
                            var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                            delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            for(l in UpWaiting){
                                UpWaiting[l]();
                            }
                            UpWaiting = null;
                            return;
                        }
                        var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],l,
                        delIds = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][1][indx],x;
                        delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                        if(data[o.messageIndex]){
                            data[o.messageIndex] = null;
                            delete data[o.messageIndex];
                            data.length--;
                        }
                        for(x in delIds){
                            if(data[delIds[x]]){
                                data[delIds[x]] = null;
                                delete data[delIds[x]];
                                data.length--;
                            }
                        }
                        if(data.length>0){
                            fsm.writeFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,JSON.stringify(data),(er)=>{
                                    data = null;
                                    if(er){
                                        callback(false);
                                        for(l in CallBacks){
                                                CallBacks[l](false);
                                        }
                                        CallBacks = null;
                                        var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                        delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        for(l in UpWaiting){
                                            UpWaiting[l]();
                                        }
                                        UpWaiting = null;
                                        return;
                                    }
                                    callback(true);
                                    for(l in CallBacks){
                                            CallBacks[l](true);
                                    }
                                    CallBacks = null;
                                    var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                    delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    for(l in UpWaiting){
                                        UpWaiting[l]();
                                    }
                                    UpWaiting = null;
                                });
                        }else{
                            fsm.unlink(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,(er)=>{
                                    if(er){
                                        callback(false);
                                        for(l in CallBacks){
                                                CallBacks[l](false);
                                        }
                                        CallBacks = null;
                                        var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                        delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        for(l in UpWaiting){
                                            UpWaiting[l]();
                                        }
                                        UpWaiting = null;
                                        return;
                                    }
                                    callback(true)
                                    for(l in CallBacks){
                                            CallBacks[l](true);
                                    }
                                    CallBacks = null;
                                    var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                    delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    for(l in UpWaiting){
                                        UpWaiting[l]();
                                    }
                                    UpWaiting = null;
                                })
                        }
                    });
                }else{
                    var CallBacks = DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]][2][indx],l;
                    delete DELDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                    callback(false);
                    for(l in CallBacks){
                        CallBacks[l](false);
                    }
                    CallBacks = null;
                    var UpWaiting = DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                    DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                    delete DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                    for(l in UpWaiting){
                        UpWaiting[l]();
                    }
                    UpWaiting = null;
                }
        });
};
const GETDMESS = {};
function _getDMesTimeAdder(obj,timeObj){
    obj.$time = timeObj;
    return obj;
};
/**
 *  
 * @param {{tablename:string,id:string,storageColumn:string,dataId:string}} o
 * -
 * - `o.tablename` 
 * - `o.id` 
 * - `o.storageColumn` 
 * - `o.dataId`  
 * 
 * @param {(noscDBReturnType: object)=>void} callback
 * 
 */
 function _getDMessage(o,callback){
    var _path=this[n_ne]();
        o.id=resolveName(o.id);
        var dt=Databases[_path].dTablesObject[o.tablename].rows,mesId=o.dataId.split("-"),mespath=deId(mesId[0]);
        mesId.length===2?o.messageIndex=Number(mesId[1]):o.messageIndex = NaN;
        if(mespath.length===6&&o.messageIndex>=0){
            _searcher(dirCount(dt),_path+"/d/"+o.tablename+"/d",o.id,function(ex,ii){
                if(ex){
                        if(typeof (GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn])==="undefined"){
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn]=[[],[],[]];
                        }
                        var indx = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                        if(indx>=0){
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1][indx].push(o.messageIndex);
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].push(callback);
                            return;
                        }else{
                            indx = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].length;
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].push(mesId[0]);
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].push([]);
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].push([]);
                        }
                        fsm.readFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                        mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,"utf8",(er,data)=>{
                            if(er){
                                var indx = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                                var waitedGets = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1][indx].slice(),k;
                                var CallBacks = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                                GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                                GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                                GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                                callback(null);
                                for(k in CallBacks){
                                    CallBacks[k](null);
                                }
                                CallBacks=null;waitedGets=null;
                                return;
                            }
                            try {
                                data = JSON.parse(data);
                            } catch (error) {
                                var indx = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                                var waitedGets = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1][indx].slice(),k;
                                var CallBacks = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                                GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                                GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                                GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                                callback(null);
                                for(k in CallBacks){
                                    CallBacks[k](null);
                                }
                                CallBacks=null;waitedGets=null;
                                return;
                            }
                            var indx = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                            var waitedGets = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1][indx].slice(),k;
                            var CallBacks = GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                            GETDMESS[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                            callback(typeof (data[""+o.messageIndex])!=="undefined"?_getDMesTimeAdder(data[""+o.messageIndex],data.$time):null);
                            for(k in CallBacks){
                                CallBacks[k](typeof (data[""+waitedGets[k]])!=="undefined"?_getDMesTimeAdder(data[""+waitedGets[k]],data.$time):null);
                            }
                            CallBacks=null;
                            waitedGets=null;
                        });
                }else{
                    callback(null);
                }
            });
        }else{
            callback(null);
        }
};
const UPWAIT = {},UPDATING_D={};
/**
 *  
 * @param {{tablename:string,id:string,storageColumn:string,dataId:string,data:string|number|boolean|object|null}} o
 *  
 * @param {(noscDBReturnType: boolean)=>void} callback `'Optional'`
 * 
 */
 function _updateDMessage(o,callback){
    var _path=this[n_ne]();
        o.id=resolveName(o.id);
        var dt=Databases[_path].dTablesObject[o.tablename].rows,mesId=o.dataId.split("-"),mespath=deId(mesId[0]);
        mesId.length===2?o.messageIndex=Number(mesId[1]):o.messageIndex = NaN;
        if(mespath.length===6&&o.messageIndex>=0){;
            if(typeof (UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn])==="undefined"){
                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn]=[[],[],[]];
            }
            var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
            if(indx>=0){;
                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1][indx].push({index:o.messageIndex,data:o.data});
                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].push(callback);
                return;
            }else{;
                indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].length;
                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].push(mesId[0]);
                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].push([]);
                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].push([]);
            }
            if(DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]]){;
                DELETING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]].push(function(){
                    if(!UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]]){
                        UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = [];
                    }
                    _searcher(dirCount(dt),_path+"/d/"+o.tablename+"/d",o.id,function(ex,ii){
                        if(ex){
                                fsm.readFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,"utf8",(er,data)=>{
                                    if(er){
                                        var k;
                                        var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                                        var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                                        UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                                        UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                                        UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                                        callback(false);
                                        for(k in CallBacks){
                                            CallBacks[k](false);
                                        }
                                        CallBacks = null;
                                        var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                        delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        for(k in delWaiting){
                                            delWaiting[k]();
                                        }
                                        delWaiting = null;
                                        return;
                                    }
                                    try {
                                        data = JSON.parse(data);
                                    } catch (error) {
                                        data=null;
                                    }
                                    if(!data){
                                        var k;
                                        var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                                        var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                                        UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                                        UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                                        UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                                        callback(false);
                                        for(k in CallBacks){
                                            CallBacks[k](false);
                                        }
                                        CallBacks = null;
                                        var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                        delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        for(k in delWaiting){
                                            delWaiting[k]();
                                        }
                                        delWaiting = null;
                                        return;
                                    }
                                    var ch=false,chh=[],wch=false;
                                    if(data[`${o.messageIndex}`]){
                                        data[`${o.messageIndex}`].data=o.data;
                                        ch=true;
                                    }
                                    var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                                    var waitedUps = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1][indx].slice(),k;
                                    var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                                    UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                                    UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                                    UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                                    for(k in waitedUps){
                                        wch=true;
                                        if(data[`${waitedUps[k].index}`]){
                                            data[`${waitedUps[k].index}`].data=waitedUps[k].data;
                                            waitedUps[k] = null;
                                            chh.push(true);
                                        }else{
                                            chh.push(false);
                                        }
                                    }
                                    if(!ch&&!wch){
                                        data=null;
                                        callback(false);
                                        var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                        delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        for(k in delWaiting){
                                            delWaiting[k]();
                                        }
                                        delWaiting = null;
                                        return;
                                    }
                                    fsm.writeFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                    mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,JSON.stringify(data),(e)=>{
                                        if(e){
                                            data=null;
                                            callback(false);
                                            for(k in CallBacks){
                                                CallBacks[k](false);
                                            }
                                            CallBacks = null;
                                            var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                            UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                            delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                            for(k in delWaiting){
                                                delWaiting[k]();
                                            }
                                            delWaiting = null;
                                            return;
                                        }
                                        data=null;
                                        if(ch){callback(true);}
                                        else{callback(false);}
                                        for(k in CallBacks){
                                            if(chh[k]){CallBacks[k](true);}
                                            else{CallBacks[k](false);}
                                        }
                                        CallBacks = null;
                                        var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                        delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                        for(k in delWaiting){
                                            delWaiting[k]();
                                        }
                                        delWaiting = null;
                                    });
                                });
                        }else{
                            var k;
                            var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                            var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                            UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                            UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                            UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                            callback(false);
                            for(k in CallBacks){
                                CallBacks[k](false);
                            }
                            CallBacks = null;
                            var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                            delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                            for(k in delWaiting){
                                delWaiting[k]();
                            }
                            delWaiting = null;
                        }
                    });
                });

                return;
            }
            if(!UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]]){;
                UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = [];
            };
            _searcher(dirCount(dt),_path+"/d/"+o.tablename+"/d",o.id,function(ex,ii){
                if(ex){;
                        fsm.readFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                        mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,"utf8",(er,data)=>{
                            if(er){;
                                var k;
                                var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                                var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                                callback(false);
                                for(k in CallBacks){
                                    CallBacks[k](false);
                                }
                                CallBacks = null;
                                var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                for(k in delWaiting){
                                    delWaiting[k]();
                                }
                                delWaiting = null;
                                return;
                            }
                            try {
                                data = JSON.parse(data);
                            } catch (error) {
                                data=null;
                            }
                            if(!data){;
                                var k;
                                var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                                var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                                UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                                callback(false);
                                for(k in CallBacks){
                                    CallBacks[k](false);
                                }
                                CallBacks = null;
                                var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                for(k in delWaiting){
                                    delWaiting[k]();
                                }
                                delWaiting = null;
                                return;
                            };
                            var ch=false,chh=[],wch=false;
                            if(data[`${o.messageIndex}`]){;
                                data[`${o.messageIndex}`].data=o.data;
                                ch=true;
                            }
                            var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                            var waitedUps = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1][indx].slice(),k;
                            var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                            UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                            UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                            UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                            for(k in waitedUps){
                                wch=true;
                                if(data[`${waitedUps[k].index}`]){
                                    data[`${waitedUps[k].index}`].data=waitedUps[k].data;
                                    waitedUps[k] = null;
                                    chh.push(true);
                                }else{
                                    chh.push(false);
                                }
                            }
                            if(!ch&&!wch){;
                                data=null;
                                callback(false);
                                var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                for(k in delWaiting){
                                    delWaiting[k]();
                                }
                                delWaiting = null;
                                return;
                            };
                            fsm.writeFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                            mespath[0]+"/"+mespath[1]+"/"+mespath[2]+"/"+mespath[3]+"d"+mespath[4]+"d"+mespath[5]+db_EXT,JSON.stringify(data),(e)=>{
                                if(e){;
                                    data=null;
                                    callback(false);
                                    for(k in CallBacks){
                                        CallBacks[k](false);
                                    }
                                    CallBacks = null;
                                    var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                    delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                    for(k in delWaiting){
                                        delWaiting[k]();
                                    }
                                    delWaiting = null;
                                    return;
                                };
                                data=null;
                                if(ch){callback(true);;}
                                else{callback(false);;}
                                for(k in CallBacks){
                                    if(chh[k]){CallBacks[k](true);}
                                    else{CallBacks[k](false);}
                                }
                                CallBacks = null;
                                var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                                delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                                for(k in delWaiting){
                                    delWaiting[k]();
                                }
                                delWaiting = null;
                            });
                        });
                }else{;
                    var k;
                    var indx = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].indexOf(mesId[0]);
                    var CallBacks = UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2][indx].slice();
                    UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][0].splice(indx,1);
                    UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][1].splice(indx,1);
                    UPWAIT[_path+""+o.tablename+""+o.id+""+o.storageColumn][2].splice(indx,1);
                    callback(false);
                    for(k in CallBacks){
                        CallBacks[k](false);
                    }
                    CallBacks = null;
                    var delWaiting = UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                    UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]] = null;
                    delete UPDATING_D[_path+""+o.tablename+""+o.id+""+o.storageColumn+""+mesId[0]];
                    for(k in delWaiting){
                        delWaiting[k]();
                    }
                    delWaiting = null;
                }
            });
        }else{
            callback(false);
        }
};
/**
 *  Writes data to a dispersed storage column. All data to be written at a specific time (second) is merged and 
 * stored in the same file. Data is stored with respect to the time (second) `writeToDispersedstorage()` is called and would also 
 * be retreived in the same manner if `readFromDispersedStorage()` is called.
 * 
 * @param {{tablename:string,id:string,storageColumn:string,data:string|object|number|boolean}} o 
 * An object with the data to write and the table name, id and the storage column to write to.
 *  
 * @param {(noscDBReturnType: boolean)=>void} callback `'Optional'`
 * 
 */
function _wToDStorage(o,callback){
    var _path=this[n_ne]();
            o.id=resolveName(o.id);
            if(typeof (SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id])==="undefined"){SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id]=[[],[],[],false]}
            var dt=Databases[_path].dTablesObject[o.tablename].rows;
            _searcher(dirCount(dt),_path+"/d/"+o.tablename+"/d",o.id,function(ex,ii){
                if(ex){
                    var newDate = date();
                    if(!SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].includes(newDate.hour+"d"+newDate.minute+"d"+newDate.second)){
                        if(typeof (SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][3])==="boolean"){
                            SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][3]=newDate.year+"d"+newDate.month+"d"+newDate.day+"d"+
                            newDate.hour+"d"+newDate.minute+"d"+newDate.second;
                        }else{
                            while(newDate.year+"d"+newDate.month+"d"+newDate.day+"d"+newDate.hour+"d"+newDate.minute+"d"+newDate.second===SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][3]){
                                newDate = roundUpDate(newDate);
                            }
                            SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][3]=newDate.year+"d"+newDate.month+"d"+newDate.day+"d"+
                            newDate.hour+"d"+newDate.minute+"d"+newDate.second;
                        }
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].push(newDate.hour+"d"+newDate.minute+"d"+newDate.second);
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1].push([]);
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2].push([]);
                    }else{
                        var index = SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].indexOf(newDate.hour+"d"+newDate.minute+"d"+newDate.second);
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][index].push({data:o.data});
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2][index].push(callback);
                        return;
                    }
                    _createDirSteps(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn,[newDate.year+"",newDate.month+"",newDate.day+""],0,(done)=>{
                        if(done){
                            _check4dfileNoChecks(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                            newDate.year+"/"+newDate.month+"/"+newDate.day+"/"+zeroTime(newDate.hour)+"d"+zeroTime(newDate.minute)+"d"+zeroTime(newDate.second)+db_EXT,(fdata)=>{
                                var indx = SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].indexOf(newDate.hour+"d"+newDate.minute+"d"+newDate.second);
                                if(!fdata){
                                    var mSpot=enId(newDate.year+"")+"z"+enId(newDate.month+"")+"z"+enId(newDate.day+"")+"z"+enId(zeroTime(newDate.hour))+"z"+enId(zeroTime(newDate.minute))+"z"+enId(zeroTime(newDate.second))+"-0",
                                     s = {
                                        length:1,
                                        $time:{created:{
                                        year:newDate.year,
                                        month:newDate.month,
                                        day:newDate.day,
                                        hour:newDate.hour,
                                        minute:newDate.minute,
                                        second:newDate.second,
                                        stamp:newDate.stamp
                                        }},"0":{
                                            data:o.data,
                                            id: mSpot
                                        }
                                    };
                                    var mesSpots = [],i;
                                    if(SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx].length>0){
                                        var mesSpot;
                                        for(i=0;i<SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx].length;i++){
                                            s[(s.length+i)+""]=SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx][i];
                                            mesSpot = enId(newDate.year+"")+"z"+enId(newDate.month+"")+"z"+enId(newDate.day+"")+"z"+enId(zeroTime(newDate.hour))+"z"+enId(zeroTime(newDate.minute))+"z"+enId(zeroTime(newDate.second))+"-"+(s.length+i);
                                            s[(s.length+i)+""].id = mesSpot;
                                            mesSpots.push(mesSpot);
                                        }
                                        s.length += SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx].length;
                                    }
                                    var CallBacks = SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2][indx].slice();
                                    s = JSON.stringify(s);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].splice(indx,1);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1].splice(indx,1);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2].splice(indx,1);
                                    fsm.writeFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                    newDate.year+"/"+newDate.month+"/"+newDate.day+"/"+zeroTime(newDate.hour)+"d"+zeroTime(newDate.minute)+"d"+zeroTime(newDate.second)+db_EXT,s,(err)=>{
                                        if(err){
                                            s=null;
                                            mesSpots = null;
                                            mSpot=null;
                                            callback(null);
                                            for(i=0;i<CallBacks.length;i++){
                                                CallBacks[i](null);
                                            }
                                            CallBacks=null;
                                            return;
                                        }
                                        s=null;
                                        callback(mSpot);
                                        mSpot = null;
                                        for(i=0;i<CallBacks.length;i++){
                                            CallBacks[i](mesSpots[i]);
                                        }
                                        CallBacks=null;
                                        mesSpots=null;
                                    });
                                    return;
                                }
                                var CallBacks = SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2][indx].slice();
                                try {
                                    fdata =  JSON.parse(fdata);
                                    fdata.length;
                                } catch (error) {
                                    fdata=null;
                                }
                                if(fdata){
                                    //
                                    var i,mSpot=enId(newDate.year+"")+"z"+enId(newDate.month+"")+"z"+enId(newDate.day+"")+"z"+enId(zeroTime(newDate.hour))+"z"+enId(zeroTime(newDate.minute))+"z"+enId(zeroTime(newDate.second))+`-${fdata.length}`,
                                    mesSpot,mesSpots=[];
                                    fdata[`${fdata.length}`]={data:o.data,id:mSpot};
                                    fdata.length+=1;
                                    if(SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx].length>0){
                                       // var i;
                                        for(i=0;i<SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx].length;i++){
                                            fdata[`${fdata.length+i}`]=SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx][i];
                                            mesSpot = enId(newDate.year+"")+"z"+enId(newDate.month+"")+"z"+enId(newDate.day+"")+"z"+enId(zeroTime(newDate.hour))+"z"+enId(zeroTime(newDate.minute))+"z"+enId(zeroTime(newDate.second))+`-${fdata.length+i}`;
                                            fdata[`${fdata.length+i}`].id = mesSpot;
                                            mesSpots.push(mesSpot);
                                        }
                                        fdata.length += SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1][indx].length;
                                    }
                                    
                                    fdata = JSON.stringify(fdata);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].splice(indx,1);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1].splice(indx,1);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2].splice(indx,1);
                                    fsm.writeFile(_path+"/d/"+o.tablename+"/d"+ii+"/"+o.id+"/"+o.storageColumn+"/"+
                                    newDate.year+"/"+newDate.month+"/"+newDate.day+"/"+zeroTime(newDate.hour)+"d"+zeroTime(newDate.minute)+"d"+zeroTime(newDate.second)+db_EXT,fdata,(e)=>{
                                        if(e){
                                            fdata = null;
                                            mesSpots = null;
                                            mSpot = null;
                                            callback(null);
                                            for(i=0;i<CallBacks.length;i++){
                                                CallBacks[i](null);
                                            }
                                            CallBacks=null;
                                            return;
                                        }
                                        fdata = null;
                                        callback(mSpot);
                                        mSpot = null;
                                        for(i=0;i<CallBacks.length;i++){
                                            CallBacks[i](mesSpots[i]);
                                        }
                                        CallBacks=null;
                                        mesSpots=null;
                                    });
                                    //
                                }else{
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].splice(indx,1);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1].splice(indx,1);
                                    SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2].splice(indx,1);
                                    callback(null);
                                    for(i=0;i<CallBacks.length;i++){
                                        CallBacks[i](null);
                                    }
                                    CallBacks=null;
                                }
                            },true);
                            return;
                        }
                        var indx = SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].indexOf(newDate.hour+"d"+newDate.minute+"d"+newDate.second);
                        var CallBacks = SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2][indx].slice(),i;
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][0].splice(indx,1);
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][1].splice(indx,1);
                        SECONDWAITER[_path+"/"+o.tablename+"/"+o.storageColumn+"/"+o.id][2].splice(indx,1);
                        callback(null);
                        for(i=0;i<CallBacks.length;i++){
                            CallBacks[i](null);
                        }
                        CallBacks=null;

                    });
                    return;
                }
                callback(null);
            });
};
//gets number of rows
function _nOfRows(tablename,tORd,This){
    let tab=tORd===0?["tables","tablesObject"]:tORd===1?["dTables","dTablesObject"]:["",""];
    var _path=This[n_ne]();
    if(tablename!==""){
        if(Databases[_path]){
            if(Databases[_path][tab[0]].includes(tablename)){
                return Databases[_path][tab[1]][tablename].rows-1;
            }
        }
    };
    return NaN;
};
function resolveCols(arr){
    var i;
    for(i in arr){
        arr[i] = resolveName(arr[i]);
    }
    return arr;
};
//Creates a table
function _table(o,tORd,callback,This){
    if(/^[a-z]/.test(o.tablename)){
        if(fAble(o.tablename)){
            if(_column(o.columns)){
                var _path=This[n_ne]();
                    let tab=tORd===0?["tables","tablesObject","/t/","TABLES"]:tORd===1?["dTables","dTablesObject","/d/","DISPERSEDTABLES"]:["","","",""];
                        if(!Databases[_path][tab[0]].includes(o.tablename)){
                            _createDirr(_path+tab[2]+o.tablename,function(ex){
                                if(!ex){
                                    callback(false,{message:"Internal Error",code:"INERR"});
                                    return;
                                }
                                if(tORd===0){
                                    _recreateDir(_path+tab[2]+o.tablename,["r","t"],0,function(done){
                                        if(done){
                                            _check4dfileNoChecks(_path+tab[2]+o.tablename+"/r"+db_EXT,function(data){
                                                if(data){
                                                    data = Number(data);
                                                    if(data>0){
                                                            Databases[_path][tab[1]][o.tablename]={ columns:o.columns,rows:data};
                                                            This[tab[3]][o.tablename]={ columns:o.columns,rows:data-1};
                                                            Databases[_path][tab[0]].push(o.tablename);
                                                            callback(true);
                                                        return;
                                                    }
                                                }
                                                Databases[_path][tab[1]][o.tablename]={ columns:o.columns,rows:1};
                                                This[tab[3]][o.tablename]={ columns:o.columns,rows:0};
                                                Databases[_path][tab[0]].push(o.tablename);
                                                fsm.writeFile(_path+tab[2]+o.tablename+"/r"+db_EXT,"1",function(e){
                                                    if(e){}
                                                    callback(true);
                                                });
                                            },true);
                                            return;
                                        }//
                                        callback(false,{message:"Internal Error",code:"INERR"});
                                    });
                                }else{
                                _createDirr(_path+tab[2]+o.tablename+"/d1",function(created){
                                    if(created){
                                        _check4dfileNoChecks(_path+tab[2]+o.tablename+"/r"+db_EXT,function(data){
                                        if(data){
                                            data = Number(data);
                                            if(data>0){
                                                Databases[_path][tab[0]].push(o.tablename);
                                                Databases[_path][tab[1]][o.tablename]={ columns:o.columns,storage: o.storageColumns,rows:data};
                                                This[tab[3]][o.tablename]={ columns:o.columns,storage: o.storageColumns,rows:data-1};
                                                callback(true);
                                                return;
                                            }
                                        }
                                        Databases[_path][tab[1]][o.tablename]={ columns:o.columns,storage: o.storageColumns,rows:1};
                                        This[tab[3]][o.tablename]={ columns:o.columns,storage: o.storageColumns,rows:0};
                                        Databases[_path][tab[0]].push(o.tablename);
                                        fsm.writeFile(_path+tab[2]+o.tablename+"/r"+db_EXT,"1",function(e){
                                            if(e){}
                                            callback(true);
                                        });
                                        },true);
                                        return;
                                    }//
                                    callback(false,{message:"Internal Error",code:"INERR"});
                                });
                                }
                            });
                        }else{
                            callback(false,{message:`Table with name: <${o.tablename}> exists in database`,code:"TB_EX"});
                        }
            }else{
                callback(false,{message:"Unaccepted column names",code:"W_ARGS"});
            }
        }else{
            callback(false,{message:"A table name must only include numbers and lowercase alphabets",code:"W_ARGS"});
        }
    }else{
        callback(false,{message:"A table name must begin with an alphabet",code:"W_ARGS"});
    }
}; 
const r_EXISTS = {};
/**
 * Checks if a row exists
 * @param {string} tablename 
 * @param {string} id 
 * @param {(noscDBReturnType:boolean)} callback `Required`
 */
 function _exists(tablename,id,callback){
        var _path=this[n_ne]();
        id = resolveName(id);
        var i;
        if(typeof (r_EXISTS[_path+"/t/"+tablename+"/r/"+id])==="undefined"){
            r_EXISTS[_path+"/t/"+tablename+"/r/"+id] = [];
        }else{
            r_EXISTS[_path+"/t/"+tablename+"/r/"+id].push(callback);
            return;
        }
        _check4dirNoChecks(_path+"/t/"+tablename+"/r/"+id,(ex)=>{
            var CallBacks = r_EXISTS[_path+"/t/"+tablename+"/r/"+id];
            r_EXISTS[_path+"/t/"+tablename+"/r/"+id] = null;
            delete r_EXISTS[_path+"/t/"+tablename+"/r/"+id];
            callback(ex);
            for(i in CallBacks){
                CallBacks[i](ex);
                CallBacks[i]=null;
            }
            CallBacks=null;
        },false);
};
const dr_EXISTS = {};
/**
 * Checks if a row exists
 * @param {string} tablename 
 * @param {string} id 
 * @param {(noscDBReturnType:boolean)} callback `Required`
 */
 function _existsD(tablename,id,callback){
        var _path=this[n_ne]();
        id = resolveName(id);
        var i;
        if(typeof (dr_EXISTS[_path+"/d/"+tablename+"/d/"+id])==="undefined"){
            dr_EXISTS[_path+"/d/"+tablename+"/d/"+id] = [];
        }else{
            dr_EXISTS[_path+"/d/"+tablename+"/d/"+id].push(callback);
            return;
        }
        var dt=Databases[_path].dTablesObject[tablename].rows;
        _searcher(dirCount(dt),_path+"/d/"+tablename+"/d",id,function(ex,ii){
            var CallBacks = dr_EXISTS[_path+"/d/"+tablename+"/d/"+id];
            dr_EXISTS[_path+"/d/"+tablename+"/d/"+id]=null;
            delete dr_EXISTS[_path+"/d/"+tablename+"/d/"+id];
            callback(ex);
            for(i in CallBacks){
                CallBacks[i](ex);
                CallBacks[i]=null;
            }
            CallBacks=null;
        });
};

 /**
  * Removes a dispersed row from a table.
  * @param {string} tablename 
  * @param {string} id 
  * @param {(noscDBReturnType:boolean)=>void} callback 
  *  
  * 
  * @returns void
  */
 function _delDRow(tablename,id,callback){
        var _path=this[n_ne]();
            id=resolveName(id);
            var dt=Databases[_path].dTablesObject[tablename].rows,This=this;
            _searcher(dirCount(dt),_path+"/d/"+tablename+"/d",id,function(ex,ii){
                if(ex){
                    removeDir(_path+"/d/"+tablename+"/d"+ii+"/"+id,(del)=>{
                        if(del){
                            Databases[_path].dTablesObject[tablename].rows--;
                            This.DISPERSEDTABLES[tablename].rows--;
                            fsm.writeFile(_path+"/d/"+tablename+"/r"+db_EXT,`${Databases[_path].dTablesObject[tablename].rows}`,
                            function(er){
                                if(er){}
                                callback(true);
                            });
                            return;
                        }
                        callback(true);
                    });
                    return;
                }
                    callback(true);
            });
 };
 /**
  * 
  * @param {string} tablename 
  * @param {(noscDBReturnType:boolean)=>void} callback 
  *  
  *
  *  
  * 
  * @returns void
  */
  function _delAllDRows(tablename,callback){
        var _path=this[n_ne]();
            var This=this;
            removeDir(_path+"/d/"+tablename,(del)=>{
                _createDirr(_path+"/d/"+tablename,(crt)=>{
                    if(crt){
                        Databases[_path].dTablesObject[tablename].rows=1;
                        This.DISPERSEDTABLES[tablename].rows=0;
                        fsm.writeFile(_path+"/d/"+tablename+"/r"+db_EXT,"1",function(er){
                            if(er){}
                            callback(true);
                        });
                        return;
                    }
                    Databases[_path].dTablesObject[tablename] = null;
                    delete Databases[_path].dTablesObject[tablename];
                    Databases[_path].dTables.splice(Databases[_path].dTables.indexOf(tablename),1);
                    callback(true);
                });
                
            });
 };
function _delDTable(tablename,callback){
    if(typeof (callback)==="function"){
        callback = callback.bind(this);
    }
    var _path=this[n_ne]();
    if(Databases[_path].dTablesObject[tablename]){
        var This=this;
        removeDir(_path+"/d/"+tablename,(del)=>{
            if(del){
                Databases[_path].dTablesObject[tablename] = null;
                delete Databases[_path].dTablesObject[tablename];
                Databases[_path].dTables.splice(Databases[_path].dTables.indexOf(tablename),1);
                if(This.DISPERSEDTABLES){This.DISPERSEDTABLES[tablename]=null;delete This.DISPERSEDTABLES[tablename];}
                if(typeof (callback)==="function"){callback(true);}
                return;
            }
            if(typeof (callback)==="function"){callback(true);}
        });
    }else{
        if(typeof (callback)==="function"){
            callback(false);
        }
    }
 };
 /**
  * 
  * @param {string} tablename 
  * @param {string} id 
  * @param {(noscDBReturnType:boolean)=>void} callback `'Optional'`
  *  
  * 
  *  
  * 
  * @returns void
  */
 function _delRow(tablename,id,callback){
        var _path=this[n_ne]();
        var This = this;
            id=resolveName(id);
            fsm.readFile(_path+"/t/"+tablename+"/r/"+id+"/tmp"+db_EXT,"utf8",(e,data)=>{
                if(e){
                    removeDir(_path+"/t/"+tablename+"/r/"+id,(rm)=>{
                        if(rm){
                            Databases[_path].tablesObject[tablename].rows--;
                            This.TABLES[tablename].rows--;
                            fsm.writeFile(_path+"/t/"+tablename+"/r"+db_EXT,`${Databases[_path].tablesObject[tablename].rows}`,
                            (er)=>{
                                if(er){}
                                callback(true);
                            });
                            return;
                        }
                        callback(true);
                    });
                    return;
                }
                 fsm.unlink(_path+"/t/"+tablename+"/t/t"+resolveName(data)+db_EXT,(er)=>{
                    if(er){}
                    removeDir(_path+"/t/"+tablename+"/r/"+id,(rm)=>{
                        if(rm){
                            Databases[_path].tablesObject[tablename].rows--;
                            This.TABLES[tablename].rows--;
                            fsm.writeFile(_path+"/t/"+tablename+"/r"+db_EXT,`${Databases[_path].tablesObject[tablename].rows}`,
                            (er)=>{
                                if(er){}
                                    callback(true);
                            });
                            return;
                        }
                        callback(true);
                    });
                });
            });
 };
 /**
  * 
  * @param {string} tablename 
  * @param {(noscDBReturnType:boolean)=>void} callback 
  */
 function _delAllRows(tablename,callback){
        var _path=this[n_ne]();
        var This = this;
            fsm.readdir(_path+"/t/"+tablename+"/r","utf8",(err,files)=>{
                if(err){
                    callback(false);
                    return;
                }
                del_al_h(_path+"/t/"+tablename+"/r",files,0,(done)=>{
                    Databases[_path].tablesObject[tablename].rows=1;
                    This.TABLES[tablename].rows=0;
                    fsm.writeFile(_path+"/t/"+tablename+"/r"+db_EXT,"1",(er)=>{
                        if(er){}
                        callback(true);
                    });
                });
            });
 };
 function del_al_h(path,arr,s,callback){
    if(s<arr.length){
        var pth;
        if(_column([arr[s]])){
            fsm.readFile(path+"/"+arr[s]+"/tmp"+db_EXT,"utf8",(e,data)=>{
                if(e){
                    removeDir(path+"/"+arr[s],()=>{
                        del_al_h(path,arr,s+1,callback);
                    });
                    return;
                }
                pth=path+path;
                pth=pth.replace("/r"+path,"");
                 fsm.unlink(pth+"/t/t"+resolveName(data)+db_EXT,(er)=>{
                    if(er){}
                    removeDir(path+"/"+arr[s],()=>{
                        del_al_h(path,arr,s+1,callback);
                    });
                });
            });
        }else{
            del_al_h(path,arr,s+1,callback);
        }
    }else{
        if(typeof (callback)==="function"){callback()}
    }
};
//Creates a row
function _createRow(tablename,id,tORd,This,dataObject,callback){
    var _path=This[n_ne](),idd=id;
            id=resolveName(id);
            if(0===tORd){
                _createDir(_path+"/t/"+tablename+"/r/"+id,function(res){
                    if(!res){
                        callback(false);
                    }else{
                        var s={},i;
                        if(typeof (dataObject)==="object"&&null!==dataObject){
                            for(i in Databases[_path].tablesObject[tablename].columns){
                                if(updateAllowedTypes(typeof (dataObject[Databases[_path].tablesObject[tablename].columns[i]]))){
                                    s[Databases[_path].tablesObject[tablename].columns[i]] = dataObject[Databases[_path].tablesObject[tablename].columns[i]];
                                }else{
                                    s[Databases[_path].tablesObject[tablename].columns[i]] = null;
                                }
                            }
                        }else{
                            for(i in Databases[_path].tablesObject[tablename].columns){
                                s[Databases[_path].tablesObject[tablename].columns[i]] = null;
                            }
                        }
                        var currentDate = date();
                        s.$time = {created:{
                            year:currentDate.year,
                            month:currentDate.month,
                            day:currentDate.day,
                            hour:currentDate.hour,
                            minute:currentDate.minute,
                            second:currentDate.second,
                            stamp:currentDate.stamp
                        },updated:null};
                        s.$id = idd;
                        Databases[_path].tablesObject[tablename].rows++;
                        var d_row = Databases[_path].tablesObject[tablename].rows;
                        if(This.TABLES){This.TABLES[tablename].rows++}
                        fsm.writeFile(_path+"/t/"+tablename+"/r/"+id+"/r"+db_EXT,toString(s),function(err){
                            s=null;
                            if(err){
                                fsm.writeFile(_path+"/t/"+tablename+"/r"+db_EXT,`${Databases[_path].tablesObject[tablename].rows}`,
                                function(error){
                                    if(error){}
                                   callback(false);
                                });
                                return;
                            }
                            fsm.writeFile(_path+"/t/"+tablename+"/r/"+id+"/d"+db_EXT,`${d_row}`,
                            function(e){
                                if(e){
                                    fsm.writeFile(_path+"/t/"+tablename+"/r"+db_EXT,`${Databases[_path].tablesObject[tablename].rows}`,
                                    function(error){
                                        if(error){};
                                        callback(true);
                                    });
                                    return;
                                }
                                fsm.writeFile(_path+"/t/"+tablename+"/r"+db_EXT,`${Databases[_path].tablesObject[tablename].rows}`,
                                function(error){
                                    if(error){}
                                    callback(true);
                                });
                            });
                        });
                        s=null;
                    }
                });
            }else{
                _check4dfileNoChecks(_path+"/d/"+tablename+"/r"+db_EXT,function(data){
                    data=Number(data);
                    if(data>0){
                        var ii=dirCount(data);
                        _searcher(ii,_path+"/d/"+tablename+"/d",id,function(ex){
                            if(!ex){
                                _createDirr(_path+"/d/"+tablename+"/d"+ii+"",function(created){
                                    if(created){
                                        _createDir(_path+"/d/"+tablename+"/d"+ii+"/"+id,function(c){
                                            if(c){
                                                var i;
                                                var s={};
                                                if(typeof (dataObject)==="object"&&null!==dataObject){
                                                    for(i in Databases[_path].dTablesObject[tablename].columns){
                                                        if(updateAllowedTypes(typeof (dataObject[Databases[_path].dTablesObject[tablename].columns[i]]))){
                                                            s[Databases[_path].dTablesObject[tablename].columns[i]]=dataObject[Databases[_path].dTablesObject[tablename].columns[i]];
                                                        }else{
                                                            s[Databases[_path].dTablesObject[tablename].columns[i]]=null;
                                                        }
                                                    }
                                                }else{
                                                    for(i in Databases[_path].dTablesObject[tablename].columns){
                                                        s[Databases[_path].dTablesObject[tablename].columns[i]]=null;
                                                    }
                                                }
                                                var currentDate = date();
                                                s.$time = {created:{
                                                    year:currentDate.year,
                                                    month:currentDate.month,
                                                    day:currentDate.day,
                                                    hour:currentDate.hour,
                                                    minute:currentDate.minute,
                                                    second:currentDate.second,
                                                    stamp:currentDate.stamp
                                                },updated:null};
                                                s.$id = idd;
                                                recreateDBFile(_path+"/d/"+tablename+"/d"+ii+"/"+id,[["r",toString(s)]],0,function(done){
                                                    s=null;
                                                    if(done){
                                                        Databases[_path].dTablesObject[tablename].rows++;
                                                        This.DISPERSEDTABLES[tablename].rows++;
                                                        _recreateDir(_path+"/d/"+tablename+"/d"+ii+"/"+id,Databases[_path].dTablesObject[tablename].storage,0,function(Done){
                                                            if(Done){
                                                                fsm.writeFile(_path+"/d/"+tablename+"/r"+db_EXT,`${Databases[_path].dTablesObject[tablename].rows}`,
                                                                function(er){
                                                                    if(er){}
                                                                    callback(true);
                                                                });
                                                                return;
                                                            }
                                                            fsm.writeFile(_path+"/d/"+tablename+"/r"+db_EXT,`${Databases[_path].dTablesObject[tablename].rows}`,
                                                            function(er){
                                                                if(er){}
                                                                callback(false);
                                                            });
                                                        });
                                                        return;
                                                    }
                                                    Databases[_path].dTablesObject[tablename].rows++;
                                                    This.DISPERSEDTABLES[tablename].rows++;
                                                    fsm.writeFile(_path+"/d/"+tablename+"/r"+db_EXT,`${Databases[_path].dTablesObject[tablename].rows}`,
                                                    function(er){
                                                        if(er){}
                                                        callback(false);
                                                    });
                                                });
                                                s=null;
                                                return
                                            }
                                            callback(false);
                                        });
                                        return;
                                    }
                                    callback(false);
                                });
                                return;
                            }
                            callback(false);
                        });
                    }else{
                        callback(false);
                    }
                },true);
            }
};


function _updteRow(tablename,id,columnsObject,tORd,This,callback){
    var _path=This[n_ne]();
    id=resolveName(id);
    if(tORd===1){
        var dt=Databases[_path].dTablesObject[tablename].rows;
        _searcher(dirCount(dt),_path+"/d/"+tablename+"/d",id,function(ex,ii){
            if(ex){
                fsm.readFile(_path+"/d/"+tablename+"/d"+ii+"/"+id+"/r"+db_EXT,"utf8",function(err,data){
                    if(err){
                        callback(false);
                        return;
                    }
                    var func,currentDate,Data;
                    try {
                        func= new Function("now",`const o=${data};o.$time.updated=now;return o;`);
                        currentDate=date(),Data=func({
                            year:currentDate.year,
                            month:currentDate.month,
                            day:currentDate.day,
                            hour:currentDate.hour,
                            minute:currentDate.minute,
                            second:currentDate.second,
                            stamp:currentDate.stamp
                        });
                    } catch (error) {
                        callback(false);
                        return;
                    }
                    func=null;
                    data=null;
                    var updatingCols=Object.keys(columnsObject),updated=Object.keys(Data),x,s="{";
                    for(x in updated){
                        if(updatingCols.includes(updated[x])&&(updated[x]!=="$id"&&updated[x]!=="$time")){
                            Data[updated[x]]=columnsObject[updated[x]];
                            if(updateAllowedTypes(typeof (Data[updated[x]]))){
                                s+=updated[x]+":"+toString(Data[updated[x]])+",";
                            }else{
                                s+=updated[x]+":null,";
                            }
                        }else{
                            s+=updated[x]+":"+toString(Data[updated[x]])+",";
                        }
                    }
                    s+="}";
                    nullifyObject(Data);
                    nullifyObject(columnsObject);
                    columnsObject=null;
                    Data=null;
                    updatingCols=null;
                    updated=null;
                    fsm.writeFile(_path+"/d/"+tablename+"/d"+ii+"/"+id+"/r"+db_EXT,s,function(er){
                        if(er){
                            callback(false);
                            return;
                        }
                        callback(true);
                    });
                    s=null;
                });
                return;
            }
            callback(false);
        });
        return;
    }
    fsm.readFile(_path+"/t/"+tablename+"/r/"+id+"/r"+db_EXT,"utf8",function(err,data){
        if(err){
            callback(false);
            return;
        }
        var func,currentDate,Data;
        try {
            func= new Function("now",`const o=${data};o.$time.updated=now;return o;`);
            currentDate=date(),Data=func({
                year:currentDate.year,
                month:currentDate.month,
                day:currentDate.day,
                hour:currentDate.hour,
                minute:currentDate.minute,
                second:currentDate.second,
                stamp:currentDate.stamp
            });
        } catch (error) {
            callback(false);
            return;
        }
        func=null;
        data=null;
        var updatingCols=Object.keys(columnsObject),updated=Object.keys(Data),x,s="{";
        for(x in updated){
            if(updatingCols.includes(updated[x])&&(updated[x]!=="$id"&&updated[x]!=="$time")){
                Data[updated[x]]=columnsObject[updated[x]];
                if(updateAllowedTypes(typeof (Data[updated[x]]))){
                    s+=updated[x]+":"+toString(Data[updated[x]])+",";
                }else{
                    s+=updated[x]+":null,";
                }
            }else{
                s+=updated[x]+":"+toString(Data[updated[x]])+",";
            }
        }
        s+="}";
        nullifyObject(Data);
        nullifyObject(columnsObject);
        columnsObject=null;
        Data=null;
        updatingCols=null;
        updated=null;
        fsm.writeFile(_path+"/t/"+tablename+"/r/"+id+"/r"+db_EXT,s,function(er){
            if(er){
                callback(false);
                return;
            }
            callback(true);
        });
        s=null;
    });
};
const r_getROW = {};
/**
 * Retrieves row data
 * @param {string} tablename 
 * @param {string} id 
 * @param {(noscDBReturnType: object|null)=>void} callback `Required`
 */
 function _getRow(tablename,id,callback){
        var _path=this[n_ne]();
        id=resolveName(id);
        if(typeof (r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"])==="undefined"){
            r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"]={busy:false,callbacks:[]};
        }
        if(r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"].busy){
            r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"].callbacks.push(callback);
            return;
        }else{
            r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"].busy=true;
        }
        fsm.readFile(_path+"/t/"+tablename+"/r/"+id+"/r"+db_EXT,"utf8",function(err,data){
            if(err){
                var CallBacks = r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"].callbacks,i;
                r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"].callbacks=null;
                r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"]=null;
                delete r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"];
                callback(null);
                for(i in CallBacks){
                    CallBacks[i](null);
                }
                return;
            }
            var funcData=toJSON(data);
            var CallBacks = r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"].callbacks,i;
            r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"].callbacks=null;
            r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"]=null;
            delete r_getROW[_path+"/t/"+tablename+"/r/"+id+"/r"];
            callback(funcData);
            for(i in CallBacks){
                CallBacks[i](funcData);
            }
            funcData=null;
        });
};
const d_getROW = {};
/**
 * Retrives dispersed row data
 * @param {string} tablename 
 * @param {string} id 
 * @param {(noscDBReturnType:object)=>void} callback `Required`
 */
 function _getDRow(tablename,id,callback){
        var _path=this[n_ne]();
        id=resolveName(id);
        if(typeof (d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"])==="undefined"){
            d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"]={busy:false,callbacks:[]};
        }
        if(d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].busy){
            d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].callbacks.push(callback);
            return;
        }else{
            d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].busy=true;
        }
        var dt=Databases[_path].dTablesObject[tablename].rows;
        _searcher(dirCount(dt),_path+"/d/"+tablename+"/d",id,function(ex,indx){
            if(ex){
                fsm.readFile(_path+"/d/"+tablename+"/d"+indx+"/"+id+"/r"+db_EXT,"utf8",function(err,data){
                    if(err){
                        var CallBacks = d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].callbacks,i;
                        d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].callbacks=null;
                        d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"]=null;
                        delete d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"];
                        callback(null);
                        for(i in CallBacks){
                            CallBacks[i](null);
                        }
                        return;
                    }
                    var funcData=toJSON(data);
                    data=null;
                    var CallBacks = d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].callbacks,i;
                    d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].callbacks=null;
                    d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"]=null;
                    delete d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"];
                    callback(funcData);
                    for(i in CallBacks){
                        CallBacks[i](funcData);
                    }
                    funcData=null;
                });
                return;
            }
            var CallBacks = d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].callbacks,i;
            d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"].callbacks=null;
            d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"]=null;
            delete d_getROW[_path+"/d/"+tablename+"/d/"+id+"/r"];
            callback(null);
            for(i in CallBacks){
                CallBacks[i](null);
            }
        });
};
function _allDRowsOnData(path,ondataArr,callback){
    fsm.readFile(path+"/r"+db_EXT,"utf8",(er,data)=>{
        if(er){
            for(i in ondataArr){
                ondataArr[i](null);
            }
            callback();
            return;
        }
        var func,Data,i;
        try {
            func= new Function(`return ${data}`);
            data=null;
            Data=func();
            func=null;
        } catch (error) {
            Data = null;
            data=null;
        }
        for(i in ondataArr){
            ondataArr[i](Data);
        }
        Data=null;
        ondataArr=null;
        callback();
    });
};
function retreiveAllRowsData(path,id,start){
    _allRowsOnData(path+allOperations[id][0][start],allOperations[id][1].slice(),id,()=>{
        retreiveAllRowsData(path,id,start+1);
    });
};
function retreiveAllDRowsData(pathsArr,start,callback,ondataArr,id){
    if(start<pathsArr.length&&!stopDataRetreival[id][0]){
        _allDRowsOnData(pathsArr[start],ondataArr,()=>{
            retreiveAllDRowsData(pathsArr,start+1,callback,ondataArr,id);
        });
    }else{
        allRowsCallEnded[id]=true;
        stopDataRetreival[id][1]=true;
        stopDataRetreival[id][0]=true;
        allOperations[id]=null;
        ondataArr=null;
        if(!allRowsCallEnded.includes(false)){
            allRowsCallCount=0;
            allRowsOnEndTracker=[];
            allRowsCallEnded=[];
            allRowsOnEndCallbacks=[];
            stopDataRetreival=[];
            allOperations=[];
        }
        callback();
    }
};
function _re_d(path,s,e,callback,arr,startWith,endWith,include){
    if(s<=e){
        fsm.readdir(path+s,"utf8",(err,files)=>{
            if(err){
                _re_d(path,s+1,e,callback,arr,startWith,endWith,include);
                return;
            }
            if(startWith.length>0&&endWith.length>0){
                files = selectStartsAndEndsWith(`${startWith}...${endWith}`,files);
                if(include.length>0){
                    files=selectIncludes(include,files);
                }
            }else if(startWith.length>0){
                files = select1StartsWith(startWith,files);
                if(include.length>0){
                    files=selectIncludes(include,files);
                }
            }else if(endWith.length>0){
                files = selectEndsWith(endWith,files);
                if(include.length>0){
                    files=selectIncludes(include,files);
                }
            }else if(include.length>0){
                files=selectIncludes(include,files);
            }
            var i;
            for(i in files){
                if(!/[^0-9a-z]/.test(files[i])){
                    arr.push(path+s+"/"+files[i]);
                }
            }
            _re_d(path,s+1,e,callback,arr,startWith,endWith,include);
        });
    }else{
        callback(arr);
    }
}
function _getAllRows(_path,tablename,tORd,This){
    var ender=false,stop=false,
    ondataFuncs=[],onendFuncs=[function(){stop=true}],
    acceptOnDataFuncs=true,acceptOnEndFuncs=true,
    id=allRowsCallCount,sort_atoz=null,startWith="",endWith="",include="",sort_time=null;
    allRowsCallEnded.push(false);
    allRowsOnEndTracker.push([1,0]);
    allRowsOnEndCallbacks.push(null);
    stopDataRetreival.push([false,false]);
    allOperations.push([[],[]]);
    allRowsCallCount+=1;
    let lim_start="",lim_end="",lim=false;
    if(tORd===0){
        fsm.readdir(_path+"/t/"+tablename+"/r","utf8",function(err,f){
            if(err){f=[]}
            else{
                if(startWith.length>0&&endWith.length>0){
                    startWith = resolveName(startWith);
                    endWith = resolveName(endWith).split("");
                    endWith.shift();
                    endWith = endWith.join("");
                    f = selectStartsAndEndsWith(`${startWith}...${endWith}`,f);
                    if(include.length>0){
                        include=resolveName(include).split("");
                        include.shift();
                        include=include.join("");
                        f=selectIncludes(include,f);
                    }
                }else if(startWith.length>0){
                    startWith = resolveName(startWith);
                    f = select1StartsWith(startWith,f);
                    if(include.length>0){
                        include=resolveName(include).split("");
                        include.shift();
                        include=include.join("");
                        f=selectIncludes(include,f);
                    }
                }else if(endWith.length>0){
                    endWith = resolveName(endWith).split("");
                    endWith.shift();
                    endWith = endWith.join("");
                    f = selectEndsWith(endWith,f);
                    if(include.length>0){
                        include=resolveName(include).split("");
                        include.shift();
                        include=include.join("");
                        f=selectIncludes(include,f);
                    }
                }else if(include.length>0){
                    include=resolveName(include).split("");
                    include.shift();
                    include=include.join("");
                    f=selectIncludes(include,f);
                }
            }
            lim=true;
            if(lim_end===""||lim_end>f.length){
                lim_end=f.length;
            }
            if(lim_start===""){
                lim_start=0;
            }else{
                lim_start--;
            }
            var i,j;
            if(ondataFuncs.length>0&&f.length>0&&lim_start<lim_end){
                allRowsOnEndTracker[id][1]=lim_end+1;
                allRowsOnEndTracker[id][0]=lim_start+1;
                typeof (sort_time)==="boolean"?!sort_time?1:f=f.reverse():1;
                typeof (sort_atoz)==="boolean"?!sort_atoz?f=f.sort():f=f.sort().reverse():1;
                for(j=lim_start;j<lim_end;j++){
                    if(!/[^0-9a-z]/.test(f[j])){
                        if(!ender){
                            allOperations[id][0].push(f[j]);
                            ender=true;
                        }else{
                            allOperations[id][0].push(f[j]);
                        }
                    }else{
                        allRowsOnEndTracker[id][0]+=1;
                    }
                }
                if(ender){
                    onendFuncs.unshift(function(){acceptOnEndFuncs=false;onendFuncs=null;});
                    allRowsOnEndCallbacks[id]=onendFuncs;
                    acceptOnDataFuncs=false;
                    allOperations[id][1]=ondataFuncs;
                    ondataFuncs=null;
                    retreiveAllRowsData(_path+"/t/"+tablename+"/r/",id,0);
                }else{
                    acceptOnDataFuncs=false;
                    acceptOnEndFuncs=false;
                    ondataFuncs=null;
                    allRowsOnEndTracker[id]=null;
                    for(i in onendFuncs){
                        onendFuncs[i]();
                        onendFuncs[i]=null;
                    }
                    onendFuncs=null;
                }

            }else{
                acceptOnDataFuncs=false;
                acceptOnEndFuncs=false;
                stop = true;
                ondataFuncs=null;
                allRowsOnEndTracker[id]=null;
                for(i in onendFuncs){
                    onendFuncs[i]();
                    onendFuncs[i]=null;
                }
                onendFuncs=null;
            }
        });
    }else{
            var s,i,ff,df;
            fsm.readFile(_path,"utf8",function(e,d){
                if(e){};
                d=null;
                lim=true;
                if(lim_end===""||lim_end>=tORd){
                    lim_end=tORd-1;
                }
                if(lim_start===""){
                    lim_start=1;
                }
                if(lim_start<tORd&&ondataFuncs.length>0&&lim_start<=lim_end){
                    acceptOnDataFuncs=false;
                    acceptOnEndFuncs=false;
                    s=dirCount(lim_start);
                    ff=dirCount(lim_end);df=ff-s+1;
                    if(startWith.length>0&&endWith.length>0){
                        startWith = resolveName(startWith);
                        endWith = resolveName(endWith).split("");
                        endWith.shift();
                        endWith = endWith.join("");
                    }else if(startWith.length>0){
                        startWith = resolveName(startWith);
                        if(include.length>0){
                            include=resolveName(include).split("");
                            include.shift();
                            include=include.join("");
                        }
                    }else if(endWith.length>0){
                        endWith = resolveName(endWith).split("");
                        endWith.shift();
                        endWith = endWith.join("");
                        if(include.length>0){
                            include=resolveName(include).split("");
                            include.shift();
                            include=include.join("");
                        }
                    }else if(include.length>0){
                        include=resolveName(include).split("");
                        include.shift();
                        include=include.join("");
                    }
                    _re_d(_path+"/d/"+tablename+"/d",s,df,(filesArr)=>{
                        typeof (sort_time)==="boolean"?!sort_time?1:filesArr=filesArr.reverse():1;
                        typeof (sort_atoz)==="boolean"?!sort_atoz?filesArr=filesArr.sort():filesArr=filesArr.sort().reverse():1;
                        retreiveAllDRowsData(filesArr.slice(lim_start-1,lim_end),0,()=>{
                            for(i in onendFuncs){
                                onendFuncs[i]();
                            }
                            onendFuncs=null;
                            ondataFuncs=null;
                        },ondataFuncs,id);
                        filesArr=null;
                    },[],startWith,endWith,include);
                    
                }else{
                    var k;
                    acceptOnDataFuncs=false;
                    acceptOnEndFuncs=false;
                    stop = true;
                    ondataFuncs=null;
                    allRowsOnEndTracker[id]=null;
                    for(k in onendFuncs){
                        onendFuncs[k]();
                        onendFuncs[k]=null;
                    }
                    onendFuncs=null;
                }
            });
    }
    return {
        /**
         * 
         * @param {{start:number,end:number}} rangeObject A limit object to set the start and end of rows to retrieve data.
         *  
         * `rangeObject.start` A start value. Default is `0`
         * 
         * `rangeObject.end` An end value. Default is `total number of rows`
         * 
         * 
         * ---
         * #### NOTE: 
         * Limit can be set once. All calls to the `limit` function has no effect after first call.
         * 
         * @returns this
         */
        limit:function(rangeObject){
            if(!lim){
                if(null!==rangeObject&&typeof (rangeObject)==="object"){
                    if(typeof (rangeObject.start)==="number"&&rangeObject.start>=1){
                        lim=true;
                        lim_start = Math.ceil(rangeObject.start);
                    }
                    if(typeof (rangeObject.end)==="number"&&rangeObject.end>=1){
                        lim=true;
                        lim_end = Math.ceil(rangeObject.end);
                    }
                }
            }
            return this;
        },
        /**
         * 
         * @param {(noscDBReturnType:object|null)=>void} callback 
         * A callback that is executed anytime a row data is retrieved. 
         * Each row's data is passed as argument to the callback anytime data is retrieved.
         * 
         * ---
         * #### NOTE:

         * All `callbacks` passed as argument to this method is executed anytime a row data is retrieved.

         */
        ondata:function(callback){
            if(typeof (callback)==="function"&&acceptOnDataFuncs){
                ondataFuncs.push(callback);
            }
            return this;
        },
        /**
         * 
         * @param {(noscDBReturnType: void)=>void} callback 
         * A callback that is executed after all rows data is retrieved.
         * 
         * ---
         * #### NOTE:

         * All `callbacks` passed as argument to this method is executed after all rows data is retrieved.
        
         */
        onend:function(callback){
            if(typeof (callback)==="function"&&acceptOnEndFuncs){
                onendFuncs.push(callback);
            }
            return this;
        },
        /**
         * Ends data retreival
         */
        end:function(){
            if(!stop){stop=true;stopDataRetreival[id][0]=true;}
        },
        /**
         * Sorts rows by `id` before retreiving data. By default, rows would 
         * be retreived in order of time stored if `sortById()` is not called.
         * 
         * **Must be called before the first `ondata()` method is called.**
         * @param {boolean} descending If `false` or not defined, sorts rows in ascending order.
         */
        sortById:function(descending){
            if(typeof (descending)==="boolean"){
                sort_atoz = descending;
            }else{
                sort_atoz = false;
            }
            return this;
        },
        /**
         * Sorts rows by `time stored` before retreiving data. By default, rows would 
         * be retreived in order of time stored, that is; first stored, first read.
         * 
         * **Must be called before the first `ondata()` method is called.**
         * @param {boolean} descending If `false` or not defined, reads data in order of time stored. `Default` 
         * 
         * If `true`, reverses the default behaviour, that is; last stored, first read.
         */
        sortByTime:function(descending){
            if(typeof (descending)==="boolean"){
                sort_time = descending;
            }else{
                sort_time = false;
            }
            return this;
        },
        /**
         * Select rows starting with `value`, before performing read operations.
         * 
         * **Must be called before the first `ondata()` method is called.**
         * 
         * @param {string} value 
         * 
         * @returns this
         */
        selectIdStartingWith:function(value){
            if(string(value)){
                startWith = value;
            }
            return this;
        },
        /**
         * Select rows ending with `value`, before performing read operations.
         * 
         * **Must be called before the first `ondata()` method is called.**
         * 
         * @param {string} value 
         * 
         * @returns this
         */
        selectIdEndingWith:function(value){
            if(string(value)){
                endWith = value;
            }
            return this;
        },
        /**
         * Select rows that includes `value` in their Ids, before performing read operations.
         * 
         * **Must be called before the first `ondata()` method is called.**
         * 
         * @param {string} value 
         * 
         * @returns this
         */
        selectIdIncluding:function(value){
            if(string(value)){
                include = value;
            }
            return this;
        },
    };

};
/**
 * 
 * @param {string} extName  A unique string that identifies database outside this environment (e.g on the client-side)
 */

//usage not yet implemented
 function _setExt(extName){
    if(extName!==""){Databases["***"][extName]=this[n_ne]();}
};


/**noscDB-Object */
const noscDB={
    /**Use to override the the default `fs` module used by noscDB.*/
    override_fs:null,
    /** Set the maximum files that can be opened simultaneously for operations.
     * This reduces the risk of encountering the fs `'EMFILE'` error. Thus, if 
     * the number of files opened reaches maximum, all other file openning operations are queued
     * for some opened files to close. Default is `1000`.
     * 
    */
    maxParrallelOpenedFiles:1000,
    /**
     * A boolean to either set up database synchronously, `true` or asynchronously, `false`.
     *  
     *  If false, `noscDB-Object.createDatabase` returns `void`.
     * 
     *  If true, `noscDB-Object.createDatabase` returns a `DBobject`.
     * 
     * Default : `false`
     */
    sync:false,
    /**
     * A unique string that identifies database outside this environment (e.g on the client-side).
     * 
     * *Not yet implemented.* 
     */

    //not yet implemented
    external:"",
    /** This value is automatically changed to true if NoscDB is required by `noscdb-server` module. 
     * Do not change this value manually. 
     */
    isServer:false,
     /**
      * @param {string} path A path to a folder or directory where data will be stored
      * @param {(noscDBReturnType: nd)=>void} callback 
      * A callback to execute after database is set up.

     A database object (*DBobject*) is passed as an argument to this function.

     @example noscDB-Object.createDatabase(path: "yourFolderPath",callback: (db)=>{db.createTable(...);...});  
     
      * @returns Database object, if `noscDB-Object.sync` is set to `true`. 
      * @returns Void, if `noscDB-Object.sync` is set to `false`.
      */
    createDatabase:function(path,callback){
        if(string(path)&&path.length>0){
            if(typeof (this.sync)!=="boolean"){this.sync=false;}
            if(!this.sync){
                if(typeof (callback)!=="function"){return;}
                if(!string(this.external)){this.external=""}
                if(typeof (this.override_fs)==="object"&&null!==this.override_fs){
                    fs=this.override_fs;
                    fsm.override_fs(this.override_fs);
                    dirhandle.use_fsm(fsm);
                }
                fsm.maxParrallelOpenedFiles(this.maxParrallelOpenedFiles);
                if(typeof (this.isServer)==='boolean'&&this.isServer){ndbServer=true;}
                setAsyncDBObject(path,callback,this.external);
            }else{
                if(!string(this.external)){this.external=""}
                if(typeof (this.override_fs)==="object"&&null!==this.override_fs){
                    fs=this.override_fs;
                    fsm.override_fs(this.override_fs);
                    dirhandle.use_fsm(fsm);
                }
                fsm.maxParrallelOpenedFiles(this.maxParrallelOpenedFiles);
                if(typeof (this.isServer)==='boolean'&&this.isServer){ndbServer=true;}
                return getSyncDBObject(path,callback,this.external);
            }
        }else{
            Err("Can't create a database without a directory path.");
        }
    },
    /** Returns NoscDB's internal fs manager methods. */
    fs:function(){return fsm;},
    /** NoscDB's internal date methods. */
    noscDate:noscDate,
    /** NoscDB string array selection methods. */
    NOSCDB_ARRAYS:{
        /**
         * Returns an array of all elements in `arr` that starts with `value`.
         * @param {string} value **FORMAT**: `'startsWithValue'`
         * @param {string[]} arr The string array to select values.
         * @returns 
         */
        selectStartsWith:select1StartsWith,
        /**
         * Returns an array of all elements in `arr` that ends with `value`.
         * @param {string} value **FORMAT**: `'endsWithValue'`
         * @param {string[]} arr The string array to select values.
         * @returns 
         */
        selectEndsWith:selectEndsWith,
        /**
         * Returns an array of all elements in `arr` that starts with `startsWithValue` and ends with `endsWithValue`.
         * @param {string} value **FORMAT**: `'startsWithValue...endsWithValue'`
         * @param {string[]} arr The string array to select values.
         * @returns 
         */
        selectStartsAndEndsWith:selectStartsAndEndsWith,
        /**
         * Returns an array of all elements in `arr` that includes `value`.
         * @param {string} value **FORMAT**: `'value'`
         * @param {string[]} arr The string array to select values.
         * @returns 
         */
        selectIncludes:selectIncludesMain
    }
};
//neccessary-------------------
noscDB.sync=false;
var nd=noscDB.createDatabase("/");
nd=null;
//------------------------------
module.exports=noscDB;
