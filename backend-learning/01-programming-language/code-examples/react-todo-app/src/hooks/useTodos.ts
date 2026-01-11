import { useState, useEffect, useCallback, useMemo } from "react";
import type { Todo, Filter } from "../types";

/**
 * Custom Hook: useTodos
 *
 * 핵심 개념:
 * 1. useState - 상태 관리
 * 2. useEffect - localStorage 동기화 (부수 효과)
 * 3. useCallback - 함수 메모이제이션
 * 4. useMemo - 계산 결과 캐싱
 */
export function useTodos() {
    // 1. useState - 상태 관리
    const [todos, setTodos] = useState<Todo[]>(() => {
        // 초기값: localStorage에서 불러오기
        const saved = localStorage.getItem("todos");
        if (saved) {
            const parsed = JSON.parse(saved);
            // Date 객체로 변환
            return parsed.map((todo: any) => ({
                ...todo,
                createdAt: new Date(todo.createdAt)
            }));
        }
        return [];
    });

    const [filter, setFilter] = useState<Filter>("all");

    // 2. useEffect - localStorage 동기화
    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    // 3. useCallback - 함수 메모이제이션 (불필요한 리렌더링 방지)
    const addTodo = useCallback((text: string) => {
        const newTodo: Todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date()
        };
        // 불변성 유지 (spread 연산자)
        setTodos(prev => [...prev, newTodo]);
    }, []);

    const toggleTodo = useCallback((id: number) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id
                ? { ...todo, completed: !todo.completed }
                : todo
        ));
    }, []);

    const deleteTodo = useCallback((id: number) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    }, []);

    // 4. useMemo - 필터링 결과 캐싱 (비싼 계산 방지)
    const filteredTodos = useMemo(() => {
        switch (filter) {
            case "active":
                return todos.filter(t => !t.completed);
            case "completed":
                return todos.filter(t => t.completed);
            default:
                return todos;
        }
    }, [todos, filter]);

    // 통계 계산 (useMemo)
    const stats = useMemo(() => ({
        total: todos.length,
        active: todos.filter(t => !t.completed).length,
        completed: todos.filter(t => t.completed).length
    }), [todos]);

    return {
        todos: filteredTodos,
        filter,
        stats,
        setFilter,
        addTodo,
        toggleTodo,
        deleteTodo
    };
}
