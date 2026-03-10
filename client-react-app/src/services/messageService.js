import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getMessages = () => {
  return axios.get(API_URL);
};

export const createMessage = (text) => {
  return axios.post(API_URL, { text });
};

export const deleteMessage = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export const updateMessage = (id, text) => {
  return axios.put(`${API_URL}/${id}`, { text });
};