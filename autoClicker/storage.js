const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// 获取存储文件路径
const getStoragePath = () => {
  return path.join(app.getPath('userData'), 'key_value_store.json');
};

// 初始化存储文件
const initializeStorage = () => {
  const storagePath = getStoragePath();
  if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, '{}', 'utf-8');
  }
};

// 保存键值对
const setKeyValue = (key, value) => {
  try {
    initializeStorage();
    const storagePath = getStoragePath();
    const currentData = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
    currentData[key] = value;
    fs.writeFileSync(storagePath, JSON.stringify(currentData, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('保存键值对失败:', error);
    return false;
  }
};

// 读取键值对
const getValueByKey = (key) => {
  try {
    initializeStorage();
    const storagePath = getStoragePath();
    const currentData = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
    return currentData[key] || null;
  } catch (error) {
    console.error('读取键值对失败:', error);
    return null;
  }
};

// 删除键值对
const deleteKey = (key) => {
  try {
    initializeStorage();
    const storagePath = getStoragePath();
    const currentData = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
    if (currentData.hasOwnProperty(key)) {
      delete currentData[key];
      fs.writeFileSync(storagePath, JSON.stringify(currentData, null, 2), 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除键值对失败:', error);
    return false;
  }
};

// 获取所有键值对
const getAllKeyValues = () => {
  try {
    initializeStorage();
    const storagePath = getStoragePath();
    return JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
  } catch (error) {
    console.error('获取所有键值对失败:', error);
    return {};
  }
};

module.exports = {
  setKeyValue,
  getValueByKey,
  deleteKey,
  getAllKeyValues
};