import { useTodos } from "./hooks/useTodos";
import { TodoInput } from "./components/TodoInput";
import { FilterButtons } from "./components/FilterButtons";
import { TodoList } from "./components/TodoList";

/**
 * App 컴포넌트 (메인)
 *
 * 핵심 개념:
 * 1. Custom Hook 사용 (useTodos)
 * 2. 컴포넌트 조합
 * 3. Props 전달
 * 4. 상태 끌어올리기 (State Lifting)
 */

function App() {
    // Custom Hook 사용 - 모든 로직이 여기 캡슐화됨!
    const { todos, filter, stats, setFilter, addTodo, toggleTodo, deleteTodo } = useTodos();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* 헤더 */}
                <header style={styles.header}>
                    <h1 style={styles.title}>📝 TODO List</h1>
                    <div style={styles.stats}>
                        <span>전체: {stats.total}</span>
                        <span>진행중: {stats.active}</span>
                        <span>완료: {stats.completed}</span>
                    </div>
                </header>

                {/* 입력 컴포넌트 */}
                <TodoInput onAdd={addTodo} />

                {/* 필터 버튼 */}
                <FilterButtons current={filter} onChange={setFilter} />

                {/* TODO 리스트 */}
                <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />

                {/* 푸터 */}
                <footer style={styles.footer}>
                    <p style={styles.footerText}>
                        💡 React 핵심 개념: useState, useEffect, Custom Hook, useMemo, useCallback, React.memo
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default App;

const styles = {
    container: {
        width: "100%",
        maxWidth: "600px"
    },
    card: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)"
    },
    header: {
        marginBottom: "24px"
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#333",
        marginBottom: "12px"
    },
    stats: {
        display: "flex",
        gap: "16px",
        fontSize: "14px",
        color: "#666"
    },
    footer: {
        marginTop: "24px",
        paddingTop: "24px",
        borderTop: "1px solid #e0e0e0"
    },
    footerText: {
        fontSize: "12px",
        color: "#999",
        textAlign: "center" as const
    }
};
