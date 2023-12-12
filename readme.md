# XKDB
This library is for easy manipulation of indexed databases

## Lists and tables
Lists have their items automatically numbered while tables have their items with fixed names

### Checking for existence
```javascript
boolean promise hasList(string listName)
boolean promise hasTable(string tableName)
```

### Creating
```javascript
void addList(string listName)
void addTable(string tableName, string keyPath)
```

### Deleting
```javascript
void deleteList(string listName)
void deleteTable(string tableName)
```

## Items
Items are recorded in the list/table

### Checking for existence
```javascript
boolean promise hasItem(string tableName, string itemName)
```

### Creating
```javascript
void addItem(string tableName, data itemValue)
```

### Updating
```javascript
void putItem(string tableName, data itemValue)
```

### Geting
```javascript
item promise getItem(string tableName, data itemName)
```

### Deleting
```javascript
void deleteItem(string tableName, data itemName)
```

## Databases
Databases is what stores all the lists and tables, after a database is created/opened all tasks (like **addList** and **getItem** for example) are executed and after all tasks are completed a callback is sent to close the database.

### Checking for existence
```javascript
boolean promise hasDB(string DBName)
```

### Executing
```javascript
promise executeDB(string DBName, int version)
```

### Deleting
```javascript
void deleteDB(string DBName)
```
