import MessageItem from "./MessageItem";

function MessageList({ messages, onDelete, onUpdate }) {
  return (
    <ul>
      {messages.map((msg) => (
        <MessageItem
          key={msg._id}
          message={msg}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}

export default MessageList;