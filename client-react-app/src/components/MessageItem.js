import { useState } from "react";

function MessageItem({ message, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.text);

  const handleUpdate = () => {
    onUpdate(message._id, text);
    setEditing(false);
  };

  return (
    <li>
      {editing ? (
        <>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleUpdate}>Save</button>
        </>
      ) : (
        <>
          {message.text}
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={() => onDelete(message._id)}>Delete</button>
        </>
      )}
    </li>
  );
}

export default MessageItem;