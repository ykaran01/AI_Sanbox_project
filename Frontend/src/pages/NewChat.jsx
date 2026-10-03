import { Navigate } from "react-router-dom";
import { useContext } from "react"
import { UserConetxt } from "@/pages/UserProvider";
const NewChat = () => {
  const { user } = useContext(UserConetxt)
  if (!user) {
    return (
      <Navigate
        to={`/login`}
        replace
      />
    );
  }
  const threadId = crypto.randomUUID();

  return (
    <Navigate
      to={`/chat/${threadId}`}
      replace
    />
  );
};

export default NewChat;