import React, { useState } from "react";
import "../styles/Community.css";

const Community = () => {
  const [posts, setPosts] = useState([
    {
      name: "Ramesh Patel",
      question: "My wheat leaves have brown spots. What should I do?",
      reply: "It might be leaf rust. Use Mancozeb spray twice a week."
    },
    {
      name: "Sunita Devi",
      question: "Which fertilizer is best for sugarcane?",
      reply: "Apply nitrogen and potassium-based fertilizers at 30-day intervals."
    }
  ]);

  const [newPost, setNewPost] = useState({ name: "", question: "" });

  const handlePost = () => {
    if (!newPost.name || !newPost.question) {
      alert("Please enter your name and question!");
      return;
    }
    setPosts([{ ...newPost, reply: "Awaiting expert response..." }, ...posts]);
    setNewPost({ name: "", question: "" });
  };

  return (
    <div className="community-container">
      <h1>💬 Farmer Community Forum</h1>
      <p>Ask questions, share knowledge, and get expert advice from fellow farmers.</p>

      {/* Post form */}
      <div className="post-form">
        <input
          type="text"
          placeholder="Your Name"
          value={newPost.name}
          onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
        />
        <textarea
          placeholder="Type your question..."
          value={newPost.question}
          onChange={(e) => setNewPost({ ...newPost, question: e.target.value })}
        ></textarea>
        <button onClick={handlePost}>Post Question</button>
      </div>

      {/* Posts Display */}
      <div className="posts-section">
        {posts.map((post, index) => (
          <div key={index} className="post-card">
            <h3>{post.name}</h3>
            <p className="question">❓ {post.question}</p>
            <p className="reply">💡 {post.reply}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
