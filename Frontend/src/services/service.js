import axios from 'axios'

export const API =  axios.create({
    baseURL:"http://localhost:3000/api",
    withCredentials:true
})


export const messageRequest = async (userInput,threadId)=>{
    try{
         const {data} = await API.post('/code',{userInput ,threadId})
    }catch(err){
           console.log(err.response?.data?.message)
        throw new Error(err.response?.data?.message || "Something Went weong")
     
    }
   
    
}


export const getHistory =  async(threadId)=>{
    try{
        const {data} =  await API.get(`/code/${threadId}`)
    return data.data
    }
    catch(err){
        console.log(err.response?.data?.message)
    }
}

export const getUserchatHistory = async()=>{
    try{
         const {data} = await API.get("/code")
    
    return data.data
    }catch(err){
        console.log(err.response?.data?.message)
    }
   
}

export const registerUser = async (data) => {
    try {
        const response = await API.post('/user/register', data)
        console.log(response.data)
        return response.data.status===200
    } catch (err) {
       console.log(err.response?.data?.message)
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
        console.log(err.response?.data?.message)
        throw new Error(err.response?.data?.message || "Something went wrong");
    }
}

export const loginUser = async(info,setuserdata)=>{
    try{
       
        const {data} = await  API.post('/user/login',info)
        if(data.statsCode==200 || data.data.status==200 || data.success){
            const {data} =   await API.get('/user/me')
            setuserdata(data)
            return true;
        
        }
        return false;

    
    }catch(err){
        console.log(err.response?.data?.message)
        throw new Error(err.response?.data?.message || "Something went wrong");
        
    }
    


}

export const sendEmail = async(email)=>{
    try{
        const {data} = await API.post('/user/send',{email}) 
        return data.data.status===200
    }
    catch(err){
        console.log(err.response?.data?.message)
        throw new Error(err.response?.data?.message || "Something Went Wrong")
    }
}

export const verifyOtp = async(otp,email)=>{
    try{
        const {data} = await API.post('/user/verify',{otp,email}) 
        return data.data.status===200
    }
    catch(err){
        console.log(err.response?.data?.message)
        throw new Error(err.response?.data?.message || "Something Went Wrong")
    }
}

export const change = async(newpassword)=>{
    try{
        const {data} = await API.post('/user/change',{newpassword}) 
        return data.data.status===200
    }
    catch(err){
        console.log(err.response?.data?.message)
        throw new Error(err.response?.data?.message || "Something Went Wrong")
    }
}



