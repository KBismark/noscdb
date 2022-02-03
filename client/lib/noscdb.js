const {
    createDatabase, connect, createDTable, createTable, NumberOfRows, NumberOfDRows, createRow,
    updateRow, getRow, delRow, rowExists, delAllRows, getInstance, getAllRows, _wToDStorage,
    up_get_del_D_Data,readFromDS,ClearTimeout
} = require("./client.js");
var net = require("net");
net = null;
/**
 * 
 * @param {(err:{code:string,path:string}|false)} cb
 */
function emptyfunc(cb){};
var sym=Symbol();
function getDatabaseObject(){
    return {
        /**
         * 
         * @param {string} db_name 
         * @param {(err:Error,created:boolean)} callback 
         */
        createDatabase:function(db_name,callback){
            createDatabase(db_name,callback,this);
        },
        N_ofRows:NumberOfRows,
        N_ofDispersedRows:NumberOfDRows,
        /**
         * Get an instance of databases. This helps to know your created databases and the tables in each. 
         * 
         * ```js
         * console.log(db.getInstance()); 
         * // Logs 
         * //     { 
         * //        database_name1:{ 
         * //           TABLES:{ 
         * //               table1:{ columns:[c1,c2,...],rows:10},...
         * //           },
         * //           DIPERSEDTABLES:{ 
         * //               table1:{ columns:[c1,c2,...],rows:102},...
         * //           }
         * //        },...
         * //     }
         * 
         * console.log(db.getInstance('databse_name1','databse_name2')); 
         * // Logs 
         * //      { 
         * //        database_name1:{ 
         * //           TABLES:{ 
         * //                table1:{ columns:[c1,c2,...],rows:10},
         * //                table2:{ columns:[c1,c2,...],rows:0},...
         * //           },
         * //           DIPERSEDTABLES:{ 
         * //                table1:{ columns:[c1,c2,...],rows:102},...
         * //           }
         * //        },
         * //        database_name2:{ 
         * //           TABLES:{ 
         * //                table1:{ columns:[c1,c2,...],rows:100},...
         * //           },
         * //           DIPERSEDTABLES:{ 
         * //                table1:{ columns:[c1,c2,...],rows:9},
         * //                table2:{ columns:[c1,c2,...],rows:0},...
         * //           }
         * //        }
         * //     }
         * //
         * ```
         */
        getInstance:getInstance,
        /**
         * 
         * @param {{db_name:string,tablename:string,columns:string[]}} o An object with the name of the database to 
         * access, the table's name and the table's columns.
         * 
         * `o.db_name` Case insensitive, alphanumeric and underscore. Must begin with an alphabet.
         * 
         * `o.tablename` Case insensitive, alphanumeric and underscore. Must begin with an alphabet.
         * 
         * `o.columns` Alphanumeric and underscore. Must begin with an alphabet. `toLowerCase()` is called on columns. 
         * @example
         * ```js
         * db.createTable({
         *      db_name:'database_name',tablename:'table_name',
         *      columns:['COLUMN1','cOLumN2','column3'] // Will change to ['column1','column2','column3']
         * },callback);
         * 
         * ```
         * @param {(err:Error,created:boolean)=>void} callback 
         */
        createTable:function(o,callback){
            createTable(o.db_name,o.tablename,o.columns,callback,this);
        },
        /**
         * 
         * @param {{db_name:string,tablename:string,columns:string[],storageColumns:string[]}} o  An object with the name of the database to 
         * access, the table's name and the table's columns.
         * 
         * `o.db_name` Case insensitive, alphanumeric and underscore. Must begin with an alphabet.
         * 
         * `o.tablename` Case insensitive, alphanumeric and underscore. Must begin with an alphabet.
         * 
         * `o.columns` Alphanumeric and underscore. Must begin with an alphabet . `toLowerCase()` is called on columns. 
         * 
         * `o.storageColumns` Alphanumeric and underscore. Must begin with an alphabet. `toLowerCase()` is called on storageColumns. 
         * @example
         * ```js
         * db.createDispersedTable({
         *      db_name:'database_name',tablename:'table_name',
         *      columns:['COLUMN1','cOLumN2','column3'] // Will change to ['column1','column2','column3'],
         *      storageColumns:['COLUMN1','cOLumN2','column3'] // Becomes ['column1','column2','column3']
         * },callback);
         * ```
         * 
         * @param {(err:Error,created:boolean)=>void} callback 
         */
         createDispersedTable:function(o,callback){
            createDTable(o.db_name,o.tablename,o.columns,o.storageColumns,callback,this);
        },
        /**
         * @param {string} db_name The database to access.
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
        * @param {(err:Error,created:boolean)=>void} callback An optional callback that is called with a boolean as argument.
        * 
        *  A `true` passed as argument to the callback indicates that a new row is succesfully created. 
        
        *  A `false` passed as argument to the callback indicates that the identifier already exists
        hence, row creation was unsuccessful. 


        */
        createRow:function(db_name,tablename,id,columnsObject,callback){
            createRow(db_name,tablename,id,columnsObject,callback,false,this);
        },
        /**
         * @param {string} db_name The database to access.
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
         * @param {(err:Error,created:boolean)=>void} callback An optional callback that is called with a boolean as argument.
         * 
         *  A `true` passed as argument to the callback indicates that a new row is succesfully created. 
         
        *  A `false` passed as argument to the callback indicates that the identifier already exists
        hence, row creation was unsuccessful. 
        *
        */
        createDispersedRow:function(db_name,tablename,id,columnsObject,callback){
            createRow(db_name,tablename,id,columnsObject,callback,true,this);
        },
        /**
         * Upadtes a row in a table.
         * 
         * @param {string} db_name The database to access.
         * @param {string} tablename The table for which a row is to be updated.
         * @param {string} id The identifier of the row to update.
         * @param {{}} columnsObject An `object` with the column(s) to update as properties set to their corresponding values.
         * 
         * Accepted value types: [`String`,`Number`,`Boolean`,`Serializable objects`]
         * 
         * If value type is not accepted, `null` is used instead.
         * @param {(err:Error,updated:boolean)=>void} callback An `'Optional'` callback that receives a `boolean` as an argument
         * indicating whether updation was successful or not.
         *  
         */
        updateRow:function(db_name,tablename,id,columnsObject,callback){
            updateRow(db_name,tablename,id,columnsObject,callback,2,this);
        },
        /**
         * Gets data, modifies data and updates row.
         * 
         * @param {string} db_name The database to access.
         * @param {string} tablename The table for which a row is to be updated.
         * @param {string} id The identifier of the row to update.
         * @param {string|(data:{})=>data} onget This function is called with the data as argument. 
         * Modify data fields (columns only) in this function. **It must return an object with the table-columns' fields to update.**
         * 
         * @param {(err:Error,updated:boolean)=>void} callback A callback that receives a `boolean` as an argument
         * indicating whether updation was successful or not.
         *  
         */
        getAndUpdateRow:function(db_name,tablename,id,callback,onget){
            if(typeof (onget)!=="string"){
                if(typeof (onget)==="function"){
                    onget = onget.toString();
                }else{
                    callback({message:"Received wrong arguments",code:"W_ARGS"},NaN);
                    return;
                }
            }
            updateRow(db_name,tablename,id,onget,callback,4,this);
        },
        /**
         * Upadtes a row in a dispersed table.
         * 
         * @param {string} db_name The database to access.
         * @param {string} tablename The table for which a row is to be updated.
         * @param {string} id The identifier of the row to update.
         * @param {{}} columnsObject An `object` with the column(s) to update as properties set to their corresponding values.
         * 
         * Accepted value types: [`String`,`Number`,`Boolean`,`Serializable objects`]
         * 
         * If value type is not accepted, `null` is used instead.
         * @param {(err:Error,updated:boolean)=>void} callback An `'Optional'` callback that receives a `boolean` as an argument
         * indicating whether updation was successful or not.
         *  
         */
        updateDispersedRow:function(db_name,tablename,id,columnsObject,callback){
            updateRow(db_name,tablename,id,columnsObject,callback,1,this);
        },
        /**
         * Gets data, modifies data and updates dispersed row.
         * 
         * @param {string} db_name The database to access.
         * @param {string} tablename The table for which a row is to be updated.
         * @param {string} id The identifier of the row to update.
         * @param {string|(data:{})=>data} onget This function is called with the data as argument. 
         * Modify data fields (columns only) in this function. **It must return an object with the table-columns' fields to update.**
         * 
         * @param {(err:Error,updated:boolean)=>void} callback A callback that receives a `boolean` as an argument
         * indicating whether updation was successful or not.
         *  
         */
        getAndUpdateDispersedRow:function(db_name,tablename,id,callback,onget){
            if(typeof (onget)!=="string"){
                if(typeof (onget)==="function"){
                    onget = onget.toString();
                }else{
                    callback({message:"Received wrong arguments",code:"W_ARGS"},NaN);
                    return;
                }
            }
            updateRow(db_name,tablename,id,onget,callback,3,this);
        },
        /**
         * Removes a row from a table.
         * @param {string} db_name The database name to access.
         * @param {string} tablename The tablename from which to delete row.
         * @param {string} id The `id` of the row to delete. 
         * @param {(err:Error,deleted:boolean)=>void} callback
         */
        delRow:function(db_name,tablename,id,callback){
            delRow(db_name,tablename,id,callback,false,this);
        },
        /**
         * Removes a row from a dispersed table.
         * @param {string} db_name The database name to access.
         * @param {string} tablename The tablename from which to delete row.
         * @param {string} id The `id` of the row to delete. 
         * @param {(err:Error,deleted:boolean)=>void} callback
         */
        delDispersedRow:function(db_name,tablename,id,callback){
            delRow(db_name,tablename,id,callback,true,this);
        },
        /**
         * Removes all rows from a table.
         * @param {string} db_name The database name to access.
         * @param {string} tablename The tablename from which to retreive data.
         * @param {(err:Error,deleted:boolean)=>void} callback
         */
        delTable:function(db_name,tablename,callback){
            delAllRows(db_name,tablename,callback,false,this);
        },
        /**
         * Removes all rows from a dispersed table.
         * @param {string} db_name The database name to access.
         * @param {string} tablename The tablename from which to retreive data.
         * @param {(err:Error,deleted:boolean)=>void} callback
         */
        delDispersedTable:function(db_name,tablename,callback){
            delAllRows(db_name,tablename,callback,true,this);
        },
        
        /**
         * Retrieves row's data from a table
         * @param {string} db_name The database to access.
         * @param {string} tablename 
         * @param {string} id 
         * @param {(err:Error,data:{})=>void} callback `Required`
         * @param {string|(data:{})=>any|undefined} returnFunction If row doesn't exist, `returnFunction` is not executed.
         * 
         */
        getRow:function(db_name,tablename,id,callback,returnFunction){
            if(typeof (returnFunction)!=="string"){
                if(typeof (returnFunction)==="function"){
                    returnFunction = returnFunction.toString();
                }else{
                    returnFunction=1
                }
            }
            getRow(db_name,tablename,id,callback,false,returnFunction,this);
        },
        /**
         * Retrieves row's data from a dispersed table.
         * @param {string} db_name The database to access.
         * @param {string} tablename 
         * @param {string} id 
         * @param {(err:Error,data:{})=>void} callback `Required`
         * @param {string|(data:{})=>any|undefined} returnFunction If row doesn't exist, `returnFunction` is not executed.
         * 
         */
        getDispersedRow:function(db_name,tablename,id,callback,returnFunction){
            if(typeof (returnFunction)!=="string"){
                if(typeof (returnFunction)==="function"){
                    returnFunction = returnFunction.toString();
                }else{
                    returnFunction=1
                }
            }
            getRow(db_name,tablename,id,callback,true,returnFunction,this);
        },
        /**
         * Checks if a row exists in a table.
         * @param {string} db_name The database to access.
         * @param {string} tablename 
         * @param {string} id 
         * @param {(err:Error,exists:boolean)=>void} callback `Required`
         */
        rowExists:function(db_name,tablename,id,callback){
            rowExists(db_name,tablename,id,callback,false,this);
        },
        /**
         * Checks if a row exists in a dispersed table.
         * @param {string} db_name The database to access.
         * @param {string} tablename 
         * @param {string} id 
         * @param {(err:Error,exists:boolean)=>void} callback `Required`
         */
        dispersedRowExists:function(db_name,tablename,id,callback){
            rowExists(db_name,tablename,id,callback,true,this);
        },
        /**
         * Gets all rows' data in a table.
         * @param {string} db_name The database name to access.
         * @param {string} tablename The tablename from which to retreive data.
         */
        getAllRows:function(db_name,tablename){
            var ondataFuncs = [],onendFuncs = [],called=false,
            acceptCallbacks = {acceptOnDataFuncs:true,acceptOnEndFuncs:true},
            conditions = {lim:{start:1}},This=this,onError;
            return {
                /**
                 * Register listeners to be called when data is retreived. 
                 * All listeners passed as argument to this method is executed anytime a row's data is retrieved.
                 * @param {(data:{},nth_data_read:number)} callback 
                * A callback that is executed anytime a row's data is retrieved. Each row's data and the 
                 * current `nth` data retreived are passed as argument to the callback anytime data is retrieved. 
                 * 
                 * The `nth` data retreived or read is counted from the start number of 
                 * `this.limit({start:number,end:number})`. If `this.limit()` is not called, counts from 1.
                 * 
                 * @returns this
                 */
                ondata:function(callback){
                    if(acceptCallbacks.acceptOnDataFuncs){
                        ondataFuncs.push(callback);
                        if(!called){
                            called=true;
                            getAllRows(db_name,tablename,false,conditions,ondataFuncs,onendFuncs,onError,acceptCallbacks,This);
                            This=null;
                        }
                    }
                    return this;
                },
                [sym]:function(callback,t){
                    if(acceptCallbacks.acceptOnDataFuncs){
                        ondataFuncs.push(callback);
                        if(!called){
                            called=true;
                            getAllRows(db_name,tablename,false,conditions,ondataFuncs,onendFuncs,onError,acceptCallbacks,This,t);
                            This=null;
                        }
                    }
                    return this;
                },
                /**
                 * Register listeners to be called when data retreival has ended. 
                 * All listeners passed as argument to this method will be called after data retreival. 
                 * @param {(total_num_of_data_read:number)} callback 
                 * A callback that is executed after data retreival. 
                 * 
                 * @returns this
                 */
                onend:function(callback){
                    if(typeof (acceptCallbacks.acceptOnEndFuncs)){
                        onendFuncs.push(callback);
                    }
                    return this;
                },
                /**
                 * Register a listener to be called if error occurs.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {(err:Error)} callback Called if an error occurs.
                 */
                 onerror:function(callback){
                    onError = callback;
                    return this;
                },
                /**
                 * A limit object to set the start and end of rows to retrieve data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {{start:number,end:number}} rangeObject 
                 * `rangeObject.start` If lesser than 1, defaults to `1`, the first row. 
                 * 
                 * `rangeObject.end` If greater than the number of rows in table, defaults to the last row in table.
                 * @returns this
                 */
                limit:function(rangeObject){
                    if(typeof (rangeObject.start)==="number"){conditions.lim.start=rangeObject.start}
                    if(typeof (rangeObject.end)==="number"){conditions.lim.end=rangeObject.end}
                    return this;
                },
                /**
                 * Set conditions to retreive row's data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {string|(data:{},nth_data_read:number)=>void} conditionFunction A function that must return a boolean to determine whether 
                 * a row's data is to be retreived or not. This function will be passed data each time a row's data is retreived from 
                 * the table. 
                 * 
                 * The condition function is assumed to return `true` if it does not return a boolean value 
                 * or if an error occurs when it is called.
                 * @example
                 * ```js
                 *  // Retreive data if data.age is greater than 12
                 *  var get = db.getAllRows('database_name','table_name');
                 *  get.getif(function(data){
                 *     return data.age>12; // Returns true if data.age is greater than 12
                 *  });
                 * 
                 *  get.ondata((err,data)=>{
                 *      if(err){console.log(err);}
                 *      else{console.log(data.age);}
                 *  })
                 * 
                 * ```
                 * @returns `this`
                 */
                getif:function(conditionFunction){
                    if(typeof (conditionFunction)==="function"){conditions.gif=conditionFunction.toString()}
                    else if(typeof (conditionFunction)==="string"){conditions.gif=conditionFunction}
                    return this;
                },
                /**
                 * Set conditions to stop data retreival.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {string|(data:{},nth_data_read:number)=>void} conditionFunction A function that must return a boolean to determine the end of 
                 * data retreival. This function will be passed data each time a row's data is retreived from 
                 * the table. 
                 * 
                 * The condition function is assumed to return `false` if it does not return a boolean value 
                 * or if an error occurs when it is called.
                 * @example
                 * ```js
                 *  // Stops retreiving data if the first data with name starting with 'W' is found.
                 *  var get = db.getAllRows('database_name','table_name');
                 * 
                 *  get.endif(function(data){
                 *     return data.name.startsWith('W'); // Returns true if data.name starts with 'W'
                 *  });
                 * 
                 *  get.ondata((err,data)=>{
                 *      if(err){console.log(err);}
                 *      else{console.log(data.name);}
                 *  })
                 * 
                 * ```
                 * @returns `this`
                 */
                endif:function(conditionFunction){
                    if(typeof (conditionFunction)==="function"){conditions.eif=conditionFunction.toString()}
                    else if(typeof (conditionFunction)==="string"){conditions.eif=conditionFunction}
                    return this;
                },
                /**
                 * Set conditions to retreive row's data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {string|(data:{})=>void} returnFunction A function that must return a boolean to determine whether 
                 * a row's data is to be retreived or not. This function will be passed data each time a row's data is retreived from 
                 * the table. The condition function is assumed to return `true` if it does not return a boolean value 
                 * or if an error occurs when it is called.
                 * @example
                 * ```js
                 *  // Retreive data if data.age is greater than 12
                 *  var get = db.getAllRows('database_name','table_name');
                 *  get.getif(function(data){
                 *     return data.age>12; // Returns true if data.age is greater than 12
                 *  });
                 * 
                 *  get.ondata((err,data)=>{
                 *      if(err){console.log(err);}
                 *      else{console.log(data.age);}
                 *  })
                 * 
                 * ```
                 * @returns `this`
                 */
                returns:function(returnFunction){
                    if(typeof (returnFunction)==="function"){conditions.ret=returnFunction.toString()}
                    else if(typeof (returnFunction)==="string"){conditions.ret=returnFunction}
                    return this;
                },
                /**
                 * Sort rows by `id` before retreiving data. By default, rows would 
                 * be retreived in order of time stored if `sortById()` is not called.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {boolean} descending If `false` or not defined, sorts rows in ascending order.
                 */
                sortById:function(descending){
                    if(typeof (descending)==="boolean"){conditions.srt=descending}
                    else{conditions.srt=false}
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
                    if(typeof (descending)==="boolean"){conditions.srt_t=descending}
                    else{conditions.srt_t=false}
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
                    if(typeof (value)==="string"){conditions.stval=value}
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
                    if(typeof (value)==="string"){conditions.enval=value}
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
                    if(typeof (value)==="string"){conditions.inval=value}
                    return this;
                },
            };
        },
        /**
         * Gets all rows' data in a dispersed table.
         * @param {string} db_name The database name to access.
         * @param {string} tablename The tablename from which to retreive data.
         */
        getAllDispersedRows:function(db_name,tablename){
            var ondataFuncs = [],onendFuncs = [],called=false,
            acceptCallbacks = {acceptOnDataFuncs:true,acceptOnEndFuncs:true},
            conditions = {lim:{start:1}},This=this,onError;
            return {
                /**
                 * Register listeners to be called when data is retreived. 
                 * All listeners passed as argument to this method is executed anytime a row's data is retrieved.
                 * @param {(data:{},nth_data_read:number)} callback 
                 * A callback that is executed anytime a row's data is retrieved. Each row's data and the 
                 * current `nth` data retreived are passed as argument to the callback anytime data is retrieved. 
                 * 
                 * The `nth` data retreived or read is counted from the start number of 
                 * `this.limit({start:number,end:number})`. If `this.limit()` is not called, counts from 1.
                 * 
                 * @returns this
                 */
                ondata:function(callback){
                    if(acceptCallbacks.acceptOnDataFuncs){
                        ondataFuncs.push(callback);
                        if(!called){
                            called=true;
                            getAllRows(db_name,tablename,true,conditions,ondataFuncs,onendFuncs,onError,acceptCallbacks,This);
                            This=null;
                        }
                    }
                    return this;
                },
                /**
                 * Register listeners to be called when data retreival has ended. 
                 * All listeners passed as argument to this method will be called after data retreival. 
                 * @param {(total_num_of_data_read:number)} callback 
                 * A callback that is executed after data retreival. 
                 * 
                 * @returns this
                 */
                onend:function(callback){
                    if(typeof (acceptCallbacks.acceptOnEndFuncs)){
                        onendFuncs.push(callback);
                    }
                    return this;
                },
                /**
                 * Register a listener to be called if error occurs.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {(err:Error)} callback Called if an error occurs.
                 */
                onerror:function(callback){
                    onError = callback;
                    return this;
                },
                /**
                 * A limit object to set the start and end of rows to retrieve data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {{start:number,end:number}} rangeObject 
                 * `rangeObject.start` If lesser than 1, defaults to `1`, the first row. 
                 * 
                 * `rangeObject.end` If greater than the number of rows in table, defaults to the last row in table.
                 * @returns this
                 */
                limit:function(rangeObject){
                    if(typeof (rangeObject.start)==="number"){conditions.lim.start=rangeObject.start}
                    if(typeof (rangeObject.end)==="number"){conditions.lim.end=rangeObject.end}
                    return this;
                },
                /**
                 * Set conditions to retreive row's data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {string|(data:{},nth_data_read:number)=>void} conditionFunction A function that must return a boolean to determine whether 
                 * a row's data is to be retreived or not. This function will be passed data as argument each time a row's data
                 *  is retreived from the table. 
                 * 
                 * The condition function is assumed to return `true` if it does not return a 
                 * boolean value or if an error occurs when it is called.
                 * 
                 * @example
                 * ```js
                 *  // Retreive data if data.age is greater than 12
                 *  var get = db.getAllRows('database_name','table_name');
                 *  get.getif(function(data){
                 *     return data.age>12; // Returns true if data.age is greater than 12
                 *  });
                 * 
                 *  get.ondata((err,data)=>{
                 *      if(err){
                 *          console.log(err);
                 *      }else{
                 *          console.log(data.age);
                 *      }
                 *  })
                 * 
                 * ```
                 * @returns `this`
                 */
                getif:function(conditionFunction){
                    if(typeof (conditionFunction)==="function"){conditions.gif=conditionFunction.toString()}
                    else if(typeof (conditionFunction)==="string"){conditions.gif=conditionFunction}
                    return this;
                },
                /**
                 * Set conditions to stop data retreival.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {string|(data:{},nth_data_read:number)=>void} conditionFunction A function that must return a boolean to determine the end of 
                 * data retreival. This function will be passed data as argument each time a row's data is retreived from 
                 * the table.
                 * 
                 *  The condition function is assumed to return `false` if it does not return a boolean value 
                 * or if an error occurs when it is called.
                 * @example
                 * ```js
                 *  // Stops retreiving data if the first data with name starting with 'W' is found.
                 *  var get = db.getAllRows('database_name','table_name');
                 * 
                 *  get.endif(function(data){
                 *     return data.name.startsWith('W'); // Returns true if data.name starts with 'W'
                 *  });
                 * 
                 *  get.ondata((data)=>{
                 *      console.log(data.name);
                 *  });
                 * 
                 * ```
                 * @returns `this`
                 */
                endif:function(conditionFunction){
                    if(typeof (conditionFunction)==="function"){conditions.eif=conditionFunction.toString()}
                    else if(typeof (conditionFunction)==="string"){conditions.eif=conditionFunction}
                    return this;
                },
                /**
                 * Set conditions to retreive row's data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {string|(data:{})=>void} returnFunction A function that must return a boolean to determine whether 
                 * a row's data is to be retreived or not. This function will be passed data each time a row's data is retreived from 
                 * the table. The condition function is assumed to return `true` if it does not return a boolean value 
                 * or if an error occurs when it is called.
                 * @example
                 * ```js
                 *  // Retreive data if data.age is greater than 12
                 *  var get = db.getAllRows('database_name','table_name');
                 *  get.getif(function(data){
                 *     return data.age>12; // Returns true if data.age is greater than 12
                 *  });
                 * 
                 *  get.ondata((err,data)=>{
                 *      if(err){console.log(err);}
                 *      else{console.log(data.age);}
                 *  })
                 * 
                 * ```
                 * @returns `this`
                 */
                returns:function(returnFunction){
                    if(typeof (returnFunction)==="function"){conditions.ret=returnFunction.toString()}
                    else if(typeof (returnFunction)==="string"){conditions.ret=returnFunction}
                    return this;
                },
                /**
                 * Sorts rows by `id` before retreiving data. By default, rows would 
                 * be retreived in order of time stored if `sortById()` is not called.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {boolean} descending If `false` or not defined, sorts rows in ascending order.
                 */
                sortById:function(descending){
                    if(typeof (descending)==="boolean"){conditions.srt=descending}
                    else{conditions.srt=false}
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
                    if(typeof (descending)==="boolean"){conditions.srt_t=descending}
                    else{conditions.srt_t=false}
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
                    if(typeof (value)==="string"){conditions.stval=value}
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
                    if(typeof (value)==="string"){conditions.enval=value}
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
                    if(typeof (value)==="string"){conditions.inval=value}
                    return this;
                },
                [sym]:function(callback,t){
                    if(acceptCallbacks.acceptOnDataFuncs){
                        ondataFuncs.push(callback);
                        if(!called){
                            called=true;
                            getAllRows(db_name,tablename,true,conditions,ondataFuncs,onendFuncs,onError,acceptCallbacks,This,t);
                            This=null;
                        }
                    }
                    return this;
                }
            };
        },
        /**
         * 
         * @param {string} db_name 
         * @param {string} tablename 
         * @param {string} id 
         * @param {string} storageColumn 
         */
         readFromDispersedStorage:function(db_name,tablename,id,storageColumn){
            var ondataFuncs = [],onendFuncs = [],called=false,
            acceptCallbacks = {acceptOnDataFuncs:true,acceptOnEndFuncs:true},
            conditions = {},This=this,onError,date={yr:0,mn:"",d:""},time={hr:"",min:"",sec:""};
            conditions.dt = date;
            return {
                /**
                 * Set the date range to read data. `Required` 
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {number} year The `year` must always be a `number` corresponding to the year from which to retreive data. `Required`
                 * @param {number|{from:number,to:number}} month **RANGE**: `1-12`|`12-1` January to December or vice versa. `Required`
                 * 
                 * The range `{from:1,to:12}` conforms to the `FIFO()` method and 
                 * `{from:12,to:1}` conforms to the `LIFO()` method.
                 * 
                 * The `month` is either a `number` corresponding to the month in which 
                 * data is to be retreived or an `object` with two properties; `from`: the start month and `to`: the end month from which data is to be retreived.
                 *  
                 * 
                 * @param {number|{from:number,to:number}} day **RANGE**: `1-31`|`31-1` `Required`
                 * 
                 * The range `{from:1,to:31}` conforms to the `FIFO()` method and 
                 * `{from:31,to:1}` conforms to the `LIFO()` method.
                 * 
                 * The `day` is either a `number` corresponding to the day in which 
                 * data is to be retreived or an `object` with two properties; `from`: the start day and `to`: the end day from which data is to be retreived.
                 * 
                 * @returns this
                 * 
                */
                date:function(year,month,day){
                    if(typeof (year)==="number"){
                        date.yr = year;
                        date.mn = month;
                        date.d = day;
                    }
                    conditions.dt = date;
                    return this;
                },
                /**
                 * Set the time range to read data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {number|{from:number,to:number}} hour **RANGE**: `0-23` [Uses the 24-Hour format]
                 * 
                 * The `hour` is either a `number` corresponding to the hour in which 
                 * data is to be retreived or an `object` with two properties; `from`: the start hour and `to`: the end hour from which data is to be retreived.
                 *  
                 * 
                 * 
                 * @param {number|{from:number,to:number}} minute **RANGE**: `0-59`
                 * 
                 * The `minute` is either a `number` corresponding to the minute in which 
                 * data is to be retreived or an `object` with two properties; `from`: the start minute and `to`: the end minute from which data is to be retreived.
                 *  
                 * 
                 * 
                 * @param {number|{from:number,to:number}} second **RANGE**: `0-59`
                 * 
                 * The `second` is either a `number` corresponding to the second in which 
                 * data is to be retreived or an `object` with two properties; `from`: the start second and `to`: the end second from which data is to be retreived.
                 *  
                 * @returns this
                 * 
                */
                time:function(hour,minute,second){
                    time.hr = hour;
                    time.min = minute;
                    time.sec = second;
                    conditions.tm = time;
                    return this;
                },
                /**
                 * Register listeners to be called when data is retreived. 
                 * All listeners passed as argument to this method is executed everytime data is read.
                 * @param {(dataArray:[]|any)} callback 
                 * A callback that is executed anytime a row's data is retrieved. Each row's data is passed as argument 
                 * to the callback anytime data is retrieved. 
                 * 
                 ** `dataArray` This is an array of data read currently or what `returnFunction` returned.
                 ** 
                 * @returns this
                 */
                ondata:function(callback){
                    if(acceptCallbacks.acceptOnDataFuncs){
                        ondataFuncs.push(callback);
                        if(!called){
                            called=true;
                            readFromDS(db_name,tablename,id,storageColumn,conditions,ondataFuncs,onendFuncs,onError,acceptCallbacks,This);
                            This=null;
                        }
                    }
                    return this;
                },
                /**
                 * Register listeners to be called when data retreival has ended. 
                 * All listeners passed as argument to this method will be called after all data is read. 
                 * @param {(total_num_of_data_read:number,last_data_read_date:{
                 *  year:number,month:number,day:number,hour:number,minute:number,second:number
                 * })=>void} callback 
                 * A callback that is executed after data retreival. 
                 *
                 ** `total_num_of_data_read` This is the total number of data read before data retreival ended.
                 ** 
                 ** `last_data_read_date` This is the created date's object of the set of data read just before data retreival ended.
                 ** 
                 * @returns this
                 */
                onend:function(callback){
                    if(typeof (acceptCallbacks.acceptOnEndFuncs)){
                        onendFuncs.push(callback);
                    }
                    return this;
                },
                /**
                 * Register a listener to be called if error occurs.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {(err:Error)} callback Called if an error occurs.
                 */
                 onerror:function(callback){
                    onError = callback;
                    return this;
                },
                /**
                 * Determine the `number of seconds` to retreive written data from the `date()` and `time()` specified. 
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {{start:number|undefined,end:number|undefined}} limitObject 
                 * 
                 * `limObject.start` Number or Undefined. `Default` is 1, which is the first second data was written within the time range specified.
                 * 
                 * `limObject.end` Number or Undefined. `Default` is the number of times (seconds) data was written in the 
                 * `date()` and `time()` specified, which is the last second data was written within the time range specified.
                 * 
                 * ---
                 * #### NOTE: 
                 * 
                 * `'number of seconds'` is not equal to `'number of data read'`
                 * @returns this
                 * 
                */
                limit:function(limitObject){
                    conditions.lim = limitObject;
                    return this;
                },
                /**
                 * Set conditions to retreive row's data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {(dataArray:[])=>any} returnFunction This function will be passed an array of data read, number of data read so far and
                 * the current data read's created date's object as arguments everytime data is reteived.
                 * 
                 * Anything returned by this function is passed as argument to the `ondata()` callback(s).
                 * If an error occurs while this function is called, the array of data is returned and passed to the 
                 * `ondata()` callback(s).
                 * 
                 ** `dataArray` This is an array of data read currently. All the data in this array was written at the same time (second).
                 ** 
                 * @example
                 * ```js
                 *  // Retreive all response starting with 'yes'
                 *  var read = db.readFromDispersedStorage('database_name','table_name','id','storageColumn_name');
                 *  var mywantedArr = [];
                 *  read.returns(function(dataArr,num_of_data_read,nth__data_read_date){
                 *      var i,wantedArr = [];
                 *      for(i=0;i<dataArr.length;i++){
                 *          if(dataArr[i].response.startsWith('yes')){
                 *              wantedArr.push(dataArr[i].response);
                 *          }
                 *      }
                 *     return wantedArr;
                 *  })
                 * .ondata(function(wantedArr,num_of_data_read){
                 *      mywantedArr = mywantedArr.concat(wantedArr);
                 *  })
                 * .onend(function(total_num_of_data_read,last_data_read_date){
                 *      console.log(mywantedArr);
                 *      console.log(total_num_of_data_read);
                 *      console.log(last_data_read_date);
                 *  })
                 * 
                 * ```
                 * @returns `this`
                 */
                returns:function(returnFunction){
                    if(typeof (returnFunction)==="function"){conditions.ret=returnFunction.toString()}
                    else if(typeof (returnFunction)==="string"){conditions.ret=returnFunction}
                    return this;
                },
                /**
                 * Set conditions to stop data retreival.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * @param {(dataArray:[],num_of_data_read:number,nth_data_read_date:{
                 *  year:number,month:number,day:number,hour:number,minute:number,second:number
                 * })=>void} conditionFunction A function that must return a boolean to determine the end of 
                 * data retreival. This function will be passed an array of data each time data is retreived from 
                 * the storage. The condition function is assumed to return `false` if it does not return a boolean value 
                 * or if an error occurs when it is called.
                 * 
                 ** `dataArray` This is an array of data read currently. All the data in this array was written at the same time (second).
                 ** 
                 ** `num_of_data_read` This is the sum of the number of all data read previously and the number of data read currently.
                 ** 
                 ** `nth_data_read_date` This is the created date's object of the set of data read currently.
                 ** 
                 * @returns `this`
                 */
                endif:function(conditionFunction){
                    if(typeof (conditionFunction)==="function"){conditions.eif=conditionFunction.toString()}
                    else if(typeof (conditionFunction)==="string"){conditions.eif=conditionFunction}
                    return this;
                },
                /**
                 * Data is retreived in ascending order with respect to only the time (not date) stored in database.
                 * It uses a First-In-First-Out method to retreive data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * 
                 * ---
                 * **NOTE:**
                 * `FIFO()` and `LIFO()` are mutualy exclusive methods. The last method 
                 * called is always chosen.
                 * 
                */
                FIFO:function(){
                    conditions.atoz=1;
                    return this;
                },
                /**
                 * Data is retreived in descending order with respect to only the time (not date) stored in database.
                 * It uses a Last-In-First-Out method to retreive data.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * 
                 * ---
                 * **NOTE:**
                 * `FIFO()` and `LIFO()` are mutualy exclusive methods. The last method 
                 * called is always chosen.
                 *  
                */
                LIFO:function(){
                    conditions.atoz=0;
                    return this;
                },
                /**
                 * Adds the `$time` property to each data in the data array. 
                 * The `$time` property is an object with the time data was created info.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * 
                 * ---
                 * **NOTE:**
                 * `withTime()` and `withTimeStamp()` are mutualy exclusive methods. The last method 
                 * called is always chosen.
                 * 
                 * @returns this
                 */
                withTime:function(){
                    conditions.wtime=1;
                    return this;
                },
                /**
                 * Adds the `$timestamp` property to each data in the data array. 
                 * The `$timestamp` property is a string with the time data was created info.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * 
                 * ---
                 * **NOTE:**
                 * `withTime()` and `withTimeStamp()` are mutualy exclusive methods. The last method 
                 * called is always chosen.
                 * 
                 * @returns this
                 */
                withTimeStamp:function(){
                    conditions.wtime=2;
                    return this;
                },
                [sym]:function(callback,t){
                    if(acceptCallbacks.acceptOnDataFuncs){
                        ondataFuncs.push(callback);
                        if(!called){
                            called=true;
                            readFromDS(db_name,tablename,id,storageColumn,conditions,ondataFuncs,onendFuncs,onError,acceptCallbacks,This,t);
                            This=null;
                        }
                    }
                    return this;
                },
                /**
                 * Set the date and time from which to start reading data. The data is read from the date object (inclusive) 
                 * passed as argument.
                 * 
                 * **`TIP:`** Pass the `last_data_read_date` object to this method to continue reading data from where 
                 * you previously left.
                 * 
                 * **Must be called before the first `ondata()` method is called.**
                 * 
                 * @param {{
                 *      month:number|undefined,day:number|undefined,hour:number|undefined,
                 *      minute:number|undefined,second:number|undefined
                 * }} o 
                 * 
                 */
                startFrom:function(o){
                    conditions.stf={
                        m:o.month,d:o.day,h:o.hour,
                        min:o.minute,s:o.second
                    }
                    return this;
                }
            };
        },
        /**
         * 
         * @param {string} db_name 
         * @param {string} tablename 
         * @param {string} id 
         * @param {string} storageColumn 
         * @param {*} data A serializable data. If data is not serializable, null is stored instead.
         * @param {(err:Error,dataID:string)=>void} callback Function to call after operation.
         * 
         ** `err` An error object if error occurs else null.
         ** `dataID` A unique string that can be used to access the written data for updates, retreival or deletion.
         */
        writeToDispersedStorage:function(db_name,tablename,id,storageColumn,data,callback){
            _wToDStorage(db_name,tablename,id,storageColumn,data,callback,this);
        },
        /**
         * Overwrites dispersed storage data.
         * @param {string} db_name 
         * @param {string} tablename 
         * @param {string} storageColumn 
         * @param {string} id 
         * @param {*} data 
         *  @param {string} dataID
         * @param {(err:Error,updated:boolean)=>void} callback
         */
        updateDispersedStorageData:function(db_name,tablename,id,storageColumn,dataID,data,callback){
            up_get_del_D_Data(db_name,tablename,id,storageColumn,data,dataID,"uD_Data",callback,this);
        },
        /**
         * Modifies dispersed storage data and updates (overwrites) with the modified data.
         * @param {string} db_name 
         * @param {string} tablename 
         * @param {string} storageColumn 
         * @param {string} id 
         * @param {string} dataID
         * @param {string|(data:*)=>*} onget This function is called with the data as argument. 
         * Modify data in this function. **It must return the final data to be written.**
         * @param {(err:Error,updated:boolean)=>void} callback
         */
         getAndUpdateDispersedStorageData:function(db_name,tablename,id,storageColumn,dataID,onget,callback){
            if(typeof (onget)!=="string"){
                if(typeof (onget)==="function"){
                    onget = onget.toString();
                }else{
                   callback({message:"Received wrong arguments",code:"W_ARGS"},NaN);
                   return;
                }
            }
            up_get_del_D_Data(db_name,tablename,id,storageColumn,onget,dataID,"guD_Data",callback,this);
        },
        /**
         * 
         * @param {string} db_name 
         * @param {string} tablename 
         * @param {string} storageColumn 
         * @param {string} id 
         *  @param {string} dataID
         * @param {(err:Error,deleted:boolean)=>void} callback
         */
        delDispersedStorageData:function(db_name,tablename,id,storageColumn,dataID,callback){
            up_get_del_D_Data(db_name,tablename,id,storageColumn,"",dataID,"dD_Data",callback,this);
        },
        /**
         * 
         * @param {string} db_name
         * @param {string} tablename
         * @param {string} storageColumn
         * @param {string} id
         * @param {string} dataID
         * @param {(err:Error,data:{data:*,id:string,$time:{created:{
         *  year:number,month:number,day:number,hour:number,minute:number,second:number,stamp:string
         * }}})=>void} callback
         * 
         * @param {string|(data:{data:*,id:string,$time:{created:{
         *  year:number,month:number,day:number,hour:number,minute:number,second:number,stamp:string
         * }}})=>void} returnFunction
         */
        getDispersedStorageData:function(db_name,tablename,id,storageColumn,dataID,callback,returnFunction){
            if(typeof (returnFunction)!=="string"){
                if(typeof (returnFunction)==="function"){
                    returnFunction = returnFunction.toString();
                }else{
                    returnFunction=1;
                   return;
                }
            }
            up_get_del_D_Data(db_name,tablename,id,storageColumn,"",dataID,"gD_Data",callback,this,false,returnFunction);
        },
        /**
         * Reconnect to NoscDB after connection is closed.
        */
        reconnect:emptyfunc,
        /**
         * 
         * @param {()=>void} cb A callback to execute when NoscDB disconnects.
         */
        onclose:function(cb){},
        /**
         * Perform some database tasks after some time on database server. The `setTimeout()` method is called on the 
         * server running NoscDB. Therefore, ending or closing your app's server does not stop the tasks from executing on timeout.
         * However, the tasks will not be executed if `stop_onconnection_closed` is true and your app's connection to NoscDB is closed or disconnected. 
         * 
         * One way this can be used is to shcedule NoscDB to perform tasks (update, get or delete rows) after some time without sending 
         * another request to the database.
         * @param {number} time_in_milliseconds
         * @param {boolean} stop_onconnection_closed If `true`, tasks are executed on timeout if and only if your app is not disconnected
         * from the database. 
         * 
         * If `false` or not defined, tasks are executed even if your app's server is down.
         * 
         * ---
         * **NOTE:** All methods called returns an object with an `id` property set to a unique string that can be used to 
         * clear the time-out scheduler before execution. Call `clearTimeout(id, callback)` to clear before scheduled time.
         * 
         */
        setTimeout: function(time_in_milliseconds,stop_onconnection_closed){
            return {
                createDatabase:this.createDatabase,
                createTable:this.createTable,
                createDispersedTable:this.createDispersedTable,
                createRow:this.createRow,
                createDispersedRow:this.createDispersedRow,
                updateRow:this.updateRow,
                updateDispersedRow:this.updateDispersedRow,
                delRow:this.delRow,
                delDispersedRow:this.delDispersedRow,
                delTable:this.delTable,
                delDispersedTable:this.delDispersedTable,
                getRow:this.getRow,
                getDispersedRow:this.getDispersedRow,
                rowExists:this.rowExists,
                dispersedRowExists:this.dispersedRowExists,
                getAllRows:this.getAllRows,
                getAllDispersedRows:this.getAllDispersedRows,
                readFromDispersedStorage:this.readFromDispersedStorage,
                writeToDispersedStorage:this.writeToDispersedStorage,
                updateDispersedStorageData:this.updateDispersedStorageData,
                delDispersedStorageData:this.delDispersedStorageData,
                getDispersedStorageData:this.getDispersedStorageData,
                getAndUpdateDispersedStorageData:this.getAndUpdateDispersedStorageData,
                getAndUpdateDispersedRow:this.getAndUpdateDispersedRow,
                getAndUpdateRow:this.getAndUpdateRow
            };
        },
        /**
         * Clears a timeout schedule if only it exists.
         * @param {string} id The id representing the time scheduler to clear.
         * @param {(err:Error,cleared:boolean)} callback  
         */
        clearTimeout:function(id,callback){
            ClearTimeout(id,callback,this);
        },
        isSafe:function(value){return true;}
    };
};
var db = getDatabaseObject();
db=null;
module.exports={
    /**
     * 
     * @param {net.TcpNetConnectOpts} options 
     * @param {(err:{code:string,path:string}|false,DBobject:db)=>void} callback 
     * @param {string} splitter 5 or more character sequence that is used to differentiate requests by NoscDB. Defaut is `%$n&%`.
     * 
     * Use this same splitter on NoscDB-server to prevent errors. All requests including this same character sequence will 
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
     */
    createConnection:function(options,callback,splitter){
        var dbo=getDatabaseObject(),
        t_out=dbo.setTimeout(),time=Symbol();
        t_out[time]=0;
        t_out.createDatabase=function(a,b){
            let idd=`${Math.random()}`;
            createDatabase(a,b,dbo,{ms:this[time],t_id:idd})
            return {id:idd};
        };
        t_out.createTable=function(o,callback){
            let idd=`${Math.random()}`;
            createTable(o.db_name,o.tablename,o.columns,callback,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.createDispersedTable=function(o,callback){
            let idd=`${Math.random()}`;
            createDTable(o.db_name,o.tablename,o.columns,o.storageColumns,callback,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.createRow=function(db_name,tablename,id,columnsObject,callback){
            let idd=`${Math.random()}`;
            createRow(db_name,tablename,id,columnsObject,callback,false,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.createDispersedRow=function(db_name,tablename,id,columnsObject,callback){
            let idd=`${Math.random()}`;
            createRow(db_name,tablename,id,columnsObject,callback,true,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.updateRow=function(db_name,tablename,id,columnsObject,callback){
            let idd=`${Math.random()}`;
            updateRow(db_name,tablename,id,columnsObject,callback,false,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.updateDispersedRow=function(db_name,tablename,id,columnsObject,callback){
            let idd=`${Math.random()}`;
            updateRow(db_name,tablename,id,columnsObject,callback,true,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.delRow=function(db_name,tablename,id,callback){
            let idd=`${Math.random()}`;
            delRow(db_name,tablename,id,callback,false,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.delDispersedRow=function(db_name,tablename,id,callback){
            let idd=`${Math.random()}`;
            delRow(db_name,tablename,id,callback,true,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.delTable=function(db_name,tablename,callback){
            let idd=`${Math.random()}`;
            delAllRows(db_name,tablename,callback,false,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.delDispersedTable=function(db_name,tablename,callback){
            let idd=`${Math.random()}`;
            delAllRows(db_name,tablename,callback,true,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.getRow=function(db_name,tablename,id,callback,returnFunction){
            let idd=`${Math.random()}`;
            if(typeof (returnFunction)!=="string"){
                if(typeof (returnFunction)==="function"){
                    returnFunction = returnFunction.toString();
                }else{
                    returnFunction=1
                }
            }
            getRow(db_name,tablename,id,callback,false,returnFunction,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.getDispersedRow=function(db_name,tablename,id,callback,returnFunction){
            let idd=`${Math.random()}`;
            if(typeof (returnFunction)!=="string"){
                if(typeof (returnFunction)==="function"){
                    returnFunction = returnFunction.toString();
                }else{
                    returnFunction=1
                }
            }
            getRow(db_name,tablename,id,callback,true,returnFunction,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.rowExists=function(db_name,tablename,id,callback){
            let idd=`${Math.random()}`;
            rowExists(db_name,tablename,id,callback,false,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.dispersedRowExists=function(db_name,tablename,id,callback){
            let idd=`${Math.random()}`;
            rowExists(db_name,tablename,id,callback,true,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.getAllRows=function(db_name,tablename){
            let idd=`${Math.random()}`;
            var r=dbo.getAllRows(db_name,tablename);
            r.ondata=function(callback){
                return r[sym](callback,{ms:t_out[time],t_id:idd});
            };
            r.id=idd;
            return r;
        };
        t_out.getAllDispersedRows=function(db_name,tablename){
            let idd=`${Math.random()}`;
            var r=dbo.getAllDispersedRows(db_name,tablename);
            r.ondata=function(callback){
                return r[sym](callback,{ms:t_out[time],t_id:idd});
            };
            r.id=idd;
            return r;
        };
        t_out.readFromDispersedStorage=function(db_name,tablename,id,sCol){
            let idd=`${Math.random()}`;
            var r=dbo.readFromDispersedStorage(db_name,tablename,id,sCol);
            r.ondata=function(cb){
                return r[sym](cb,{ms:t_out[time],t_id:idd});
            };
            r.id=idd;
            return r;
        };
        t_out.writeToDispersedStorage=function(db_name,tablename,id,storageColumn,data,callback){
            let idd=`${Math.random()}`;
            _wToDStorage(db_name,tablename,id,storageColumn,data,callback,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        }
        t_out.updateDispersedStorageData=function(db_name,tablename,id,storageColumn,dataID,data,callback){
            let idd=`${Math.random()}`;
            up_get_del_D_Data(db_name,tablename,id,storageColumn,data,dataID,"uD_Data",callback,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.delDispersedStorageData=function(db_name,tablename,id,storageColumn,dataID,callback){
            let idd=`${Math.random()}`;
            up_get_del_D_Data(db_name,tablename,id,storageColumn,"",dataID,"dD_Data",callback,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.getDispersedStorageData=function(db_name,tablename,id,storageColumn,dataID,callback,returnFunction){
            if(typeof (returnFunction)!=="string"){
                if(typeof (returnFunction)==="function"){
                    returnFunction = returnFunction.toString();
                }else{
                    returnFunction=1;
                   return;
                }
            }
            let idd=`${Math.random()}`;
            up_get_del_D_Data(db_name,tablename,id,storageColumn,"",dataID,"gD_Data",callback,dbo,{ms:this[time],t_id:idd},returnFunction);
            return {id:idd};
        };
        t_out.getAndUpdateDispersedStorageData=function(db_name,tablename,id,storageColumn,dataID,onget,callback){
            let idd=`${Math.random()}`;
            if(typeof (onget)!=="string"){
                if(typeof (onget)==="function"){
                    onget = onget.toString();
                }else{
                   callback({message:"Received wrong arguments",code:"W_ARGS"},NaN);
                   return;
                }
            }
            up_get_del_D_Data(db_name,tablename,id,storageColumn,onget,dataID,"guD_Data",callback,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.getAndUpdateRow=function(db_name,tablename,id,callback,onget){
            let idd=`${Math.random()}`;
            if(typeof (onget)!=="string"){
                if(typeof (onget)==="function"){
                    onget = onget.toString();
                }else{
                    callback({message:"Received wrong arguments",code:"W_ARGS"},NaN);
                    return;
                }
            }
            updateRow(db_name,tablename,id,onget,callback,4,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        t_out.getAndUpdateDispersedRow=function(db_name,tablename,id,callback,onget){
            let idd=`${Math.random()}`;
            if(typeof (onget)!=="string"){
                if(typeof (onget)==="function"){
                    onget = onget.toString();
                }else{
                    callback({message:"Received wrong arguments",code:"W_ARGS"},NaN);
                    return;
                }
            }
            updateRow(db_name,tablename,id,onget,callback,3,dbo,{ms:this[time],t_id:idd});
            return {id:idd};
        };
        dbo.setTimeout=function(t,s){
            t_out[time]=0;
            if(typeof (t)==="number"&&t>=0){
                t_out[time]={t:t,s:typeof (s)==="boolean"?s:0}
                return t_out;
            }
        };
        connect(options,callback,dbo,false,splitter);
    }
}
