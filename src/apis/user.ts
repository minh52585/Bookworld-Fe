import axios from "axios";

const API_URL = "http://localhost:5004/api/users"; 

export const getUsers = async (page = 1, limit = 10) => {
  const res = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
  return res.data;
};