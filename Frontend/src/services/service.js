import axios from 'axios'

const API =  axios.create({
    baseURL:"http://localhost:3000/api",
    withCredentials:true
})


export const messageRequest = async (userInput)=>{

    const {data} = await API.post('/code',{userInput ,threadId:"123456"})
    console.log(data)
}