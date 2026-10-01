import axios from 'axios'

export const API =  axios.create({
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
    
    const {data} = await API.get("/code")
    console.log(data)
    return data.data
}

export const registerUser = async (data) => {
    try {
        const response = await API.post('/user/register', data)
        return response.data.success
    } catch (err) {
       
        throw new Error(err.response?.data?.message || "Something went wrong");
    }
}

export const verifyotp = async (email, OTP) => {
    try {
        
        const response = await API.post('/user/otp', { email, OTP })
        if (response.status === 200) {
            return true;
        }
        return false;
    } catch (err) {
        
        throw new Error(err.response?.data?.message || "Something went wrong");
    }
}

export const loginUser = async(info,setuserdata)=>{
    try{
       
        const {data} = await  API.post('/user/login',info)
        if(data.statsCode==200 || data.data.statsCode==200 || data.success){
            const {data} =   await API.get('/user/me')
            setuserdata(data.data)
            return true;
        
        }
        return false;

    
    }catch(err){
        throw new Error(err.response?.data?.message || "Something went wrong");
        
    }
    


}



