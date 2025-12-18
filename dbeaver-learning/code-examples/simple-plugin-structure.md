# 간단한 플러그인 구조 예제

## 기본 플러그인 디렉토리 구조

```
org.example.dbeaver.ext.mydb/
├── META-INF/
│   └── MANIFEST.MF              # OSGi 번들 정의
├── plugin.xml                   # Eclipse 확장 정의
├── src/
│   └── org/example/dbeaver/ext/mydb/
│       ├── MyDBDataSourceProvider.java
│       ├── MyDBDataSource.java
│       ├── model/
│       │   ├── MyDBSchema.java
│       │   ├── MyDBTable.java
│       │   └── MyDBColumn.java
│       └── MyDBSQLDialect.java
├── icons/
│   └── mydb_icon.png
└── pom.xml
```

## MANIFEST.MF 예제

```
Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Bundle-Name: MyDB Support
Bundle-SymbolicName: org.example.dbeaver.ext.mydb;singleton:=true
Bundle-Version: 1.0.0.qualifier
Bundle-RequiredExecutionEnvironment: JavaSE-21
Require-Bundle: org.jkiss.dbeaver.model;bundle-version="2.0.0"
Export-Package: org.example.dbeaver.ext.mydb,
 org.example.dbeaver.ext.mydb.model
```

## plugin.xml 예제

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?eclipse version="3.2"?>
<plugin>
    <extension point="org.jkiss.dbeaver.dataSourceProvider">
        <datasource
            id="mydb"
            class="org.example.dbeaver.ext.mydb.MyDBDataSourceProvider"
            label="MyDB"
            description="MyDB Database"
            icon="icons/mydb_icon.png">
        </datasource>
    </extension>
</plugin>
```

## DataSourceProvider 구현

```java
package org.example.dbeaver.ext.mydb;

import org.jkiss.dbeaver.model.connection.DBPDriver;
import org.jkiss.dbeaver.model.impl.jdbc.JDBCDataSourceProvider;

public class MyDBDataSourceProvider extends JDBCDataSourceProvider {

    @Override
    public void init(DBPPlatform platform) {
        // 초기화 코드
    }

    @Override
    public long getFeatures() {
        return FEATURE_SCHEMAS | FEATURE_CATALOGS;
    }

    @Override
    public DBPDataSource openDataSource(
        DBRProgressMonitor monitor,
        DBPDataSourceContainer container) throws DBException {
        return new MyDBDataSource(monitor, container);
    }
}
```

## DataSource 구현

```java
package org.example.dbeaver.ext.mydb;

import org.jkiss.dbeaver.model.impl.jdbc.JDBCDataSource;

public class MyDBDataSource extends JDBCDataSource {

    public MyDBDataSource(
        DBRProgressMonitor monitor,
        DBPDataSourceContainer container) {
        super(monitor, container);
    }

    @Override
    public void initialize(DBRProgressMonitor monitor) throws DBException {
        super.initialize(monitor);
        // MyDB 특화 초기화
    }

    @Override
    public SQLDialect getSQLDialect() {
        return MyDBSQLDialect.INSTANCE;
    }
}
```

## Table 구현

```java
package org.example.dbeaver.ext.mydb.model;

import org.jkiss.dbeaver.model.impl.jdbc.JDBCTable;

public class MyDBTable extends JDBCTable<MyDBDataSource, MyDBSchema> {

    public MyDBTable(MyDBSchema schema, String name) {
        super(schema, name, false);
    }

    @Override
    public Collection<MyDBTableColumn> getAttributes() {
        return getContainer().getTableCache()
            .getChildren(getProgressMonitor(), getSchema(), this);
    }
}
```

## 다음 단계

1. 실제 JDBC 드라이버 연결
2. 메타데이터 추출 로직 구현
3. UI 플러그인 추가 (선택)
4. 테스트 작성
