import Axios from "axios"
console.log(import.meta.env)
export const axiosInstance = Axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:3001' : './api'
})
