var xkdb = function(){
    var self = this;

    self.tables = [];

    self.mainStack = [];
    self.stack = [];
    self.pendingTasks = 0;

    self.databases = [];

    self.hasTable = function(name){
        return new Promise(function(resolve,reject){
            self.mainStack.push({type:"has",itemType:"table",name:name,resolve:resolve});
        })
    }
    self.addTable = function(name,id){
        self.tables.push({type:"add",itemType:"table",name:name,id:id});
    }
    self.deleteTable = function(name){
        self.tables.push({type:"delete",name:name});
    }
    self.hasList = function(name){
        return new Promise(function(resolve,reject){
            self.mainStack.push({type:"has",name:name,resolve:resolve});
        })
    }
    self.addList = function(name){
        self.tables.push({type:"add",itemType:"list",name:name,id:"id"});
    }
    self.deleteList = function(name){
        self.tables.push({type:"delete",name:name});
    }

    self.hasItem = function(table,name){
        return new Promise(function(resolve,reject){
            self.stack.push({type:"has",table:table,name:name,resolve:resolve});
        })
    }
    self.addItem = function(table,value){
        self.stack.push({type:"add",table:table,value:value})
    }
    self.putItem = function(table,value){
        self.stack.push({type:"put",table:table,value:value})
    }
    self.getItem = function(table,name){
        return new Promise(function(resolve,reject){
            self.stack.push({type:"get",table:table,name:name,resolve:resolve});
        })
    }
    self.deleteItem = function(table,name){
        self.stack.push({type:"delete",table:table,name:name})
    }

    self.hasDB = function(name){
        return new Promise(function(resolve,reject){
            indexedDB.databases().then(function(databases){
                var hasDatabase = databases.some(function(databaseInfo){
                    resolve(databaseInfo.name === name);
                })
            })
        })
    }
    self.openDB = function(name,version,closeCallback){
        self.pendingTasks = self.stack.length;

        return new Promise(function(resolve,reject){
            var request = indexedDB.open(name,version);

            request.onerror = function(event){
                console.error(event.target.error);
            }

            request.onupgradeneeded = function(event){
                var database = event.target.result;

                for(var table of self.tables){
                    if(table.type === "add"){
                        if(table.itemType === "table"){
                            database.createObjectStore(table.name,{keyPath:table.id});
                        }else if(table.itemType === "list"){
                            database.createObjectStore(table.name,{autoIncrement:true});
                        }
                    }else if(table.type === "delete"){
                        database.deleteObjectStore(table.name);
                    }else if(table.type === "has"){
                        table.resolve(database.objectStoreNames.contains(table.name));
                    }
                }
            }

            request.onsuccess = async function(event){
                var database = event.target.result;

                self.databases.push({
                    name:name,
                    handle:database
                })

                for(var task of self.stack){
                    var transaction = database.transaction(task.table,task.type === "get" ? "readonly" : "readwrite");
                    var objectStore = transaction.objectStore(task.table);

                    if(task.type === "has"){
                        var taskRequest = objectStore.get(task.name);

                        taskRequest.onsuccess = function(event){
                            var value = event.target.result;
                            task.resolve(!(value === undefined));

                            self.pendingTasks--;
                            if(self.pendingTasks === 0 && closeCallback !== undefined){
                                closeCallback();
                            }
                        }
                    }else if(task.type === "add"){
                        var taskRequest = objectStore.add(task.value);

                        taskRequest.onsuccess = function(){
                            self.pendingTasks--;
                            if(self.pendingTasks === 0 && closeCallback !== undefined){
                                closeCallback();
                            }
                        }
                    }else if(task.type === "put"){
                        var taskRequest = objectStore.put(task.value);

                        taskRequest.onsuccess = function(){
                            self.pendingTasks--;
                            if(self.pendingTasks === 0 && closeCallback !== undefined){
                                closeCallback();
                            }
                        }
                    }else if(task.type === "get"){
                        var taskRequest = objectStore.get(task.name);

                        taskRequest.onsuccess = function(event){
                            var value = event.target.result;
                            task.resolve(value);

                            self.pendingTasks--;
                            if(self.pendingTasks === 0 && closeCallback !== undefined){
                                closeCallback();
                            }
                        }
                    }else if(task.type === "delete"){
                        var taskRequest = objectStore.delete(task.name);

                        taskRequest.onsuccess = function(event){
                            self.pendingTasks--;
                            if(self.pendingTasks === 0 && closeCallback !== undefined){
                                closeCallback();
                            }
                        }
                    }
                }

                self.stack = [];
                resolve();
            }
        })
    }
    self.closeDB = function(name){
        for(var index in self.databases){
            var database = self.databases[index];

            if(database.name === name){
                database.handle.close();

                self.databases.splice(index,1);
                return;
            }
        }
    }
    self.deleteDB = function(name){
        indexedDB.deleteDatabase(name);

        for(var index in self.databases){
            var database = self.databases[index];

            if(database.name === name){
                database.handle.close();

                self.databases.splice(index,1);
                return;
            }
        }
    }
}