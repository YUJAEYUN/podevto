# SQL Parser - 간단한 SQL 파서 구현

> "SQL이 어떻게 실행되는지 직접 만들어보며 이해한다"

## 🎯 학습 목표

- **Tokenizer (렉서)** 구현
- **Parser (구문 분석기)** 구현
- **AST (Abstract Syntax Tree)** 생성
- **Simple Executor** 구현

## 📚 파서의 동작 과정

```
SQL 문자열
    ↓ Tokenizer
Token 목록
    ↓ Parser
AST (Abstract Syntax Tree)
    ↓ Executor
결과
```

## 🔧 Phase 1: Tokenizer (토크나이저)

### 목표
SQL 문자열을 토큰으로 분리

### 구현

```python
# tokenizer.py
import re
from enum import Enum

class TokenType(Enum):
    # 키워드
    SELECT = 'SELECT'
    FROM = 'FROM'
    WHERE = 'WHERE'
    AND = 'AND'
    OR = 'OR'

    # 데이터 타입
    IDENTIFIER = 'IDENTIFIER'  # 컬럼명, 테이블명
    NUMBER = 'NUMBER'
    STRING = 'STRING'

    # 연산자
    OPERATOR = 'OPERATOR'  # =, >, <, >=, <=, !=
    COMMA = 'COMMA'
    STAR = 'STAR'  # *

    # 기타
    EOF = 'EOF'

class Token:
    def __init__(self, type, value):
        self.type = type
        self.value = value

    def __repr__(self):
        return f"Token({self.type}, {self.value!r})"

class Tokenizer:
    def __init__(self, sql):
        self.sql = sql
        self.pos = 0
        self.tokens = []

    def tokenize(self):
        """SQL을 토큰 목록으로 변환"""
        patterns = [
            (TokenType.SELECT, r'\bSELECT\b'),
            (TokenType.FROM, r'\bFROM\b'),
            (TokenType.WHERE, r'\bWHERE\b'),
            (TokenType.AND, r'\bAND\b'),
            (TokenType.OR, r'\bOR\b'),
            (TokenType.NUMBER, r'\d+'),
            (TokenType.STRING, r"'[^']*'"),
            (TokenType.OPERATOR, r'>=|<=|!=|=|>|<'),
            (TokenType.COMMA, r','),
            (TokenType.STAR, r'\*'),
            (TokenType.IDENTIFIER, r'[a-zA-Z_][a-zA-Z0-9_]*'),
        ]

        # 정규식 결합
        pattern = '|'.join(f'(?P<{name.name}>{pattern})'
                          for name, pattern in patterns)

        for match in re.finditer(pattern, self.sql, re.IGNORECASE):
            token_type = TokenType[match.lastgroup]
            token_value = match.group()

            # 문자열에서 따옴표 제거
            if token_type == TokenType.STRING:
                token_value = token_value[1:-1]

            self.tokens.append(Token(token_type, token_value))

        self.tokens.append(Token(TokenType.EOF, None))
        return self.tokens

# 테스트
if __name__ == '__main__':
    sql = "SELECT name, age FROM users WHERE age > 20"
    tokenizer = Tokenizer(sql)
    tokens = tokenizer.tokenize()

    for token in tokens:
        print(token)

    # 출력:
    # Token(TokenType.SELECT, 'SELECT')
    # Token(TokenType.IDENTIFIER, 'name')
    # Token(TokenType.COMMA, ',')
    # Token(TokenType.IDENTIFIER, 'age')
    # Token(TokenType.FROM, 'FROM')
    # Token(TokenType.IDENTIFIER, 'users')
    # Token(TokenType.WHERE, 'WHERE')
    # Token(TokenType.IDENTIFIER, 'age')
    # Token(TokenType.OPERATOR, '>')
    # Token(TokenType.NUMBER, '20')
    # Token(TokenType.EOF, None)
```

## 🔧 Phase 2: Parser (파서)

### 목표
토큰을 AST로 변환

### AST 구조

```python
{
    'type': 'SELECT',
    'columns': ['name', 'age'],  # * 또는 컬럼 목록
    'table': 'users',
    'where': {
        'type': 'comparison',
        'left': 'age',
        'operator': '>',
        'right': 20
    }
}
```

### 구현

```python
# parser.py
from tokenizer import Tokenizer, TokenType

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def parse(self):
        """토큰을 AST로 변환"""
        return self._parse_select()

    def _current_token(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def _expect(self, token_type):
        """특정 타입의 토큰 확인 및 진행"""
        token = self._current_token()
        if token is None or token.type != token_type:
            raise SyntaxError(f"Expected {token_type}, got {token}")

        self.pos += 1
        return token.value

    def _parse_select(self):
        """SELECT 문 파싱"""
        self._expect(TokenType.SELECT)

        # 컬럼 파싱
        columns = self._parse_columns()

        # FROM
        self._expect(TokenType.FROM)
        table = self._expect(TokenType.IDENTIFIER)

        # WHERE (선택)
        where_clause = None
        if (self._current_token() and
            self._current_token().type == TokenType.WHERE):
            self._expect(TokenType.WHERE)
            where_clause = self._parse_where()

        return {
            'type': 'SELECT',
            'columns': columns,
            'table': table,
            'where': where_clause
        }

    def _parse_columns(self):
        """컬럼 목록 파싱"""
        columns = []

        # * 처리
        if self._current_token().type == TokenType.STAR:
            self._expect(TokenType.STAR)
            return ['*']

        # 컬럼 목록
        columns.append(self._expect(TokenType.IDENTIFIER))

        # 추가 컬럼 (, column)
        while (self._current_token() and
               self._current_token().type == TokenType.COMMA):
            self._expect(TokenType.COMMA)
            columns.append(self._expect(TokenType.IDENTIFIER))

        return columns

    def _parse_where(self):
        """WHERE 절 파싱"""
        left = self._expect(TokenType.IDENTIFIER)
        operator = self._expect(TokenType.OPERATOR)

        # 값 (NUMBER 또는 STRING)
        token = self._current_token()
        if token.type == TokenType.NUMBER:
            right = int(self._expect(TokenType.NUMBER))
        elif token.type == TokenType.STRING:
            right = self._expect(TokenType.STRING)
        else:
            raise SyntaxError(f"Expected NUMBER or STRING, got {token}")

        return {
            'type': 'comparison',
            'left': left,
            'operator': operator,
            'right': right
        }

# 테스트
if __name__ == '__main__':
    sql = "SELECT name, age FROM users WHERE age > 20"

    # Tokenize
    tokenizer = Tokenizer(sql)
    tokens = tokenizer.tokenize()

    # Parse
    parser = Parser(tokens)
    ast = parser.parse()

    import json
    print(json.dumps(ast, indent=2))

    # 출력:
    # {
    #   "type": "SELECT",
    #   "columns": ["name", "age"],
    #   "table": "users",
    #   "where": {
    #     "type": "comparison",
    #     "left": "age",
    #     "operator": ">",
    #     "right": 20
    #   }
    # }
```

## 🔧 Phase 3: Executor (실행기)

### 목표
AST를 실행하여 결과 반환

### 구현

```python
# executor.py
class Executor:
    def __init__(self, data):
        """
        data: {
            'users': [
                {'id': 1, 'name': 'Alice', 'age': 25},
                {'id': 2, 'name': 'Bob', 'age': 30},
                ...
            ]
        }
        """
        self.data = data

    def execute(self, ast):
        """AST 실행"""
        if ast['type'] == 'SELECT':
            return self._execute_select(ast)
        else:
            raise NotImplementedError(f"Unknown type: {ast['type']}")

    def _execute_select(self, ast):
        """SELECT 실행"""
        table_name = ast['table']
        rows = self.data.get(table_name, [])

        # WHERE 필터링
        if ast['where']:
            rows = [row for row in rows
                   if self._evaluate_where(row, ast['where'])]

        # 컬럼 선택
        if ast['columns'] == ['*']:
            return rows
        else:
            return [{col: row[col] for col in ast['columns']}
                    for row in rows]

    def _evaluate_where(self, row, where_clause):
        """WHERE 조건 평가"""
        if where_clause['type'] != 'comparison':
            raise NotImplementedError()

        left_value = row.get(where_clause['left'])
        operator = where_clause['operator']
        right_value = where_clause['right']

        if operator == '=':
            return left_value == right_value
        elif operator == '>':
            return left_value > right_value
        elif operator == '<':
            return left_value < right_value
        elif operator == '>=':
            return left_value >= right_value
        elif operator == '<=':
            return left_value <= right_value
        elif operator == '!=':
            return left_value != right_value
        else:
            raise NotImplementedError(f"Unknown operator: {operator}")

# 테스트
if __name__ == '__main__':
    # 데이터
    data = {
        'users': [
            {'id': 1, 'name': 'Alice', 'age': 25},
            {'id': 2, 'name': 'Bob', 'age': 30},
            {'id': 3, 'name': 'Charlie', 'age': 20},
        ]
    }

    # SQL 실행
    sql = "SELECT name, age FROM users WHERE age > 20"

    tokenizer = Tokenizer(sql)
    tokens = tokenizer.tokenize()

    parser = Parser(tokens)
    ast = parser.parse()

    executor = Executor(data)
    result = executor.execute(ast)

    print(result)
    # [
    #   {'name': 'Alice', 'age': 25},
    #   {'name': 'Bob', 'age': 30}
    # ]
```

## 🎯 통합 테스트

```python
# sql_engine.py
class SimpleSQLEngine:
    def __init__(self):
        self.data = {}

    def create_table(self, table_name, rows):
        """테이블 생성"""
        self.data[table_name] = rows

    def execute(self, sql):
        """SQL 실행"""
        # 1. Tokenize
        tokenizer = Tokenizer(sql)
        tokens = tokenizer.tokenize()

        # 2. Parse
        parser = Parser(tokens)
        ast = parser.parse()

        # 3. Execute
        executor = Executor(self.data)
        return executor.execute(ast)

# 테스트
if __name__ == '__main__':
    engine = SimpleSQLEngine()

    # 테이블 생성
    engine.create_table('users', [
        {'id': 1, 'name': 'Alice', 'age': 25, 'city': 'Seoul'},
        {'id': 2, 'name': 'Bob', 'age': 30, 'city': 'Busan'},
        {'id': 3, 'name': 'Charlie', 'age': 20, 'city': 'Seoul'},
    ])

    # 쿼리 실행
    queries = [
        "SELECT * FROM users",
        "SELECT name, age FROM users",
        "SELECT name FROM users WHERE age > 20",
        "SELECT name FROM users WHERE city = 'Seoul'",
    ]

    for sql in queries:
        print(f"\nSQL: {sql}")
        result = engine.execute(sql)
        for row in result:
            print(row)
```

## 🎯 체크리스트

- [ ] Tokenizer 구현 및 테스트
- [ ] Parser 구현 및 AST 생성
- [ ] Executor 구현 및 쿼리 실행
- [ ] 통합 테스트
- [ ] AND/OR 지원 추가 (선택)
- [ ] JOIN 지원 추가 (선택)

---

**"SQL 파서를 만들면 SQL이 더 이상 마법이 아니다"**
