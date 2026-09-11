'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const api = Object.freeze({
  diagnostics: () => ipcRenderer.invoke('system:diagnostics'),
  listProfiles: () => ipcRenderer.invoke('aws:listProfiles'),
  profileRegion: (payload) => ipcRenderer.invoke('aws:profileRegion', payload),
  connectionInfo: (payload) => ipcRenderer.invoke('aws:connectionInfo', payload),
  identity: (payload) => ipcRenderer.invoke('aws:identity', payload),
  listResources: (payload) => ipcRenderer.invoke('aws:listResources', payload),
  inventory: (payload) => ipcRenderer.invoke('aws:inventory', payload),
  awsLogin: (payload) => ipcRenderer.invoke('aws:login', payload),
  ec2Action: (payload) => ipcRenderer.invoke('aws:ec2Action', payload),
  saveSsoProfile: (payload) => ipcRenderer.invoke('aws:saveSsoProfile', payload),
  saveAssumeRoleProfile: (payload) => ipcRenderer.invoke('aws:saveAssumeRoleProfile', payload),
  ssoLogin: (payload) => ipcRenderer.invoke('aws:ssoLogin', payload),
  openProfileTerminal: (payload) => ipcRenderer.invoke('aws:openProfileTerminal', payload),
  getTutorial: (payload) => ipcRenderer.invoke('tutorial:get', payload),
  getCatalog: () => ipcRenderer.invoke('catalog:get'),
  openExternal: (payload) => ipcRenderer.invoke('external:open', payload),
  confirm: (payload) => ipcRenderer.invoke('dialog:confirm', payload)
});

contextBridge.exposeInMainWorld('awsStudio', api);
