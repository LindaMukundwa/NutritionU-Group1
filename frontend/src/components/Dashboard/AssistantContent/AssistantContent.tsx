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

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm here to help with your nutrition questions! This is a placeholder response.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1000);
    };

    const handleExampleClick = (prompt: string) => {
        setInputText(prompt);
    };

    return (
        <div className={styles["assistant-content"]}>
            <div className={styles["chat-header"]}>
            <h2>Nutrition Assistant</h2>
            </div>

            <div className={styles["chat-container"]}>
            {messages.length === 0 ? (
                <div className={styles["welcome-section"]}>
                <h3>Welcome! Try asking me about:</h3>
                <div className={styles["example-prompts"]}>
                    {examplePrompts.map((prompt, index) => (
                    <button
                        key={index}
                        className={styles["example-prompt"]}
                        onClick={() => handleExampleClick(prompt)}
                    >
                        {prompt}
                    </button>
                    ))}
                </div>
                </div>
            ) : (
                <div className={styles["messages-container"]}>
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={`${styles["message"]} ${message.isUser ? styles["user-message"] : styles["ai-message"]}`}
                    >
                    <div className={styles["message-content"]}>
                        {message.text}
                    </div>
                    <div className={styles["message-timestamp"]}>
                        {message.timestamp.toLocaleTimeString()}
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className={`${styles["message"]} ${styles["ai-message"]}`}>
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
            )}
            </div>

            <div className={styles["chat-input-container"]}>
            <div className={styles["input-group"]}>
                <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about nutrition..."
                className={styles["chat-input"]}
                disabled={isLoading}
                />
                <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={styles["send-button"]}
                >
                Send
                </button>
            </div>
            </div>
     </div>
    );
};

export default AssistantContent;