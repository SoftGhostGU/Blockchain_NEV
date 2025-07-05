import axios from 'axios';

const url = "/"

let Axios = axios.create({
  baseURL: url
});

export default Axios;