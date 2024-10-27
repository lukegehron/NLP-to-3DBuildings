// Chatbox.jsx
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useStorage, useRoom } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";
import { useAtom } from "jotai";
import {
  aiPromptAtom,
  buildingPromptAtom,
  buildingDataAtom,
} from "../utils/atom";
import OpenAI from "openai";
const Chatbox = () => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [aiPrompt, setAiPrompt] = useAtom(aiPromptAtom);
  const [buildingPrompt, setBuildingPrompt] = useAtom(buildingPromptAtom);
  const [buildingData, setBuildingData] = useAtom(buildingDataAtom);
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
        id: Date.now().toString(), // Ensure ID is a string
        author: self.presence.name || "Anonymous",
        content: newMessage,
      });
    }
  }, []);
  let client;

  if (import.meta.env.VITE_OPENAI_API_KEY) {
    client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  function wrapKeysInQuotes(obj) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(wrapKeysInQuotes);
    }

    return Object.keys(obj).reduce((acc, key) => {
      acc[`"${key}"`] = wrapKeysInQuotes(obj[key]);
      return acc;
    }, {});
  }

  async function main(aiPrompt, buildingPrompt) {
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: aiPrompt + " " + buildingPrompt,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const responseContent = chatCompletion.choices[0].message.content;
    console.log("Raw response:", responseContent);

    try {
      // Parse the response as an object
      const parsedObj = JSON.parse(responseContent);
      console.log("Parsed object:", parsedObj);

      // Center and scale the building based on its GeoJSON coordinates
      if (
        parsedObj.building &&
        parsedObj.building.geoJSON &&
        parsedObj.building.geoJSON[0]
      ) {
        const coordinates =
          parsedObj.building.geoJSON[0].geometry.coordinates[0];

        // Calculate the bounding box
        const bbox = coordinates.reduce(
          (acc, coord) => {
            return {
              minX: Math.min(acc.minX, coord[0]),
              minY: Math.min(acc.minY, coord[1]),
              maxX: Math.max(acc.maxX, coord[0]),
              maxY: Math.max(acc.maxY, coord[1]),
            };
          },
          { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
        );

        // Calculate the center
        const centerX = (bbox.minX + bbox.maxX) / 2;
        const centerY = (bbox.minY + bbox.maxY) / 2;

        // Calculate the scale factor
        const width = bbox.maxX - bbox.minX;
        const height = bbox.maxY - bbox.minY;
        const scaleFactor = 20 / Math.max(width, height);

        // Adjust coordinates to center and scale the building
        const centeredAndScaledCoordinates = coordinates.map((coord) => [
          (coord[0] - centerX) * scaleFactor,
          (coord[1] - centerY) * scaleFactor,
        ]);

        // Update the GeoJSON with centered and scaled coordinates
        parsedObj.building.geoJSON[0].geometry.coordinates[0] =
          centeredAndScaledCoordinates;

        // Also center and scale the floors if they exist
        if (parsedObj.building.floors) {
          parsedObj.building.floors.forEach((floor) => {
            if (floor.geoJSON && floor.geoJSON[0]) {
              floor.geoJSON[0].geometry.coordinates[0] =
                floor.geoJSON[0].geometry.coordinates[0].map((coord) => [
                  (coord[0] - centerX) * scaleFactor,
                  (coord[1] - centerY) * scaleFactor,
                ]);
            }
          });
        }

        // Update other relevant properties
        if (parsedObj.building.baseDimensions) {
          parsedObj.building.baseDimensions.length *= scaleFactor;
          parsedObj.building.baseDimensions.width *= scaleFactor;
        }
        if (parsedObj.building.coreDimensions) {
          parsedObj.building.coreDimensions.length *= scaleFactor;
          parsedObj.building.coreDimensions.width *= scaleFactor;
        }
      }

      console.log("Centered and scaled object:", parsedObj);

      // Update the building data state
      setBuildingData(parsedObj);
    } catch (error) {
      console.error("Failed to parse or process response:", error);
      // Handle the error, maybe set an error state or use the raw string
    }
  }

  const handleSend = () => {
    if (message.trim() === "") return;

    if (message.startsWith("@ai")) {
      let myMessage = message.slice(4);
      console.log(message.slice(4));
      // console.log("is ai");
      main(myMessage, buildingPrompt);

      // Place any other actions you want to trigger here
      // For example, you can call a function to process the message
      // processAiMessage(message);
    }

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
        {messages ? (
          messages.map((msg) => (
            <div key={msg.id} style={styles.message}>
              <strong>{msg.author}: </strong>
              <span>{msg.content}</span>
            </div>
          ))
        ) : (
          // Optionally, display a placeholder when there are no messages
          <div style={styles.noMessages}>No messages yet.</div>
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
  noMessages: {
    textAlign: "center",
    color: "#888",
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
    color: "#fefefe",
    fontFamily: "inherit",
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
