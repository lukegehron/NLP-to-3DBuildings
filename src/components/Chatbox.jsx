// Chatbox.jsx
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useStorage, useRoom } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Access the room to perform storage updates
  const room = useRoom();

  // Access the messages array from Liveblocks storage
  const messages = useStorage((root) => root.messages);

  // Mutation to initialize messages if it doesn't exist
  const initMessages = useMutation(({ storage }) => {
    if (!storage.get("messages")) {
      storage.set("messages", new LiveList([]));
    }
  }, []);

  // Mutation to add a new message to the messages LiveList
  const sendMessage = useMutation(({ storage, self }, newMessage) => {
    const messages = storage.get("messages");
    if (messages) {
      messages.push({
        id: Date.now(),
        author: self.presence.name || "Anonymous",
        content: newMessage,
      });
    }
  }, []);

  const handleSend = () => {
    if (message.trim() === "") return;

    sendMessage(message);
    setMessage("");
  };

  useEffect(() => {
    if (messages === undefined) {
      initMessages();
    }
  }, [messages, initMessages]);

  // Scroll to the latest message when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If storage is not loaded yet, show a loading state
  if (messages === null) {
    return <div>Loading chat...</div>;
  }

  return (
    <div style={styles.chatboxContainer}>
      <div style={styles.messagesContainer}>
        {messages.map((msg) => (
          <div key={msg.id} style={styles.message}>
            <strong>{msg.author}: </strong>
            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          style={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />
        <button style={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  chatboxContainer: {
    color: "#fefefe",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace",
    fontSize: "14px",
    position: "absolute",
    bottom: "10px",
    right: "10px",
    width: "280px",
    maxHeight: "400px",
    // backgroundColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "#181c20",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 10,
  },
  messagesContainer: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
  },
  message: {
    marginBottom: "5px",
    wordWrap: "break-word",
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#535760",
  },
  sendButton: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Chatbox;
