import axios from 'axios'

const API =  axios.create({
    baseURL:"http://localhost:3000/api",
    withCredentials:true
})


export const messageRequest = async (userInput)=>{

    const {data} = await API.post('/code',{userInput ,threadId:"123456"})
    
}

export const getHistory =  async(threadId)=>{
    const {data} =  await API.get(`/code/${threadId}`)
    return data.data
}

export const getUserchatHistory = async()=>{
    console.log("hii")
    const {data} = await API.get("/code")
    console.log(data)
    return data.data
}

