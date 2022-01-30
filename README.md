# noscdb
First hybrid nodejs database system built with real-time applications needs in mind.    

# About    
NoscDB was created by [Yamoah Bismark.](https://github.com/KBismark)    

NoscDB was created as a quick solution to save myself from learning MySQL when I needed to test a simple web app I created while learning web development with nodejs.    
Initially, NoscDB was created to store data in arrays until I decided to make it a project to work on. In the decision, I was to make the data stored in arrays persist even if my localhost server is stopped from execution. The core nodejs FS module was/is obviously the first and last option to me. Since then (February 2021), NoscDB has gone through several stages of writing and testing privately. So far, NoscDB has proved to be working as expected until you also try it and find a new bug to be fixed. 
# What is NoscDB?
NoscDB is the first ever hybrid database system created with pure javascript and runs in a nodejs environment. Its asynchronoucity and non-blocking nature adopted from nodejs allows for fast operations and high performance. It combines both relational and non-relational database practices. It adopts the idea of table-column-row relation from relational database systems and the form data is stored or accessed from non-relational database systems. These two types of database systems is combined by NoscDB to form an advanced key-value storage system, where table columns act as the keys and your data as the values in each row (document).
It brings the document way of storing data on board. Your data is stored as javascript objects or JSON (*but would be retreived in only JSON formats*) in files (document) classified as rows. Thus, each row in a NoscDB table is a separate entity (file or document) from other rows. NoscDB **does not** store files (image files, video files, etc). It only stores JSON serializabe objects.

Below is how data is stored in a NoscDB table.    

| Row/Columns | Default Column | Column 1 | Column 2 | Column 3 | Default Column |
|--:	|--:	|--:	|--:	|--:	|--:	|
|    | *$id* | *name* | *age* | *continent* | *$time* |
| **Row 1** | "1" | "John" | 28 | "Europe" | [object] |
| **Row 2** | "2" | "Nana" | 24 | "Africa" | [object] |

Each of the rows in the table above is a separate document stored in the table.

### Accessing data
Let's access the first row's data.

```js
Read: tablename/$id // Made by NoscDB internally

Data: // Returned by NoscDB
{
  "$id":"1", // First default column and its value
  "name":"John", // First column and its value
  "age":28, // Second column and its value
  "continent":"Europe", // Third column and its value
  "$time":{ // Last default column and its value
            "created":{
                        "year":value,
                        "month":value,
                        "day":value,
                        "hour":value,
                        "minute":value,
                        "second":value,
                        "stamp":value
                      },
            "updated":null // Data not modified or updated yet
          }
}

Use Data: Data[column-name]
console.log(Data.$id); // Logs $id column value of Data, "1"
console.log(Data.continent); // Logs the continent column value of Data, "Europe"

```
# Speed and Fastness
NoscDB runs or execute only in a nodejs environment. This means that NoscDB is an app that will run in your nodejs environment therefore, it inherits all the features of a normal nodejs app.   
# Asynchronoucity/Non-Blocking 
Your NoscDB database is guaranteed to run and perform all operations asynchronously.
NoscDB is non-blocking, which makes it even faster at handling your database requests.    
# How data is stored
NoscDB saves data in separate files for each row in a table. NoscDB does not store or keep all data in one master file or flat-file. Each data is a separate entity that is stored in a separate file with a pathname that corresponds or gives information about the database, table, or row it belongs to. This system of organizing your data allows for fast and quick way of upating, deleting or accessing data.
# FS Module  
NoscDB has an in-built fs-manager that changes the behaviour of the fs methods it uses to perform operations.
Thus, problems that usually occur when writing, reading, deleting, etc. of the same file at the same time is handled professionally by the fs-manager, which prevents such problems from occurring at all.
# NoscDB at its request peak 
Generally, more requests to access the same data (document/file) at the same time in a single threaded nodejs will generate errors because you are trying to access or open an already opened file to perform another operation on that same file at that same time (ASYNCHRONOUS MODE).   

However, this is when NoscDB is at its best. Among the many requsts to operate on the same data (file), only one operation is performed but all the requests (whether deleting, updating, reading, etc) are served correctly. NoscDB merges all those requests to become one, executes the merged request and send feedback to the various request handlers.  

Moreover, NoscDB has an option to choose the maximum separate files that should be opened simultaneously (in parrallel) to prevent possible EMFILE errors.   

Again, there is an option to make NoscDB use your preferred fs module replacement like fs-extra, graceful-fs, etc.

# No Waiting
This feature is best explained with an example. 

Let's assume you have 1000 rows in a table and you request to get the data for each. NoscDB will read the first row's data and send it back as response while other operations are still in process. It will then continue the same process until there's no more row left to read. This feature bahaves exactly as readable and writable streams in nodejs. NoscDB emits `data` events to handle each response's data.

# Flexibility
There's never been any database system that gives you more control over **everything** except NoscDB. NoscDB is very simple to understand and to modify the whole database system to meet your needs.

# Simple and easy to learn
The NoscDB project was started by a nodejs beginner so it's very beginner friendly to both nodejs developers and non-nodejs developers. It is also entirely written in javascript and runs in Javascript-Nodejs environment so even if you have less knowledge in nodejs, NoscDB will be so easy for you to learn.     
Again, it uses self-explained method names like `getRow`, `updateRow`, etc, which makes codes very easy to read and follow.

# Scale in any direction
NoscDB allows you to scale your database in all directions. NoscDB actually brings a bundle of an entire database management system to you to handle your data. 

- Create as many databases as you will need
- Create as many tables as you will require in each database you create 
- Create as many rows as you will need in each table you create 
- Store data as large as neccessary in any row you create

*The above features are limited to system limits*  

If you need more of the above features to handle your data, increase your NoscDB servers to as many as you will need and connect them all to your single application. It's so easy and simple. NoscDB has methods to help you with that.

- NoscDB can run in your application, that is, you don't need a separate server from your app to host NoscDB
- NoscDB can run on a separate server (NoscDB Server is a server that runs only NoscDB in order to get access to all resources to handle your data effectively and effeciently to ensure fast operations and high perfomance)
- A NoscDB server can serve several applications
- Your application can connect to several NoscDB servers   
- You can build a network of NoscDB servers to communicate to each other and even to communicate with several of your applications (*not just a single app*).
- and many more.

# Links
- [NoscDB Module](https://github.com/KBismark/noscdb/tree/fun/noscdb)
- [NoscDB-Client Module](https://github.com/KBismark/noscdb/tree/fun/client)
- [NoscDB-Server Module](https://github.com/KBismark/noscdb/tree/fun/server)


