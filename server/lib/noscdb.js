const {server,clients,splitter} = require("./server.js");
const { setUpDatabases, setDB_Path, max_P_O_Files, override_fs } = require("./middleware.js");
var on = false;
/** */
module.exports = {
    /**
     * Starts the server. 
     * @param {(NoscDB_Server:server)=>void} callback Called after NoscDB is set up. 
     * It will be passed the created server instance. Use the server instance to tell 
     * the port to listen. 
     * 
     */
    run:function(callback){
        if(!on){
            on = true;
            setDB_Path(this.PATH);
            clients.clients = this.clients;
            splitter(this.splitter);
            max_P_O_Files(this.maxParallelOpenedFiles);
            setUpDatabases(function(){callback(server)});
        }
    },
    /** An existing directory where databases will reside. */
    PATH:"",
    /** A string array of IP addreses to allow access to server. */
    clients:[],
    /**
     * 
     * Set to 5 or more character sequence that will be used to differentiate requests. Defaut is `%$n&%`.
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
    splitter:'',
    override_fs:override_fs,
    /**
     * Set the maximum files that can be opened simultaneously for operations. 
     * This reduces the risk of encountering the fs `'EMFILE'` error. Thus, if the number of files 
     * opened reaches maximum, all other file openning operations are queued for some opened files to close.
     * Default is `1000`.
     */
    maxParallelOpenedFiles:1000
};
