# XKDB
This library is for easy manipulation of indexed databases

## Lists and tables
Lists have their items automatically numbered while tables have their items with fixed names

### Checking for existence
```
boolean promise hasList(string listName)
boolean promise hasTable(string tableName)
```

### Creating
```
void addList(string listName)
void addTable(string tableName, string keyPath)
```

### Deleting
```
void deleteList(string listName)
void deleteTable(string tableName)
```

## Items
Items are recorded in the list/table

### Checking for existence
```
boolean promise hasItem(string tableName, string itemName)
```

### Creating
```
void addItem(string tableName, data itemValue)
```

### Updating
```
void putItem(string tableName, data itemValue)
```

### Geting
```
item promise getItem(string tableName, data itemName)
```

### Deleting
```
void deleteItem(string tableName, data itemName)
```

## Databases
Databases is what stores all the lists and tables, after a database is created/opened all tasks (like **addList** and **getItem** for example) are executed and after all tasks are completed a callback is sent to close the database.

### Checking for existence
```
boolean promise hasDB(string DBName)
```

### Opening
```
void openDB(string DBName, int version, function closeCallback)
```

### Closing
```
void closeDB(string DBName)
```

### Deleting
```
void deleteDB(string DBName)
```