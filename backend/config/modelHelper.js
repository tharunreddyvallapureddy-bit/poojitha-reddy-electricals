const { getIsConnected } = require('./db');
const { readData, writeData } = require('./fallbackDb');

const generateId = () => Math.random().toString(36).substring(2, 11);

const createModelProxy = (collectionName, MongoModel) => {
  const FallbackActions = {
    create: async (data) => {
      const db = readData();
      const newItem = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        ...data
      };
      db[collectionName].push(newItem);
      writeData(db);
      return newItem;
    },
    find: (query = {}) => {
      const getResults = () => {
        const db = readData();
        let results = db[collectionName] || [];
        results = results.filter(item => {
          for (let key in query) {
            if (query[key] !== undefined && item[key] !== query[key]) {
              return false;
            }
          }
          return true;
        });
        return results;
      };

      let p = Promise.resolve().then(() => getResults());
      p.sort = function(criteria) {
        p = p.then(items => {
          if (criteria && typeof criteria === 'object') {
            const key = Object.keys(criteria)[0];
            const order = criteria[key];
            return [...items].sort((a, b) => {
              if (a[key] < b[key]) return order === 1 ? -1 : 1;
              if (a[key] > b[key]) return order === 1 ? 1 : -1;
              return 0;
            });
          }
          return items;
        });
        p.sort = this.sort;
        p.limit = this.limit;
        return p;
      };
      p.limit = function(num) {
        p = p.then(items => items.slice(0, num));
        p.sort = this.sort;
        p.limit = this.limit;
        return p;
      };
      return p;
    },
    findOne: async (query = {}) => {
      const db = readData();
      const items = db[collectionName] || [];
      const found = items.find(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
      if (!found) return null;
      return {
        ...found,
        save: async function() {
          const d = readData();
          const idx = d[collectionName].findIndex(x => x._id === found._id);
          if (idx !== -1) {
            // merge changes
            d[collectionName][idx] = { ...d[collectionName][idx], ...this };
            delete d[collectionName][idx].save;
            writeData(d);
          }
          return d[collectionName][idx];
        }
      };
    },
    findById: (id) => {
      const getResult = () => {
        const db = readData();
        const items = db[collectionName] || [];
        const found = items.find(item => item._id === id);
        if (!found) return null;
        return {
          ...found,
          save: async function() {
            const d = readData();
            const idx = d[collectionName].findIndex(x => x._id === id);
            if (idx !== -1) {
              d[collectionName][idx] = { ...d[collectionName][idx], ...this };
              delete d[collectionName][idx].save;
              writeData(d);
            }
            return d[collectionName][idx];
          }
        };
      };

      const p = Promise.resolve().then(() => getResult());
      p.select = function() { return p; };
      return p;
    },
    findByIdAndUpdate: async (id, update) => {
      const db = readData();
      const items = db[collectionName] || [];
      const idx = items.findIndex(item => item._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...update };
      writeData(db);
      return items[idx];
    },
    updateMany: async (query, update) => {
      const db = readData();
      const items = db[collectionName] || [];
      let modifiedCount = 0;
      const updatedItems = items.map(item => {
        let match = true;
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            match = false;
            break;
          }
        }
        if (match) {
          modifiedCount++;
          return { ...item, ...update };
        }
        return item;
      });
      db[collectionName] = updatedItems;
      writeData(db);
      return { modifiedCount };
    },
    deleteOne: async (query = {}) => {
      const db = readData();
      const items = db[collectionName] || [];
      const initialLen = items.length;
      db[collectionName] = items.filter(item => {
        for (let key in query) {
          if (item[key] === query[key]) {
            return false;
          }
        }
        return true;
      });
      writeData(db);
      return { deletedCount: initialLen - db[collectionName].length };
    }
  };

  return {
    create: (data) => getIsConnected() ? MongoModel.create(data) : FallbackActions.create(data),
    find: (query) => getIsConnected() ? MongoModel.find(query).sort({ createdAt: -1 }) : FallbackActions.find(query),
    findOne: (query) => getIsConnected() ? MongoModel.findOne(query) : FallbackActions.findOne(query),
    findById: (id) => getIsConnected() ? MongoModel.findById(id) : FallbackActions.findById(id),
    findByIdAndUpdate: (id, update) => getIsConnected() ? MongoModel.findByIdAndUpdate(id, update, { new: true }) : FallbackActions.findByIdAndUpdate(id, update),
    updateMany: (query, update) => getIsConnected() ? MongoModel.updateMany(query, update) : FallbackActions.updateMany(query, update),
    deleteOne: (query) => getIsConnected() ? MongoModel.deleteOne(query) : FallbackActions.deleteOne(query),
    mongoModel: MongoModel
  };
};

module.exports = createModelProxy;
