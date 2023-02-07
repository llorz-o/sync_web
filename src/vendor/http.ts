import Axios from "axios"
import {MODE} from "./constants";

export const axiosInstance = Axios.create({
    baseURL: import.meta.env.MODE === MODE.PROD ? 'https://infinityweb.info:3000' : 'http://127.0.0.1:3000'
})

