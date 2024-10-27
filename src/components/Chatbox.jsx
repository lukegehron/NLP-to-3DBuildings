// // Chatbox.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useMutation, useStorage, useRoom } from "@liveblocks/react";
// import { LiveList } from "@liveblocks/client";
// import { buildingDataAtom } from "../utils/atom";

// const Chatbox = () => {
//   const [message, setMessage] = useState("");
//   const messagesEndRef = useRef(null);

//   // Access the room to perform storage updates
//   const room = useRoom();

//   // Access the messages array from Liveblocks storage
//   const messages = useStorage((root) => root.messages);

//   // Reference to keep track of the last processed message ID
//   const lastProcessedMessageIdRef = useRef(null);

//   // Mutation to initialize messages if it doesn't exist
//   const initMessages = useMutation(({ storage }) => {
//     if (!storage.get("messages")) {
//       storage.set("messages", new LiveList([]));
//     }
//   }, []);

//   // Mutation to add a new message to the messages LiveList
//   const sendMessage = useMutation(({ storage, self }, newMessage) => {
//     const messages = storage.get("messages");
//     if (messages) {
//       messages.push({
//         id: Date.now(),
//         author: self.presence.name || "Anonymous",
//         content: newMessage,
//       });
//     }
//   }, []);

//   const handleSend = () => {
//     if (message.trim() === "") return;

//     sendMessage(message);
//     setMessage("");
//   };

//   useEffect(() => {
//     if (messages === undefined) {
//       initMessages();
//     }
//   }, [messages, initMessages]);

//   // Scroll to the latest message when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Monitor messages for mentions of @NLPBuilding
//   useEffect(() => {
//     if (!Array.isArray(messages)) {
//       return;
//     }

//     // Find the index of the last processed message
//     const lastProcessedIndex = messages.findIndex(
//       (msg) => msg.id === lastProcessedMessageIdRef.current
//     );

//     // Get new messages since the last processed one
//     const newMessages = messages.slice(lastProcessedIndex + 1);

//     newMessages.forEach((msg) => {
//       if (msg.content.includes("@ai")) {
//         console.log("tagged");
//         console.log("buildingdata atom: ", buildingDataAtom);
//         console.log("message: ", msg.content); //buildingdataAtom
//         // Place any other actions you want to trigger here
//       }
//     });

//     // Update the last processed message ID
//     if (messages.length > 0) {
//       lastProcessedMessageIdRef.current = messages[messages.length - 1].id;
//     }
//   }, [messages]);

//   // If storage is not loaded yet, show a loading state
//   if (messages === null) {
//     return <div>Loading chat...</div>;
//   }

//   return (
//     <div style={styles.chatboxContainer}>
//       <div style={styles.messagesContainer}>
//         {messages ? (
//           messages.map((msg) => (
//             <div key={msg.id} style={styles.message}>
//               <strong>{msg.author}: </strong>
//               <span>{msg.content}</span>
//             </div>
//           ))
//         ) : (
//           // Optionally, display a placeholder when there are no messages
//           <div>No messages yet.</div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>
//       <div style={styles.inputContainer}>
//         <input
//           type="text"
//           style={styles.input}
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type your message..."
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               handleSend();
//             }
//           }}
//         />
//         <button style={styles.sendButton} onClick={handleSend}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   chatboxContainer: {
//     color: "#fefefe",
//     fontFamily: "ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace",
//     fontSize: "14px",
//     position: "absolute",
//     bottom: "10px",
//     right: "10px",
//     width: "280px",
//     maxHeight: "400px",
//     // backgroundColor: "rgba(255, 255, 255, 0.9)",
//     backgroundColor: "#181c20",
//     borderRadius: "8px",
//     boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
//     display: "flex",
//     flexDirection: "column",
//     overflow: "hidden",
//     zIndex: 10,
//   },
//   messagesContainer: {
//     flex: 1,
//     padding: "10px",
//     overflowY: "auto",
//   },
//   message: {
//     marginBottom: "5px",
//     wordWrap: "break-word",
//   },
//   inputContainer: {
//     display: "flex",
//     borderTop: "1px solid #ddd",
//   },
//   input: {
//     flex: 1,
//     padding: "10px",
//     border: "none",
//     outline: "none",
//     fontSize: "14px",
//     backgroundColor: "#535760",
//   },
//   sendButton: {
//     padding: "10px 15px",
//     backgroundColor: "#007bff",
//     color: "#fff",
//     border: "none",
//     cursor: "pointer",
//   },
// };

// export default Chatbox;

// Chatbox.jsx
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useStorage, useRoom } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";
import { buildingDataAtom } from "../utils/atom";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Access the room to perform storage updates
  const room = useRoom();

  // Access the messages array from Liveblocks storage
  const messages = useStorage((root) => root.messages);

  // Reference to keep track of the last processed message ID, initialized from localStorage
  const lastProcessedMessageIdRef = useRef(
    localStorage.getItem("lastProcessedMessageId")
  );

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
        id: Date.now().toString(), // Ensure ID is a string
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

  // Monitor messages for mentions of @ai
  useEffect(() => {
    if (!Array.isArray(messages)) {
      return;
    }

    let lastProcessedIndex;

    if (lastProcessedMessageIdRef.current) {
      // Compare IDs as strings
      lastProcessedIndex = messages.findIndex(
        (msg) => msg.id.toString() === lastProcessedMessageIdRef.current
      );
    } else {
      // No last processed message ID, set index to last message
      lastProcessedIndex = messages.length - 1;
      // Initialize lastProcessedMessageIdRef.current to the last message's ID
      if (messages.length > 0) {
        const lastMessageId = messages[messages.length - 1].id.toString();
        lastProcessedMessageIdRef.current = lastMessageId;
        localStorage.setItem("lastProcessedMessageId", lastMessageId);
      }
    }

    // Get new messages since the last processed one
    const newMessages = messages.slice(lastProcessedIndex + 1);

    newMessages.forEach((msg) => {
      if (msg.content.includes("@ai")) {
        console.log("tagged");
        console.log("buildingDataAtom: ", buildingDataAtom);
        console.log("message: ", msg.content);
        console.log("message ID: ", msg.id);
        // Place any other actions you want to trigger here
      }
    });

    // Update the last processed message ID
    if (messages.length > 0) {
      const newLastProcessedMessageId =
        messages[messages.length - 1].id.toString();
      lastProcessedMessageIdRef.current = newLastProcessedMessageId;
      localStorage.setItem("lastProcessedMessageId", newLastProcessedMessageId);
    }
  }, [messages]);

  // If storage is not loaded yet, show a loading state
  if (messages === null) {
    return <div>Loading chat...</div>;
  }

  return (
    <div style={styles.chatboxContainer}>
      <div style={styles.messagesContainer}>
        {messages ? (
          messages.map((msg) => (
            <div key={msg.id} style={styles.message}>
              <strong>{msg.author}: </strong>
              <span>{msg.content}</span>
            </div>
          ))
        ) : (
          // Optionally, display a placeholder when there are no messages
          <div>No messages yet.</div>
        )}
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
