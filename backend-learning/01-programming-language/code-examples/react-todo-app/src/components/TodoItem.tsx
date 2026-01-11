import React from "react";
import type { Todo } from "../types";

/**
 * TodoItem 컴포넌트
 *
 * 핵심 개념:
 * 1. React.memo - 불필요한 리렌더링 방지
 * 2. Props 타입 정의
 * 3. 조건부 스타일링
 */

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

export const TodoItem = React.memo(({ todo, onToggle, onDelete }: TodoItemProps) => {
    return (
        <li style={styles.item}>
            <div style={styles.content}>
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                    style={styles.checkbox}
                />
                <span
                    style={{
                        ...styles.text,
                        // 조건부 스타일링
                        textDecoration: todo.completed ? "line-through" : "none",
                        color: todo.completed ? "#999" : "#333"
                    }}
                >
                    {todo.text}
                </span>
            </div>
            <button
                onClick={() => onDelete(todo.id)}
                style={styles.deleteButton}
                aria-label="삭제"
            >
                삭제
            </button>
        </li>
    );
});

// React.memo로 최적화된 컴포넌트는 displayName 설정 권장
TodoItem.displayName = "TodoItem";

const styles = {
    item: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        backgroundColor: "white",
        borderRadius: "8px",
        marginBottom: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s"
    },
    content: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flex: 1
    },
    checkbox: {
        width: "20px",
        height: "20px",
        cursor: "pointer"
    },
    text: {
        fontSize: "16px",
        flex: 1
    },
    deleteButton: {
        padding: "8px 16px",
        backgroundColor: "#ff4757",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "background-color 0.2s"
    }
};
