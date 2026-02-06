import React, { useState, useRef, useEffect } from "react";
import "../styles/ChatBoat.css";

const CHATBOAT_API_URL = process.env.REACT_APP_CHATBOAT_API_URL || "http://localhost:5001";

const ChatBoat = ({ embedded = false }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your farming assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file");
      }
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    const messageToSend = inputMessage.trim() || (selectedFile ? "Analyze this image" : "");

    const userMessage = {
      text: messageToSend,
      sender: "user",
      timestamp: new Date(),
      image: imagePreview,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      if (selectedFile) {
        // Upload image for analysis
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("query", messageToSend || "general");
        formData.append("language", language);

        const response = await fetch(`${CHATBOAT_API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            {
              text: data.analysis || "Analysis completed",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: data.error || "Failed to analyze image",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        }

        removeImage();
      } else {
        // Text chat
        const response = await fetch(`${CHATBOAT_API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageToSend,
            language: language,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            {
              text: data.response || "I'm here to help!",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: "Sorry, I encountered an error. Please try again.",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting. Please check if the ChatBoat service is running.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`chatboat-container ${embedded ? "chatboat-embedded" : ""}`}>
      <div className="chatboat-header">
        <h1>🤖 ChatBoat - Farming Assistant</h1>
        <div className="language-selector">
          <label>Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </div>

      <div className="chatboat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
          >
            {msg.image && (
              <div className="message-image">
                <img src={msg.image} alt="Uploaded" />
              </div>
            )}
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatboat-input-area">
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" />
            <button onClick={removeImage} className="remove-image-btn">
              ✕
            </button>
          </div>
        )}
        <div className="input-controls">
          <label htmlFor="file-upload" className="file-upload-btn">
            📷
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              language === "hi"
                ? "अपना सवाल टाइप करें..."
                : "Type your message..."
            }
            className="message-input"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
            className="send-btn"
          >
            {isLoading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBoat;
