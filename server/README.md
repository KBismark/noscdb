<h1 align="center">NOSCDB SERVER</h1>
<p align="center"><strong>NoscDB Server Module</strong></p>

## INSTALLING
```
    npm install noscdb-server
```

## USAGE
```js
    var ndbs = require("noscdb-server");
    // Set the path to store all databases you create
    ndbs.PATH = "DATABASE DIRECTORY PATH";

    // Allow access to NoscDB Server
    ndbs.clients = ["your-app-server1-address","your-app-server2-address","your-app-server3-address"];

    // Set to 5 or more character sequence that will be used to differentiate requests. Defaut is `%$n&%`
    ndbs.splitter = "%$n&%";

    // Run NoscDB Server
    const port = 8575;
    ndbs.run(function(server){
        server.listen(port,function(){
            console.log("NoscDB Server Running...");
        });
        // do more with server 

    });

```

### run 
This method starts the server. 

### PATH
An existing directory where databases will reside.

### clients
A string array of IP addreses to allow access to server.

### splitter
Set to 5 or more character sequence that will be used to differentiate requests. Defaut is `%$n&%`. Use this same splitter on NoscDB-client to prevent errors. All requests including this same character sequence will cause unexpected results and errors. Thus, it is safe to check your values for unsafe characters. This happens because, a lot of requests may be sent at the same time and NoscDB relies on the splitter to know each separate request.

It is ***`recommended`*** to include charaters that users of your application rarely use like those that are not easily accessible on keyboards.

```js
// When creating or updating rows or when writing to dispersed storage.
// Do something like this to check your argument values.
if(noscdb.isSafe(value)){
    // Go on 
}else{
    // Do something about the value 
}
     
```

### override_fs
Override the default `fs` module.

### maxParallelOpenedFiles
Set the maximum files that can be opened simultaneously for operations. This reduces the risk of encountering the fs `'EMFILE'` error. Thus, if the number of files opened reaches maximum, all other file openning operations are queued for some opened files to close. Default is `1000`.


