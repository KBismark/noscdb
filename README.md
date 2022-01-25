# noscdb
A fast nodejs database built with real-time applications needs in mind.    

# About    
NoscDB was created by [Yamoah Bismark.](https:github.com/KBismark)    

NoscDB was created as a quick solution to save myself from learning MySQL when I needed to test a simple web app I created while learning web development with nodejs.    
Initially, NoscDB was created to store data in arrays until I decided to make it a project to work on. In the decision, I was to make the data stored in arrays persist even if my localhost server is stopped from execution. The core nodejs FS module was/is obviously the first and last option to me. Since then (February 2021), NoscDB has gone through several stages of writing and testing privately. So far, NoscDB has proved to be working as expected until you also try it and find a new bug to be fixed.   
# Speed and Fastness
NoscDB runs or execute only in a nodejs environment. This means that NoscDB is an app that will run in your nodejs environment therefore, inherits all the features of a normal nodejs app.   
# Asynchronoucity/Non-Blocking 
Your NoscDB database is guaranteed to run and perform all operations asynchronously.
NoscDB is non-blocking, which makes it even faster at handling your database requests.    
# How data is stored
NoscDB saves data in separate files for each data. NoscDB does not store or keep all data in one master file or flat-file. Each data is a separate entity that is stored in a separate file with a pathname that corresponds or gives information about the database, table, or row it belongs to. This system of organizing your data allows for fast and quick way of upating, deleting or accessing data 
# FS Module  
NoscDB has an in-built fs-manager that changes the behaviour of the fs methods it uses to perform operations.
Thus, problems that usually occur when writing, reading, deleting, etc. of the same file at the same time is handled professionally by the fs-manager, which prevents such problems from occurring at all.
# NoscDB at its request peak 
Generally, more requests to access the same data (file) at the same time in a single threaded nodejs is slow or generates errors because you are trying to access an already opened file to perform another operation on that same file at that same time (ASYNCHRONOUS MODE).   
However, this is when NoscDB is at its best. Among the many requsts to operate on the same data (file), only one operation is performed but all the requests (whether deleting, updating, reading, etc) are served correctly. NoscDB merges all those requests to become one, executes the merged request and send feedback to the various request handlers.  
Moreover, NoscDB has an option to choose the maximum separate files thst should be opened simultaneously (in parrallel) to prevent possible EMFILE errors.   
Again, there is an option to make NoscDB use your preferred fs module replacement.


