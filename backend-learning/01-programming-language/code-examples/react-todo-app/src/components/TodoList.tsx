import React from "react";
import { TodoItem } from "./TodoItem";
import type { Todo } from "../types";

/**
 * TodoList 컴포넌트
 *
 * 핵심 개념:
 * 1. 리스트 렌더링 (map)
 * 2. key prop 올바르게 사용
 * 3. React.memo 최적화
 * 4. 조건부 렌더링 (목록이 비었을 때)
 */

interface TodoListProps {
    todos: Todo[];
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

export const TodoList = React.memo(({ todos, onToggle, onDelete }: TodoListProps) => {
    // 조건부 렌더링
    if (todos.length === 0) {
        return (
            <div style={styles.empty}>
                <p>할 일이 없습니다! 🎉</p>
            </div>
        );
    }

    return (
        <ul style={styles.list}>
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}  // ⭐ key는 고유한 ID 사용!
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
});

TodoList.displayName = "TodoList";

const styles = {
    list: {
        listStyle: "none",
        padding: 0,
        margin: 0
    },
    empty: {
        textAlign: "center" as const,
        padding: "40px",
        color: "#999",
        fontSize: "18px"
    }
};
