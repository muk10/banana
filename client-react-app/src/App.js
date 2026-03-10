import { useEffect, useState } from "react";
import {
  getMessages,
  createMessage,
  deleteMessage,
  updateMessage as updateMessageService,
} from "./services/messageService";

import MessageForm from "./components/MessageForm";
import MessageList from "./components/MessageList";

function App() {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const res = await getMessages();
    setMessages(res.data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const addMessage = async (text) => {
    await createMessage(text);
    fetchMessages();
  };

  const removeMessage = async (id) => {
    await deleteMessage(id);
    fetchMessages();
  };

  const updateMessage = async (id, text) => {
    await updateMessageService(id, text);
    fetchMessages();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Messages</h1>

      <MessageForm onAdd={addMessage} />

      <MessageList
        messages={messages}
        onDelete={removeMessage}
        onUpdate={updateMessage}
      />
    </div>
  );
}

export default App;