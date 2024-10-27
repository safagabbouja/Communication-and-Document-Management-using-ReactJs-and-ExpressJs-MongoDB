
import axios from "axios";

const REST_API_BASE_URL = 'http://localhost:5000/api/chat';

export const listdata = () => axios.get(REST_API_BASE_URL);
