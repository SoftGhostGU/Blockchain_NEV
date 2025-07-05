import Axios from './base';

export const getUser = async (id: string) => {
  try {
    const response = await Axios.get(`user/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}