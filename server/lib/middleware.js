
var fs = require("fs");
var NOSCDB = require(__dirname+"/db/db.json");
const ndb = require("noscdb");
const fsmanager = ndb.fs();
global.NOSCDB_ARRAYS=ndb.NOSCDB_ARRAYS;
var dbPath = "";
const Databases = {};
function createTables(dbnames,nextDB,nextTable,nextDTable,callback){
    if(NOSCDB[dbnames[nextDB]].tables.length>nextTable){
        Databases[dbnames[nextDB]].createTable({
            tablename:NOSCDB[dbnames[nextDB]].tables[nextTable].name,
            columns:NOSCDB[dbnames[nextDB]].tables[nextTable].columns,
            created:false
        },function(){createTables(dbnames,nextDB,nextTable+1,nextDTable,callback);callback=null;});
    }else{
        if(NOSCDB[dbnames[nextDB]].dispersedTables.length>nextDTable){
            Databases[dbnames[nextDB]].createDispersedTable({
                tablename:NOSCDB[dbnames[nextDB]].dispersedTables[nextDTable].name,
                columns:NOSCDB[dbnames[nextDB]].dispersedTables[nextDTable].columns,
                storageColumns:NOSCDB[dbnames[nextDB]].dispersedTables[nextDTable].storageColumns,
                created:false
            },function(){createTables(dbnames,nextDB,nextTable,nextDTable+1,callback);callback=null;});
        }else{
            if(dbnames.length>nextDB+1){
                createTables(dbnames,nextDB+1,0,0,callback);
                callback = null;
            }else{
                dbnames = null;
                // Database is set up successfully
                callback();
            }
        }
    }
};
function setUpDatabases(callback){
    if(dbPath!==""){
        var dbnames=Object.keys(NOSCDB);
        if(dbnames.length>0){
            ndb.sync = true;
            var i;
            for(i in dbnames){
                try {
                    fs.mkdirSync(`${dbPath}/${dbnames[i]}`);
                } catch (error) {
                    if(error.code!=="EEXIST"){
                        throw error;
                    }
                }
                Databases[dbnames[i]] = ndb.createDatabase(`${dbPath}/${dbnames[i]}`);
            }
            createTables(dbnames,0,0,0,callback);
            dbnames=null;
        }else{
            dbnames=null;
            // Database is set up successfully
            callback();
        }
    }
};
function updateDBJSON(callback){
    fsmanager.writeFile(__dirname+"/db/db.json",JSON.stringify(NOSCDB),callback);
};
function createDatabase(dbname,callback){
    if(/[^a-z0-9]/.test(dbname)||dbname.length<=0){callback(ERRORS.WRONG_ARGS);return}
    if(!NOSCDB[dbname]){
        ndb.sync = false;
        NOSCDB[dbname] = {tables:[],dispersedTables:[]};
        fsmanager.mkdir(`${dbPath}/${dbname}`,function(e){
            if(!e){
                ndb.createDatabase(`${dbPath}/${dbname}`,function(db){
                    updateDBJSON(function(er){
                        if(!er){
                            Databases[dbname] = db;
                            db = null;
                            callback(false);// Errored: false
                            return;
                        }
                        db = null;
                        NOSCDB[dbname] = null;
                        delete NOSCDB[dbname];
                        callback(er);
                   });
                });
                return;
            }
            NOSCDB[dbname] = null;
            delete NOSCDB[dbname];
            callback(e);
        });
    }else{callback(ERRORS.DB_EXIST(dbname));}// Errored: true
};
function createTable(dbname,tablename,columns,callback){
    if(Databases[dbname]){
        Databases[dbname].createTable({tablename:tablename,columns:columns,created:false
        },function(c,e){
           if(c){
                var tableposition = NOSCDB[dbname].tables.length;
                NOSCDB[dbname].tables.push({name:tablename,columns:columns});
                updateDBJSON(function(er){
                    if(!er){
                        callback(false);// Errored: false
                        return;
                    }
                    callback(er);
                })
           }else{
                callback(e);
           }
        })
    }else{callback(ERRORS.DB_EXIST(dbname));}// Errored: true
};
function createDTable(dbname,tablename,columns,storageColumns,callback){
    if(Databases[dbname]){
        Databases[dbname].createDispersedTable({
            tablename:tablename,columns:columns,storageColumns:storageColumns,created:false
        },function(c,e){
            if(c){
                var tableposition = NOSCDB[dbname].dispersedTables.length;
                NOSCDB[dbname].dispersedTables.push({name:tablename,columns:columns,storageColumns:storageColumns});
                updateDBJSON(function(er){
                    if(!er){
                        callback(false);// Errored: false
                        return;
                    }
                    callback(er);
                })
            }else{
                callback(e);
            }
        })
    }else{callback(ERRORS.DB_EXIST(dbname));}// Errored: true
};
// createRow
// createDispersedRow
// updateRow
// updateDispersedRow
function create_update_row(dbname,tablename,id,columnsObject,operation,callback){
    if(Databases[dbname]){
        Databases[dbname][operation](tablename,id,columnsObject,callback);
    }else{
        columnsObject=null;
        callback(false);
    }
};
// delRow
// delDispersedRow
// getRow
// getDispersedRow 
// dispersedRowExists
// rowExists
function del_get_exist_row(dbname,tablename,id,operation,callback){
    if(Databases[dbname]){
        Databases[dbname][operation](tablename,id,callback);
    }else{
        callback(false);
    }
};
// delTable
// delDispersedTable
function delAllRows(dbname,tablename,operation,callback){
    if(Databases[dbname]){
        Databases[dbname][operation](tablename,callback);
    }else{
        callback(false);
    }
};
// getDispersedStorageData
// delDispersedStorageData
// updateDispersedStorageData
function get_del_update_D_data(dbname,obj,operation,callback){
    if(Databases[dbname]){
        Databases[dbname][operation](obj,callback);
    }else{
        callback(false);
    }
};
function _wToDStorage(dbname,tablename,id,storageColumn,data,callback){
    if(Databases[dbname]){
        Databases[dbname].writeToDispersedStorage({
            tablename:tablename,
            id:id,
            storageColumn:storageColumn,
            data:data
        },callback);
    }else{
        callback(null);
    }
};
function getAllRows(dbname,tablename,operation,conditions,ondata,onend){
    if(Databases[dbname]){
        var dataRead=0;
        let get = Databases[dbname][operation](tablename);
        get.limit(conditions.lim);
        get.onend(function(){onend(dataRead)});
        if(typeof (conditions.srt)==="boolean"){
            get.sortById(conditions.srt);
        }
        if(typeof (conditions.srt_t)==="boolean"){
            get.sortByTime(conditions.srt_t);
        }
        if(typeof (conditions.stval)==="string"){
            get.selectIdStartingWith(conditions.stval);
        }
        if(typeof (conditions.enval)==="string"){
            get.selectIdEndingWith(conditions.enval);
        }
        if(typeof (conditions.inval)==="string"){
            get.selectIdIncluding(conditions.inval);
        }
        var endif = false;
        if(typeof (conditions.eif)==="string"){
            try {
                conditions.eif = new Function(`return ${conditions.eif}`);
                conditions.eif = conditions.eif();
                endif = true;
            } catch (error) {
                endif = false;
            }
        }
        var getif = false;
        if(typeof (conditions.gif)==="string"){
            try {
                conditions.gif = new Function(`return ${conditions.gif}`);
                conditions.gif = conditions.gif();
                getif = true;
            } catch (error) {
                getif = false;
            }
        }
        var Returns = false;
        if(typeof (conditions.ret)==="string"){
            try {
                conditions.ret = new Function(`return ${conditions.ret}`);
                conditions.ret = conditions.ret();
                Returns = true;
            } catch (error) {
                Returns = false;
            }
        }
        if(getif&&endif){
            if(Returns){
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        var con = false;
                        try {
                            con = conditions.eif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=false}
                        } catch (error) {
                            con=false;
                        }
                        try {
                            con = conditions.gif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=true}
                        } catch (error) {
                            con = true;
                        }
                        if(con){
                            try {
                                data = conditions.ret(data);
                            } catch (error) {}
                            ondata(data,dataRead);
                        }
                        if(con){get.end()}
                        data = null;
                    }
                });
            }else{
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        var con = false;
                        try {
                            con = conditions.eif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=false}
                        } catch (error) {
                            con=false;
                        }
                        try {
                            con = conditions.gif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=true}
                        } catch (error) {
                            con = true;
                        }
                        if(con){
                            ondata(data,dataRead);
                        }
                        if(con){get.end()}
                        data = null;
                    }
                });
            }
        }else if(getif){
            if(Returns){
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        var con = true;
                        try {
                            con = conditions.gif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=true}
                        } catch (error) {
                            con = true;
                        }
                        if(con){
                            try {
                                data = conditions.ret(data);
                            } catch (error) {}
                            ondata(data,dataRead);
                        }
                        data = null;
                    }
                    
                });
            }else{
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        var con = true;
                        try {
                            con = conditions.gif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=true}
                        } catch (error) {
                            con = true;
                        }
                        if(con){
                            ondata(data,dataRead);
                        }
                        data = null;
                    }
                    
                });
            }
        }else if(endif){
            if(Returns){
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        var con = false;
                        try {
                            con = conditions.eif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=false}
                        } catch (error) {
                            con=false;
                        }
                        try {
                            data = conditions.ret(data);
                        } catch (error) {}
                        ondata(data,dataRead);
                        if(con){get.end()}
                        data = null;
                    }
                });
            }else{
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        var con = false;
                        try {
                            con = conditions.eif(data,dataRead);
                            if(typeof (con)!=="boolean"){con=false}
                        } catch (error) {
                            con=false;
                        }
                        ondata(data,dataRead);
                        if(con){get.end()}
                        data = null;
                    }
                });
            }
        }else{
            if(Returns){
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        try {
                            data = conditions.ret(data);
                        } catch (error) {}
                        ondata(data,dataRead);
                        data = null;
                    }
                });
            }else{
                get.ondata(function(data){
                    dataRead++;
                    if(data){
                        ondata(data,dataRead);
                        data = null;
                    }
                });
            }
        }
    }else{
        onend(0);
    }
};
function readFromDT(dbname,tablename,storageColumn,id,conditions,ondata,onend,onerr){
    if(Databases[dbname]){
        let read = Databases[dbname].readFromDispersedStorage({
            tablename:tablename,id:id,storageColumn:storageColumn
        },onerr),dataRead=0,lastDataReadDate=null;
        if(typeof (conditions.atoz)==="number"){
            if(conditions.atoz==1){
                read.FIFO();
            }else{
                read.LIFO();
            }
        }
        read.limit(conditions.lim);
        if(typeof (conditions.wtime)==="number"){
            if(conditions.wtime==1){
                read.withTime();
            }else{
                read.withTimeStamp();
            }
        }
        if(conditions.stf){
            read.startFrom(conditions.stf.m,conditions.stf.d,conditions.stf.h,conditions.stf.min,conditions.stf.s);
        }
        read.date(conditions.dt.yr,conditions.dt.mn,conditions.dt.d);
        if(typeof (conditions.tm)==="object"){
            read.time(conditions.tm.hr,conditions.tm.min,conditions.tm.sec);
        }
        var endif = false;
        if(typeof (conditions.eif)==="string"){
            try {
                conditions.eif = new Function(`return ${conditions.eif}`);
                conditions.eif = conditions.eif();
                endif = true;
            } catch (error) {
                endif = false;
            }
        }
        var Returns = false;
        if(typeof (conditions.ret)==="string"){
            try {
                conditions.ret = new Function(`return ${conditions.ret}`);
                conditions.ret = conditions.ret();
                Returns = true;
            } catch (error) {
                Returns = false;
            }
        }
        if(endif){
            if(Returns){
                read.ondata(function(data){
                    if(data){
                        lastDataReadDate=data.pop();
                        dataRead+=data.length;
                        var con = false;
                        try {
                            con = conditions.eif(data,dataRead,lastDataReadDate);
                            if(typeof (con)!=="boolean"){con=false}
                        } catch (error) {
                            con=false;
                        }
                        try {
                            data = conditions.ret(data);
                        } catch (error) {}
                        ondata(data);
                        if(con){read.end()}
                        data = null;
                    }
                });
            }else{
                read.ondata(function(data){
                    if(data){
                        lastDataReadDate=data.pop();
                        dataRead+=data.length;
                        var con = false;
                        try {
                            con = conditions.eif(data,dataRead,lastDataReadDate);
                            if(typeof (con)!=="boolean"){con=false}
                        } catch (error) {
                            con=false;
                        }
                        ondata(data);
                        if(con){read.end()}
                        data = null;
                    }
                });
            }
        }else{
            if(Returns){
                read.ondata(function(data){
                    if(data){
                        lastDataReadDate=data.pop();
                        dataRead+=data.length;
                        try {
                            data = conditions.ret(data);
                        } catch (error) {}
                        ondata(data);
                        data = null;
                    }
                });
            }else{
                read.ondata(function(data){
                    if(data){
                        lastDataReadDate=data.pop();
                        dataRead+=data.length;
                        ondata(data);
                        data = null;
                    }
                });
            }
        }
        read.onend(function(){onend(dataRead,lastDataReadDate)});
        
    }else{
        onerr(ERRORS.DB_NOT_EXIST(dbname));
    }
};
function setDB_Path(path){
    var y = false;
    try {
        y = fs.existsSync(path);
        dbPath = path;
    } catch (error) {
        y = false;
    }
    return y;
};
function dbInstance(){
    var keys = Object.keys(Databases),i,obj={};
    for(i in keys){
        obj[keys[i]] = {TABLES:Databases[keys[i]].TABLES,DISPERSEDTABLES:Databases[keys[i]].DISPERSEDTABLES}
    }
    keys = null;
    return obj;
};
function tbInstance(db){
    return Databases[db].TABLES;
};
function d_tbInstance(db){
    return Databases[db].DISPERSEDTABLES;
};
function tbRows(db,tb){
    return Databases[db].TABLES[tb].rows;
};
function d_tbRows(db,tb){
    return Databases[db].DISPERSEDTABLES[tb].rows;
};
const ERRORS = {
    WRONG_ARGS:{message:"Received wrong arguments",code:"W_ARGS"},
    DB_NOT_EXIST:function(db_name){return {message:`No database exists as: <${db_name}>`,code:"DB_!EX"}},
    DB_EXIST:function(db_name){return {message:`Database name <${db_name}> exists`,code:"DB_EX"}},
    TB_NOT_EXIST:function(tb_name,db_name){return {message:`Table name: <${tb_name}> does not exist in database name: <${db_name}>`,code:"TB_!EX"}},
    TB_EXIST:function(tb_name,db_name){return {message:`Table name: <${tb_name}> exists in database name: <${db_name}>`,code:"TB_EX"}},

};
module.exports = {
    get_del_update_D_data,
    delAllRows,
    del_get_exist_row,
    create_update_row,
    createDTable,
    createTable,
    createDatabase,
    setDB_Path,
    setUpDatabases,
    dbInstance,
    tbInstance,
    d_tbInstance,
    tbRows,
    d_tbRows,
    getAllRows,
    _wToDStorage,
    readFromDT,
    override_fs:function(new_fs){
        ndb.override_fs=new_fs;
    },
    max_P_O_Files:function(numb){
        ndb.maxParallelOpenedFiles=numb;
    }
}

