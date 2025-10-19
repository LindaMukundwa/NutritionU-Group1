import React, { useState } from 'react';
import styles from './AssistantContent.module.css';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const AssistantContent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const examplePrompts = [
        "What are some healthy breakfast options?",
        "How many calories should I eat per day?",
        "Can you suggest a meal plan for weight loss?",
        "What foods are high in protein?",
        "How can I increase my daily fiber intake?"
    ];

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            timestamp: new Date()
        };

        // Add user message to the chat
        setMessages(prevMessages => [...prevMessages, userMessage]);

        // Clear input field
        setInputText('');

        // Set loading state
        setIsLoading(true);

        try {
            // Call backend API
            const response = await fetch('http://localhost:3001/api/chatbot/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage.text })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from the server');
            }

            const data = await response.json();

            // Add assistant response to chat
            const assistantMessage: Message = {
                id: Date.now().toString(),
                text: data.reply,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prevMessages => [...prevMessages, assistantMessage]);

        } catch (error) {
            console.error('Error fetching response:', error);

            // Add error message
            const errorMessage: Message = {
                id: Date.now().toString(),
                text: "Sorry, I couldn't get a response. Please try again.",
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (prompt: string) => {
        setInputText(prompt);
    };

    return (
        <div className={styles["assistant-content"]}>
            <div className={styles["chat-header"]}>
                <h2>Nutrition Assistant</h2>
            </div>

            {messages.length === 0 ? (
                <div className={styles["welcome-section"]}>
                    <h3>Ask me anything about nutrition, meal planning, or dietary advice.</h3>
                    <div className={styles["example-prompts"]}>
                        {examplePrompts.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => handleExampleClick(prompt)}
                                className={styles["example-prompt"]}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={styles["chat-container"]}>
                    <div className={styles["messages-container"]}>
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`${styles.message} ${message.isUser ? styles["user-message"] : styles["ai-message"]}`}
                            >
                                <div className={styles["message-content"]}>
                                    {message.isUser ? (
                                        message.text
                                    ) : (
                                        message.text.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < message.text.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))
                                    )}
                                </div>
                                <div className={styles["message-timestamp"]}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles["ai-message"]}`}>
                                <div className={styles["message-content"]}>
                                    <div className={styles["typing-indicator"]}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={styles["chat-input-container"]}>
                <div className={styles["input-group"]}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className={styles["chat-input"]}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        className={styles["send-button"]}
                        disabled={isLoading || !inputText.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssistantContent;