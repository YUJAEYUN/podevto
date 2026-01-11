import { useState } from "react";

/**
 * TodoInput 컴포넌트
 *
 * 핵심 개념:
 * 1. useState - 입력 상태 관리
 * 2. 이벤트 핸들링 - onChange, onSubmit
 * 3. TypeScript Props 타입 정의
 */

interface TodoInputProps {
    onAdd: (text: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
    // useState - 입력 상태 관리
    const [text, setText] = useState("");

    // 폼 제출 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedText = text.trim();
        if (!trimmedText) return;

        onAdd(trimmedText);
        setText("");  // 입력 초기화
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="새로운 할 일을 입력하세요..."
                style={styles.input}
            />
            <button type="submit" style={styles.button}>
                추가
            </button>
        </form>
    );
}

// 인라인 스타일
const styles = {
    form: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px"
    },
    input: {
        flex: 1,
        padding: "12px 16px",
        fontSize: "16px",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        outline: "none",
        transition: "border-color 0.2s"
    },
    button: {
        padding: "12px 24px",
        fontSize: "16px",
        backgroundColor: "#667eea",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: "background-color 0.2s"
    }
};
