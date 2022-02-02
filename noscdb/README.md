<h1 align="center">noscdb</h1>
<p align="center"> <strong > This is the core module of the NoscDB project. </strong> </p>

# Installing
Install this module only if you will be running NoscDB alongside your application on the same server.    

Install noscdb from the Node Package Manager.    
Using npm:    
```
npm install noscdb
```  

Using yarn:   
 ```
 yarn add noscdb
 ```

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
- [delRow](#delrow)
- [delDispersedRow](#deldispersedrow)
- [delDispersedStorageData](#deldispersedstoragedata)
- [getDispersedStorageData](#getdispersedstoragedata)
- [updateDispersedStorageData](#updatedispersedstoragedata)
- [getAllRows](#getallrows)
- [getAllDispersedRows](#getalldispersedrows)
- [delTable](#deltable)
- [delDispersedTable](#deldispersedtable)
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
Due to system limits and performance issues that may arise when you create many files (over million files) in one directory, NoscDB allows for creating tables dispersedly. A dispersed table allows you to create rows almost to no limit (over billion rows) by storing rows (documents) in several directories.    
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


### createTable 
This method creates a normal table. It takes two arguments:    
- **An object with noscDB table creation properties**:    
> #### Object Properties: 
>
> `tablename` The name of the table to be created. Must only include an underscore, lowercase-alphabets and numbers. Must begin with an alphabet. **Value Type: string**
>
> `columns` An array of column names. Must only include an underscore, lowercase-alphabets and numbers. Must begin with an alphabet. **Value Type: string[]**
>
> `created` A boolean value to indicate whether the table is already created `true` or not `false`. If sets to true, sets table object only. If sets to false or not defined, sets table object and create table path if not already existed.
>
- **callback**: Called after a successful table creation and receives a boolean value to check if table was created 
successfully or not.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.createTable({
        tablename: "your_table_name",
        columns: ["first_column_name","second_column_name","third_column_name"]
    },function(created){
        if(created){
            console.log("Table created successfully");
        }else{
            console.log("Sorry, this table exists");
        }
    });

```

### createDispersedTable 
This method creates a dispersed table. It takes two arguments:    
- **An object with noscDB dispersed table creation properties**:    
> #### Object Properties: 
>
> `tablename` The name of the table to be created. Must only include an underscore, lowercase-alphabets and numbers. Must begin with an alphabet. **Value Type: string**
>
> `columns` An array of column names. Must only include an underscore, lowercase-alphabets and numbers. Must begin with an alphabet. **Value Type: string[]**
>
> `storageColumns` An array of storage column names. This feature allows for the storage of frequent data flows like group chat messages. NoscDB has a well structured way of storing and retreiving such data in every dispersed row you create. Must only include an underscore, lowercase-alphabets and numbers. Must begin with an alphabet. **Value Type: string[]**
>
> `created` A boolean value to indicate whether the table is already created `true` or not `false`. If sets to true, sets table object only. If sets to false or not defined, sets table object and create table path if not already existed.
>
- **callback**: Called after a successful table creation and receives a boolean value to check if table was created 
successfully or not.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.createDispersedTable({
        tablename: "your_table_name",
        columns: ["first_column_name","second_column_name","third_column_name"],
        storageColumns: ["first_storagecolumn_name","second_storagecolumn_name"],
    },function(created){
        if(created){
            console.log("Table created successfully");
        }else{
            console.log("Sorry, this table exists");
        }
    });

```

### createRow 
This method creates a row in a normal table. It takes four arguments:    
- **tablename**: The name of the table for which a new row is to be created. **Value Type: string**
- **id**: An identifier for the row to be created. This value must be unique from all other row ids in the table. **Value Type: string**
- **columnsObject**: An object with the columns of the table as properties set to their corresponding values. If a column is not provided, `null` is used as its value. If value type is not accepted, `null` is used instead. **Tip:** *Use an empty object,* **{}** *to set all column values to null.* **Value Type: JSON serializable object**
- **callback**: A function that is called with a boolean value as argument. A `true` passed as argument to the callback indicates that a new row is succesfully created. A `false` passed as argument to the callback indicates that the identifier already exists and row creation was unsuccessful. 

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.createRow("table_name","unique_id",{
        first_column_name:value,
        second_column_name:value
    },function(created){
        if(created){
            console.log("Row created successfully");
        }else{
            console.log("Sorry, a row with this id exists in the table");
        }
    });

```

### createDispersedRow 
This method creates a row in a dispersed table. It takes four arguments:    
- **tablename**: The name of the table for which a new row is to be created. **Value Type: string**
- **id**: An identifier for the row to be created. This value must be unique from all other row ids in the table. **Value Type: string**
- **columnsObject**: An object with the columns of the table as properties set to their corresponding values. If a column is not provided, `null` is used as its value. If value type is not accepted, `null` is used instead. **Tip:** *Use an empty object,* **{}** *to set all column values to null.* **Value Type: JSON serializable object**
- **callback**: A function that is called with a boolean value as argument. A `true` passed as argument to the callback indicates that a new row is succesfully created. A `false` passed as argument to the callback indicates that the identifier already exists and row creation was unsuccessful. 

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.createDispersedRow("table_name","unique_id",{
        first_column_name:value,
        second_column_name:value
    },function(created){
        if(created){
            console.log("Row created successfully");
        }else{
            console.log("Sorry, a row with this id exists in the table");
        }
    });
    
```

### getRow
This method retreives a row's data from a table. It takes three arguments:
- **tablename**: The name of the table from which to retreive the row's data. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **callback**: A function that is called with the row's data as argument if exists, else null is passed as the argument.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.getRow("table_name","row_id",function(data){
        if(data){
            console.log(data);
            return;
        }
        console.log(data); // null
    });
```

### getDispersedRow
This method retreives a row's data from a dispersed table. It takes three arguments:
- **tablename**: The name of the table from which to retreive the row's data. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **callback**: A function that is called with the row's data as argument if exists, else null is passed as the argument.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.getDispersedRow("table_name","row_id",function(data){
        if(data){
            console.log(data);
            return;
        }
        console.log(data); // null
    });
```

### rowExists
This methods is used for checking if a row exists in a table. It takes three arguments:
- **tablename**: The name of the table from which to check the the existence of a row. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **callback**: A function that is called with a boolean value as argument. If the row does not exist in the table, `false` is passed as the argument.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.rowExists("table_name","row_id",function(exists){
        if(exists){
            console.log("Row exists in table");
            return;
        }else{
            console.log("Row does not exist in table");
        }
    });
```

### dispersedRowExists
This methods is used for checking if a row exists in a dispersed table. It takes three arguments:
- **tablename**: The name of the table from which to check the the existence of a row. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **callback**: A function that is called with a boolean value as argument. If the row does not exist in the table, `false` is passed as the argument.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.dispersedRowExists("table_name","row_id",function(exists){
        if(exists){
            console.log("Row exists in table");
            return;
        }else{
            console.log("Row does not exist in table");
        }
    });
```

### updateRow
This method updates a row's data in a table. It takes four arguments:
- **tablename**: The name of the table from which a row is to be updated. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **columnsObject**: An object with the column name(s) to update as properties set to their corresponding values. **Value Type: JSON serializable object**
- **callback**: A function that is called with a boolean value as argument. If the row does not exist in the table, `false` is passed as the argument.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.updateRow("table_name","row_id",{
        first_column_name_to_update:value,
        second_column_name_to_update:value
    },function(updated){
        if(updated){
            console.log("Row updated successfully");
        }else{
            console.log("Not updated");
        }
    });

```

### updateDispersedRow
This method updates a row's data in a dispersed table. It takes four arguments:
- **tablename**: The name of the table from which a row is to be updated. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **columnsObject**: An object with the column name(s) to update as properties set to their corresponding values. **Value Type: JSON serializable object**
- **callback**: A function that is called with a boolean value as argument. If the row does not exist in the table, `false` is passed as the argument.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.updateDispersedRow("table_name","row_id",{
        first_column_name_to_update:value,
        second_column_name_to_update:value
    },function(updated){
        if(updated){
            console.log("Row updated successfully");
        }else{
            console.log("Not updated");
        }
    });

```

### delRow
This method deletes a row from a table. It takes three arguments:
- **tablename**: The name of the table from which to delete row. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **callback**: A function that is called with a true value as argument always. If the row does not exist in the table, `true` is still passed as the argument. (*The result of deleting a row is same as not existing.*)

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.delRow("table_name","row_id",function(deleted){
        console.log("Row deleted successfully");
    });
```

### delDispersedRow
This method deletes a row from a dispersed table. It takes three arguments:
- **tablename**: The name of the table from which to delete row. **Value Type: string**
- **id**: The identifier to the row. **Value Type: string**
- **callback**: A function that is called with a true value as argument always. If the row does not exist in the table, `true` is still passed as the argument. (*The result of deleting a row is same as not existing.*)

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.delDispersedRow("table_name","row_id",function(deleted){
        console.log("Row deleted successfully");
    });
```

### delTable 
This method deletes a table with it rows from a database. It takes two arguments:
- **tablename** The name of the table to delete.
- **callback**: A function that is called with a true value as argument always. If the table does not exist in the database, `true` is still passed as the argument. (*The result of deleting a table is same as not existing.*)

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.delTable("table_name",function(deleted){
        console.log("Table deleted successfully");
    });
```

### delDispersedTable 
This method deletes a dispersed table with it rows from a database. It takes two arguments:
- **tablename** The name of the table to delete.
- **callback**: A function that is called with a true value as argument always. If the table does not exist in the database, `true` is still passed as the argument. (*The result of deleting a table is same as not existing.*)

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";

    var db = ndb.createDatabase(path);
    db.delDispersedTable("table_name",function(deleted){
        console.log("Table deleted successfully");
    });
```

### getAllRows 
This method gets all rows in a table. It takes only the table's name as argument and returns an object with methods to handle how data is retreived. 
> #### Returned object's methods
> This object's methods are chainable.    
> #### ondata
> Register listeners to be called when data is retreived. All listeners passed as argument to this method are executed anytime a row's data is retrieved. Until at least one listener is registered for this event, the `getAllRows` operation is not executed.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.ondata(function(data){
>       if(data){
>           // do something with data     
>       }
>   });
>   get.ondata(function(data){
>       if(data){
>           // do another thing with data     
>       }
>   });
> ```
>
> #### onend
> Register listeners to be called when data is retreived. All listeners passed as argument to this method are executed after data retreival. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.onend(function(){
>       // do something after data retreival
>   }).onend(function(){
>       // do another thing after data retreival
>   });
>
> ```
>
> #### limit
> Limit the number of rows to retreive by determining the start number and end number of rows to retreive. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.limit({
>       start: 4, // starts retreiving data from the 4th row in the selected rows 
>       end: 9 // ends retreiving data at the 9th row in the selected rows 
>   });
>
> ```
> #### end
> Ends data retreival manually.
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.ondata(function(data){
>       if(data){
>           if(data["some_column"]==="noscdb"){
>               get.end();
>           }
>       }
>   });
>
> ```
> #### sortById
> Sorts rows by their **id**s before retreiving data. It takes a boolean value as argument 
> to indicate whether to sort the selected rows in descending form. Descending: `true` and Ascending: `false`.    
> By default, rows would be retreived in order of time stored if `sortById()` or `sortByTime()` is not called. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   // Sorts by id but in descending order
>   db.getAllRows("table_name").sortById(true);
>
> ```
>
> #### sortByTime
> Sorts rows by their **time stored** before retreiving data. It takes a boolean value as argument 
> to indicate whether to sort the selected rows in descending form. Descending: `true` and Ascending: `false`.    
> By default, rows would be retreived in order of time stored if `sortByTime()` or `sortById()` is not called. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   // Sorts by time-stored but in descending order
>   db.getAllRows("table_name").sortByTime(true);
>
> ```
>
> #### selectIdStartingWith
> Select rows with id starting with `"some value"` before performing read operations. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.selectIdStartingWith("some value");
>
> ```
>
> #### selectIdEndingWith
> Select rows with id ending with `"some value"` before performing read operations. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.selectIdEndingWith("some value");
>
> ```
>
> #### selectIdIncluding
> Select rows that include `"some value"` in their Ids before performing read operations.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.selectIdIncluding("some value");
>
> ```
>

### getAllDispersedRows 
This method gets all rows in a dispersed table. It takes only the table's name as argument and returns an object with methods to handle how data is retreived. 
> #### Returned object's methods
> This object's methods are chainable.    
> #### ondata
> Register listeners to be called when data is retreived. All listeners passed as argument to this method are executed anytime a row's data is retrieved. Until at least one listener is registered for this event, the `getAllDispersedRows` operation is not executed.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllDispersedRows("table_name");
>   get.ondata(function(data){
>       if(data){
>           // do something with data     
>       }
>   });
>   get.ondata(function(data){
>       if(data){
>           // do another thing with data     
>       }
>   });
> ```
>
> #### onend
> Register listeners to be called when data is retreived. All listeners passed as argument to this method are executed after data retreival. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.onend(function(){
>       // do something after data retreival
>   }).onend(function(){
>       // do another thing after data retreival
>   });
>
> ```
>
> #### limit
> Limit the number of rows to retreive by determining the start number and end number of rows to retreive. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.limit({
>       start: 4, // starts retreiving data from the 4th row in the selected rows 
>       end: 9 // ends retreiving data at the 9th row in the selected rows 
>   });
>
> ```
> #### end
> Ends data retreival manually.
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.ondata(function(data){
>       if(data){
>           if(data["some_column"]==="noscdb"){
>               get.end();
>           }
>       }
>   });
>
> ```
> #### sortById
> Sorts rows by their **id**s before retreiving data. It takes a boolean value as argument 
> to indicate whether to sort the selected rows in descending form. Descending: `true` and Ascending: `false`.    
> By default, rows would be retreived in order of time stored if `sortById()` or `sortByTime()` is not called. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   // Sorts by id but in descending order
>   db.getAllRows("table_name").sortById(true);
>
> ```
>
> #### sortByTime
> Sorts rows by their **time stored** before retreiving data. It takes a boolean value as argument 
> to indicate whether to sort the selected rows in descending form. Descending: `true` and Ascending: `false`.    
> By default, rows would be retreived in order of time stored if `sortByTime()` or `sortById()` is not called. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   // Sorts by time-stored but in descending order
>   db.getAllRows("table_name").sortByTime(true);
>
> ```
>
> #### selectIdStartingWith
> Select rows with id starting with `"some value"` before performing read operations. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.selectIdStartingWith("some value");
>
> ```
>
> #### selectIdEndingWith
> Select rows with id ending with `"some value"` before performing read operations. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.selectIdEndingWith("some value");
>
> ```
>
> #### selectIdIncluding
> Select rows that include `"some value"` in their Ids before performing read operations.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var get = db.getAllRows("table_name");
>   get.selectIdIncluding("some value");
>
> ```
>

### readFromDispersedStorage
Reads data from a dispersed storage. A **dispersed storage** is a storage space that comes with every dispersed row that 
you create. These storage spaces are the **storageColumns** you provide when creating a dispersed table. They become the 
storage directory for frequent data flows like chat messages in every row that you create in that table. Such data are stored by NoscDB with respect to time and hence, would be retreived in that manner. When retreiving such data, you will have to specify the time and date range to read data from. Example, you may choose to read data from January to December in a particular year. 

This method takes two arguments: An accessing object and an error callback that is called only if an error occurs before 
data retreival. It also returns an object with methods and properties to handle how data is read from storage.     

- **Object methods and properties**:
    - **tablename**: The name of the table to access. **Value Type: string**
    - **id**: The identifier of the row to access. **Value Type: string**
    - **storageColumn**: The name of the storage column to read data from. **Value Type: string**    

- **errorCallback**: A function that is executed only if an error occurs before data retreival.    

> #### Returned object's methods
> This object's methods are chainable. 
> #### date
> This method **must** be called always. Tell the date to retreive data from. It takes three arguments:
>
> - **yr**: The `yr` must always be a `number` corresponding to the year from which to retreive data. `Required`
>   
> - **month**: The `month` is either a `number` corresponding to the month in which data is to be retreived or an `object` with two properties; `from`: the start month and `to`: the end month from which data is to be retreived **RANGE: `1-12`|`12-1` January to December or vice versa.** `Required`      
> The range `{from:1,to:12}` conforms to the `FIFO()` method and `{from:12,to:1}` conforms to the `LIFO()` method.   
>
> - **day**: The `day` is either a `number` corresponding to the day in which data is to be retreived or an `object` with two properties; `from`: the start day and `to`: the end day from which data is to be retreived. **RANGE: `1-31`|`31-1`** `Required`    
> The range `{from:1,to:31}` conforms to the `FIFO()` method and `{from:31,to:1}` conforms to the `LIFO()` method.   
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage({
>       tablename: "table_name",
>       id: "row_id",
>       storageColumn: "storage_column_name"
>   },function(err){
>       // do something if an error occurs   
>       console.log(err);   
>   });
>
>   // Read from the year 2021 - YEAR
>   // Read from February to January backwards - MONTH
>   // Read only the 8th day in these months - DAY
>   read.date(2021,{from:2,to:1},8);
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### time
> Tell the time to retreive data from. It takes three arguments:
>
> - **hour**: The `hour` must always be a `number` corresponding to the hour from which to retreive data. **RANGE: `0-23` [Uses the 24-Hour format]**
>  
> - **min**: The `min` is either a `number` corresponding to the minute in which data is to be retreived or an `object` with two properties; `from`: the start minute and `to`: the end minute from which data is to be retreived **RANGE: `0-59`**   
>
> - **sec**: The `sec` is either a `number` corresponding to the second in which data is to be retreived or an `object` with two properties; `from`: the start second and `to`: the end second from which data is to be retreived. **RANGE: `0-59`**     
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage({
>       tablename: "table_name",
>       id: "row_id",
>       storageColumn: "storage_column_name"
>   },function(err){
>       // do something if an error occurs   
>       console.log(err);   
>   });
>
>   // Read from the year 2021 - YEAR
>   // Read from February to January backwards - MONTH
>   // Read only the 8th day in these months - DAY
>   read.date(2021,{from:2,to:1},8);
>
>   // Read from the first 12 hours in each day - HOUR
>   // Read only the third minute in each hour - MINUTE
>   // Read from the 15th second to the 30th second - SECOND
>   read.time({from:0,to:11},3,{from:15,to:30}); // To read backwards, call the LIFO() method
>   
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### FIFO
> Data is retreived in ascending order with respect to the time stored in database. It uses a First-In-First-Out approach to retreive data. This is the default behaviour. The `FIFO()` and `LIFO()` are mutualy exclusive methods. The last method called is always chosen.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage({
>       tablename: "table_name",
>       id: "row_id",
>       storageColumn: "storage_column_name"
>   },function(err){
>       // do something if an error occurs   
>       console.log(err);   
>   });
>
>   // Read from the year 2021 - YEAR
>   // Read from February to January backwards - MONTH
>   // Read only the 8th day in these months - DAY
>   read.date(2021,{from:2,to:1},8);
>
>   // Read from the first 12 hours in each day - HOUR
>   // Read only the third minute in each hour - MINUTE
>   // Read from the 15th second to the 30th second - SECOND
>   read.time({from:0,to:11},3,{from:15,to:30}); // To read backwards, call the LIFO() method
>   
>   // Reading with the FIFO method
>   read.FIFO();
>   
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### LIFO
> Data is retreived in descending order with respect to the time stored in database. It uses a Last-In-First-Out approach to retreive data. The `LIFO()` and `FIFO()` are mutualy exclusive methods. The last method called is always chosen.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage({
>       tablename: "table_name",
>       id: "row_id",
>       storageColumn: "storage_column_name"
>   },function(err){
>       // do something if an error occurs   
>       console.log(err);   
>   });
>
>   // Read from the year 2021 - YEAR
>   // Read from February to January backwards - MONTH
>   // Read only the 8th day in these months - DAY
>   read.date(2021,{from:2,to:1},8);
>
>   // Read from the first 12 hours in each day - HOUR
>   // Read only the third minute in each hour - MINUTE
>   // Read from the 15th second to the 30th second - SECOND
>   read.time({from:0,to:11},3,{from:15,to:30}); // To read backwards, call the LIFO() method
>   
>   // Reading with the LIFO method
>   read.LIFO();
>   
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### ondata
> Register listeners to be called when data is retreived. All listeners passed as argument to this method are executed anytime data is retrieved. Until at least one listener is registered for this event, the `readFromDispersedStorage` operation is not executed. The data is retreived in **arrays**, which contains all the data that well stored in the storage space in the same second.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage({
>       tablename: "table_name",
>       id: "row_id",
>       storageColumn: "storage_column_name"
>   },function(err){
>       // do something if an error occurs   
>       console.log(err);   
>   });
>
>   // Read from the year 2021 - YEAR
>   // Read from February to January backwards - MONTH
>   // Read only the 8th day in these months - DAY
>   read.date(2021,{from:2,to:1},8);
>
>   // Read from the first 12 hours in each day - HOUR
>   // Read only the third minute in each hour - MINUTE
>   // Read from the 15th second to the 30th second - SECOND
>   read.time({from:0,to:11},3,{from:15,to:30}); // To read backwards, call the LIFO() method
>   
>   // Reading with the LIFO method
>   read.LIFO();
>
>   // Handle data events
>   // Data here is an array of all data stored in the same second. 
>   read.ondata(function(data){
>       if(data){
>           // do something with data     
>       }
>   });
>   read.ondata(function(data){
>       if(data){
>           // do another thing with data     
>       }
>   });
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### onend
> Register listeners to be called when data is retreived. All listeners passed as argument to this method are executed after data retreival. 
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage("table_name");
>
>   // Read from the year 2021 - YEAR
>   // Read from February to January backwards - MONTH
>   // Read only the 8th day in these months - DAY
>   read.date(2021,{from:2,to:1},8);
>
>   // Read from the first 12 hours in each day - HOUR
>   // Read only the third minute in each hour - MINUTE
>   // Read from the 15th second to the 30th second - SECOND
>   read.time({from:0,to:11},3,{from:15,to:30}); // To read backwards, call the LIFO() method
>   
>   // Reading with the LIFO method
>   read.LIFO();
>
>   // Handle data events
>   // Data here is an array of all data stored in the same second. 
>   read.ondata(function(data){
>       if(data){
>           // do something with data     
>       }
>   });
>   read.ondata(function(data){
>       if(data){
>           // do another thing with data     
>       }
>   });
>
>   // Handle end event
>   read.onend(function(){
>       // do something after data retreival
>   }).onend(function(){
>       // do another thing after data retreival
>   });
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### limit
> Determine the `number of seconds` to retreive written data from the `date()` and `time()` specified. It takes only 
one argument: A limitting object.
> - **limObject.start**: Number or Undefined. `Default` is 1, which is the first second data was written within the time range specified.
> - **limObject.end**: Number or Undefined. `Default` is the number of times (seconds) data was written in the `date()` and `time()` specified, which is the last second data was written within the time range specified. 
>
> **TIP**: `'number of seconds'` is not equal to `'number of data read'`
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage("table_name");
>   read.limit({
>       start: 4, // starts retreiving data from the 4th second in the selected data to read 
>       end: 9 // ends retreiving data at the 9th second in the selected data to read 
>   });
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### end
> Ends data retreival manually.
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage("table_name");
>   // Data here is an array of all data stored in the same second. 
>   read.ondata(function(data){
>       if(data){
>           for(var i=0;i<data.length;i++){
>               if(i>=5){
>                   read.end();
>               }
>               // do something with data[i]
>           }
>       }
>   });
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### withTime
> Adds the `$time` property to each data in the data array. The `$time` property is an object with the time data was created info. The `withTime()` and `withTimeStamp()` are mutualy exclusive methods. The last method called is always chosen.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   db.readFromDispersedStorage("table_name").withTime();
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### withTimeStamp
> Adds the `$timestamp` property to each data in the data array. The `$timestamp` property is a string with the time data was created info. The `withTimeStamp()` and `withTime()` are mutualy exclusive methods. The last method called is always chosen.
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   db.readFromDispersedStorage("table_name").withTimeStamp();
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>
> #### startFrom
> Set the date and time from which to start reading data. The data is read from the date object (inclusive) passed as argument. **TIP:** *Pass the* `last_data_read_date` *object to this method to continue reading data from where you previously left.*
>
> ```js
>   var ndb = require('noscdb'); 
>   ndb.sync = true; 
>   const path = "A DIRECTORY PATH";
>
>   var db = ndb.createDatabase(path);
>   var read = db.readFromDispersedStorage("table_name");
>   // Continue readind data from this date in the date and time you specified.
>   read.startFrom({month:5,day:18,hour:7,minute:32,second:3});
>
> ```
>   **How you read your data from a dispersed storage is very flexible. Read however you want your data.**
>

### writeToDispersedStorage
This method writes data to a dispersed storage column. All data to be written at a specific time (second) is merged and stored in the same file. Data is stored with respect to the time (second) `writeToDispersedstorage()` is called and would also be retreived in the same manner if `readFromDispersedStorage()` is called. It takes two arguments: An object with the data to write and the table name, id and the storage column to write to and a callback.   
- **object**:
    -  **tablename**: The name of the table to access **Value Type: string**
    - **id**: The identifier to row to access. **Value Type: string**
    - **storageColumn**: The storage column to access. **Value Type: string**
    - **data**: This is your data to store. **Value Type: JSON serializable**

- **callback**: This is a function that executes after writing to dispersed storage. This callback will be passed a unique string (dataId) to your data in the storage. This **dataId** is required if you want to access this data directly for updates, retreival and deletion. 

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";
    var db = ndb.createDatabase(path);

    db.writeToDispersedStorage({
        tablename: "table_name",
        id: "row_id",
        storageColumn: "storage_column_name",
        data: "your-data" // Must be JSON serializable
    },function(dataId){
        // If no error occurs, key is a string else null
        if(typeof(dataId)==="string"){
            // Data is stored successfully

        }
    });

```

### delDispersedStorageData
Deletes data stored in a dispersed storage.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";
    var db = ndb.createDatabase(path);

    db.delDispersedStorageData({
        tablename: "table_name",
        id: "row_id",
        storageColumn: "storage_column_name",
        dataId: "the data_id to your data" 
    },function(deleted){
        if(deleted){
            console.log("Your data is succesfully deleted from storage");
        }
    });

```

### getDispersedStorageData
Retreives data stored in a dispersed storage.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";
    var db = ndb.createDatabase(path);

    db.getDispersedStorageData({
        tablename: "table_name",
        id: "row_id",
        storageColumn: "storage_column_name",
        dataId: "the data_id to your data" 
    },function(data){
        if(data){
            // Do something with data
            console.log(data);
        }
    });

```

### updateDispersedStorageData
Updates (overwrites) existing data in a dispersed storage.

```js
    var ndb = require('noscdb'); 
    ndb.sync = true; 
    const path = "A DIRECTORY PATH";
    var db = ndb.createDatabase(path);

    db.updateDispersedStorageData({
        tablename: "table_name",
        id: "row_id",
        storageColumn: "storage_column_name",
        dataId: "the data_id to your data",
        data: "your-data" // Must be JSON serializable
    },function(updated){
        if(updated){
            console.log("Your data is succesfully updated");
        }
    });

```

