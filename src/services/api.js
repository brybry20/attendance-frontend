// services/api.js
import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAllFiles = async () => {
  const response = await axios.get(`${API_URL}/files`);
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAttendanceByFile = async (fileName) => {
  const response = await axios.get(`${API_URL}/files/${encodeURIComponent(fileName)}`);
  return response.data;
};

export const deleteFile = async (fileName) => {
  const response = await axios.delete(`${API_URL}/files/${encodeURIComponent(fileName)}`);
  return response.data;
};

export const deleteAllFiles = async () => {
  const response = await axios.delete(`${API_URL}/files`);
  return response.data;
};

export const createRecord = async (fileName, data) => {
  const response = await axios.post(`${API_URL}/files/${encodeURIComponent(fileName)}/records`, data);
  return response.data;
};

export const updateRecord = async (fileName, recordId, data) => {
  const response = await axios.put(`${API_URL}/files/${encodeURIComponent(fileName)}/records/${recordId}`, data);
  return response.data;
};

export const deleteRecord = async (fileName, recordId) => {
  const response = await axios.delete(`${API_URL}/files/${encodeURIComponent(fileName)}/records/${recordId}`);
  return response.data;
};

export const testConnection = async () => {
  const response = await axios.get(`${API_URL}/test`);
  return response.data;
};