import { createContext, useState, useEffect ,useRef} from 'react';
import { API } from '@/services/service';
export  const UserConetxt = createContext(null)



const UserProvider = ({children}) => {
    const [user, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); 
    useEffect(()=>{
        API.get('/user/me')
        .then((response)=>{
            setUserData(response.data.data)
        })
        .catch((err)=>{
            console.log(err.message)
            setUserData(null)
        })
        .finally(()=>{
            setLoading(false)
        })
    },[])
  return (
    <UserConetxt.Provider value={{user,loading,setUserData}}>
        {children}
    </UserConetxt.Provider>
  )
}

export default UserProvider
