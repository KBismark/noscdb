# noscdb
This is the core module of the NoscDB project. 

# Installing
Install this module only if you will be running NoscDB alongside your application on the same server.    

Install noscdb from the Node Package Manager.    
Using npm:    
`npm install noscdb`  

Using yarn:   
 `yarn add noscdb`

If NoscDB will be running on a separate server from your application, install the `noscdb-client` module and the `noscdb-server` module. See [NoscDB-Client](https://github.com/KBismark/noscdb/tree/fun/client) and [NoscDB-Server](https://github.com/KBismark/noscdb/tree/fun/server) for more on how to install and documentaion.

# USAGE 
NoscDB has some handful methods that would help you start using it to handle your data. More amazing features would be added as they become available.

## NoscDB setup methods and properties
- [override_fs](#override_fs)
- [maxParallelOpenedFiles](#maxparallelopenedfiles)
- [sync](#sync)
- [isServer](#isserver)
- [fs](#fs)
- [noscDate](#noscdate)
- [createDatabase](#createdatabase)
- [NOSCDB_ARRAYS](#noscdb_arrays)

## NoscDB object methods and properties
- [PATH](#path)
- [TABLES](#tables) 
- [DISPERSEDTABLES](#dispersedtables)
- [N_ofRows](#n_ofrows) 
- [N_ofDispersedRows](#n_ofdispersedrows)
- [updateRow](#updaterow) 
- [updateDispersedRow](#updatedispersedrow)
- [getRow](#getrow) 
- [getDispersedRow](#getdispersedrow)
- [createRow](#createrow) 
- [createDispersedRow](#createdispersedrow)
- [createTable](#createtable)
- [createDispersedTable](#createdispersedtable)
- [rowExists](#rowexists)
- [dispersedRowExists](#dispersedrowexists)
- [dispersedRowExists](#dispersedrowexists)
- [delRow](#delrow)
- [delDispersedRow](#deldispersedrow)
- [delDispersedStorageData](#deldispersedstoragedata)
- [getDispersedStorageData](#getdispersedstoragedata)
- [updateDispersedStorageData](#updatedispersedstoragedata)
- [getAllRows](#getallrows)
- [getAllDispersedRows](#getalldispersedrows)
- [delAllRows](#delallrows)
- [delAllDispersedRows](#delalldispersedrows)
- [writeToDispersedStorage](#writetodispersedstorage)
- [readFromDispersedStorage](#readfromdispersedstorage)

## Explanation to NoscDB setup methods and properties 

### override_fs 
Set this property to your fs replacement object to override the the default `fs` module used by noscDB. NoscDB 
has an internal fs-manager that handles the problem of facing `EMFILE` errors resulting from openning too many files when using the default `fs` module. However, you can still take advantage of this feature to use your preffered fs-like module. Your preffered fs-like module must have the properties or methods of the default `fs` module. 
```js
    var ndb = require('noscdb');
    var fake_fs = require('your-preffered-replacement');
    ndb.override_fs=fake_fs;

```

### maxParallelOpenedFiles 
Set the maximum files that can be opened simultaneously for operations.
This reduces the risk of encountering the fs `'EMFILE'` error. Thus, if 
the number of files opened reaches maximum, all other file openning operations are queued
for some opened files to close. Default is `1000`.

### isServer 
This value is automatically changed to true if NoscDB is required by `noscdb-server` module. 
Do not change this value manually. 

### fs 
Returns an object with NoscDB's internal fs-manager methods.

### noscDate 
NoscDB's internal date methods' object.

### NOSCDB_ARRAYS 
NoscDB string array selection methods' object. The methods of this object works only with string arrays.

### sync 
Set to a boolean value to indicate whether to set up database synchronously, `true` or asynchronously, `false`.
This does not affect the asynchronous nature of NoscDB. What it does affect is the `createDatabase` method.
 
 If set to false, `noscDB.createDatabase` returns `void`.

 If set to true, `noscDB.createDatabase` returns a `DB object`.

Default : `false`

### createDatabase 
This method requires two arguments. 
A path to a folder (directory) where data will be stored and a callback that is called after database is created.
Your callback is called with a **DB object** as argument.   
This method also returns the **DB object** if `sync` was set to true.   

*TIP: You can create several databases but each requires a unique directory path.*

Setting sync to true. Callback is optional when creating database.
```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    // The callback here is optional.
    var db_out = ndb.createDatabase(path,function(db){
        console.log("inside callback");
        console.log(db_out===db);
    });
    console.log("outside callback");

    // Result: 
    //      'inside callback'
    //       true
    //      'outside callback'

```

Setting sync to false. Callback is required when creating database.
```js
    var ndb = require('noscdb'); 
    ndb.sync = false; 
    const path = "A DIRECTORY PATH";

    // The callback here is required.
    ndb.createDatabase(path,function(db){
        console.log("inside callback");
    });
    console.log("outside callback");

    // Note how the result changes when sync is set to false
    // Result: 
    //      'outside callback'
    //      'inside callback'

```

## Explanation to NoscDB object (*DB object*) methods and properties 

There are two types of tables that can be created in any database that you create, a normal table and a dispersed table.
Due to system limits and performance issues that may arouse when you create many files (over million files) in one directory, NoscDB allows for creating tables dispersedly. A dispersed table allows you to create rows almost to no limit (over billion rows) by storing rows (documents) in several directories.    
Therefore, rows created in a normal table are stored in one directory whereas those created in a dispersed table are scatered accross different directories. On average, operations with a normal table is faster (insignificant though) than a dispersed table but a dispersed table comes with additonal features that allows easy storage of large quantity of data. For instance, a dispersed table has a well structured way of storing data flows like chat messages. 

### PATH 
This is a string value representing the path or the directory you specified when creating the database.

### TABLES
This object gives information about the tables you create in the database.

### DISPERSEDTABLES 
This object gives information about the dispersed tables you create in the database.

### N_ofRows 
This returns the number of rows created in a table.

### N_ofDispersedRows
This returns the number of rows created in a dispersed table.

### createRow

