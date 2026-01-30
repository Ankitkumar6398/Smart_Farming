import React, { useState, useEffect } from "react";
import "../styles/Community.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const userBadgeStyle = {
  padding: "0.75rem 1rem",
  background: "#f0faf3",
  borderRadius: "8px",
  border: "2px solid #d5ebd7",
  color: "#3e8f51",
  fontWeight: "500",
};

const parseJSONResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(
      `Server returned non-JSON response. Make sure the backend is running on ${API_URL}. Response: ${text.substring(0, 100)}`
    );
  }
  return await response.json();
};

// Community forum component
const Community = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({ name: "", question: "" });
  const [posting, setPosting] = useState(false);
  const [answering, setAnswering] = useState({});
  const [newAnswers, setNewAnswers] = useState({});
  const [replying, setReplying] = useState({});
  const [newReplies, setNewReplies] = useState({});
  const [showReplyForms, setShowReplyForms] = useState({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const apiPost = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await parseJSONResponse(response);
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  useEffect(() => {
    fetchUserData();
    fetchQuestions();
  }, []);

  useEffect(() => {
    const handleAuthChange = () => fetchUserData();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setNewPost({ name: "", question: "" });
        return;
      }
      const response = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setNewPost((prev) => ({ ...prev, name: data.user?.name || "" }));
      } else {
        setUser(null);
        setNewPost({ name: "", question: "" });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUser(null);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/community/questions`);
      const data = await parseJSONResponse(response);
      if (!response.ok) throw new Error(data.message || "Failed to fetch questions");
      setQuestions(data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Failed to load questions. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    const userName = user?.name || newPost.name;
    if (!userName || !newPost.question) {
      alert(user ? "Please enter your question!" : "Please enter your name and question!");
      return;
    }
    try {
      setPosting(true);
      await apiPost(`${API_URL}/api/community/questions`, {
        userName: user?.name || newPost.name,
        question: newPost.question,
      });
      await fetchQuestions();
      setNewPost({ name: user?.name || "", question: "" });
      alert("Question posted successfully!");
    } catch (err) {
      console.error("Error posting question:", err);
      alert(err.message || "Failed to post question");
    } finally {
      setPosting(false);
    }
  };

  const handleAnswer = async (questionId) => {
    const answerData = newAnswers[questionId];
    const userName = user?.name || answerData?.name;
    if (!userName || !answerData?.answer) {
      alert(user ? "Please enter your answer!" : "Please enter your name and answer!");
      return;
    }
    try {
      setAnswering((prev) => ({ ...prev, [questionId]: true }));
      await apiPost(`${API_URL}/api/community/questions/${questionId}/answers`, {
        userName: user?.name || answerData.name,
        answer: answerData.answer,
      });
      await fetchQuestions();
      setNewAnswers((prev) => ({ ...prev, [questionId]: { name: user?.name || "", answer: "" } }));
      alert("Answer posted successfully!");
    } catch (err) {
      console.error("Error posting answer:", err);
      alert(err.message || "Failed to post answer");
    } finally {
      setAnswering((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleAnswerChange = (questionId, field, value) => {
    setNewAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value },
    }));
  };

  const handleReply = async (questionId, answerId) => {
    const key = `${questionId}-${answerId}`;
    const replyData = newReplies[key];
    const userName = user?.name || replyData?.name;
    if (!userName || !replyData?.reply) {
      alert(user ? "Please enter your reply!" : "Please enter your name and reply!");
      return;
    }
    try {
      setReplying((prev) => ({ ...prev, [key]: true }));
      await apiPost(
        `${API_URL}/api/community/questions/${questionId}/answers/${answerId}/replies`,
        { userName: user?.name || replyData.name, reply: replyData.reply }
      );
      await fetchQuestions();
      setNewReplies((prev) => ({ ...prev, [key]: { name: user?.name || "", reply: "" } }));
      setShowReplyForms((prev) => ({ ...prev, [key]: false }));
      alert("Reply posted successfully!");
    } catch (err) {
      console.error("Error posting reply:", err);
      alert(err.message || "Failed to post reply");
    } finally {
      setReplying((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleReplyChange = (questionId, answerId, field, value) => {
    const key = `${questionId}-${answerId}`;
    setNewReplies((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const toggleReplyForm = (questionId, answerId) => {
    const key = `${questionId}-${answerId}`;
    const willShow = !showReplyForms[key];
    setShowReplyForms((prev) => ({ ...prev, [key]: willShow }));
    if (willShow && user) {
      setNewReplies((prev) => ({ ...prev, [key]: { name: user.name, reply: "" } }));
    }
  };

  const renderUserBadge = (label, styleOverride = {}) =>
    user ? (
      <div style={{ ...userBadgeStyle, ...styleOverride }}>
        👤 {label}: <strong>{user.name}</strong>
      </div>
    ) : null;


  return (
    <div className="community-container">
      <h1>💬 Farmer Community Forum</h1>
      <p>Ask questions, share knowledge, and get expert advice from fellow farmers.</p>

      <div className="post-form">
        {user ? (
          renderUserBadge("Posting as", { padding: "0.9rem 1.25rem" })
        ) : (
          <input
            type="text"
            placeholder="Your Name"
            value={newPost.name}
            onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
          />
        )}
        <textarea
          placeholder="Type your question..."
          value={newPost.question}
          onChange={(e) => setNewPost({ ...newPost, question: e.target.value })}
        ></textarea>
        <button onClick={handlePost} disabled={posting}>
          {posting ? "Posting..." : "Post Question"}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ margin: "20px 0", padding: "10px", background: "#fee", color: "#c33", borderRadius: "5px" }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading questions...</p>
        </div>
      ) : (
        <div className="posts-section">
          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>No questions yet. Be the first to ask a question!</p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question._id} className="post-card">
                <div className="question-header">
                  <h3>{question.userName}</h3>
                  <span className="question-date">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="question">❓ {question.question}</p>

                <div className="answers-section">
                  {question.answers && question.answers.length > 0 ? (
                    <>
                      <h4>💡 Answers ({question.answers.length}):</h4>
                      {question.answers.map((answer, idx) => {
                        const replyKey = `${question._id}-${answer._id}`;
                        return (
                        <div key={answer._id || idx} className="answer-card">
                          <div className="answer-header">
                            <strong>{answer.userName}</strong>
                            <span className="answer-date">
                              {new Date(answer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p>{answer.answer}</p>
                          
                          {answer.replies && answer.replies.length > 0 && (
                            <div className="replies-section">
                              {answer.replies.map((reply, replyIdx) => (
                                <div key={reply._id || replyIdx} className="reply-card">
                                  <div className="reply-header">
                                    <strong>{reply.userName}</strong>
                                    <span className="reply-date">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p>{reply.reply}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => toggleReplyForm(question._id, answer._id)}
                            className="reply-button"
                          >
                            💬 Reply
                          </button>

                          {showReplyForms[replyKey] && (
                            <div className="reply-form">
                              {user
                                ? renderUserBadge("Replying as", { marginBottom: "0.5rem", fontSize: "0.9rem" })
                                : (
                                  <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={newReplies[replyKey]?.name || ""}
                                    onChange={(e) => handleReplyChange(question._id, answer._id, "name", e.target.value)}
                                    style={{ marginBottom: "0.5rem" }}
                                  />
                                )}
                              <textarea
                                placeholder="Type your reply..."
                                value={newReplies[replyKey]?.reply || ""}
                                onChange={(e) => handleReplyChange(question._id, answer._id, "reply", e.target.value)}
                                style={{ marginBottom: "0.5rem" }}
                              ></textarea>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                  onClick={() => handleReply(question._id, answer._id)}
                                  disabled={replying[replyKey]}
                                  className="reply-submit-button"
                                >
                                  {replying[replyKey] ? "Posting..." : "Post Reply"}
                                </button>
                                <button
                                  onClick={() => toggleReplyForm(question._id, answer._id)}
                                  className="reply-cancel-button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="no-answers">No answers yet. Be the first to help!</p>
                  )}
                </div>

                <div className="answer-form">
                  {user ? (
                    renderUserBadge("Answering as")
                  ) : (
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newAnswers[question._id]?.name || ""}
                      onChange={(e) =>
                        handleAnswerChange(question._id, "name", e.target.value)
                      }
                    />
                  )}
                  <textarea
                    placeholder="Type your answer..."
                    value={newAnswers[question._id]?.answer || ""}
                    onChange={(e) =>
                      handleAnswerChange(question._id, "answer", e.target.value)
                    }
                  ></textarea>
                  <button
                    onClick={() => handleAnswer(question._id)}
                    disabled={answering[question._id]}
                    className="answer-button"
                  >
                    {answering[question._id] ? "Posting..." : "Post Answer"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
