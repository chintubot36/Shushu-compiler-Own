# Shushu Compiler - Local Backend

This version runs Java through your own local backend. No RapidAPI key is required.

## Requirements

- Node.js 18+
- JDK installed
- `java -version` works in Command Prompt
- `javac -version` works in Command Prompt

## Run

Open Command Prompt inside this project folder:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Test Java

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

Expected output:

```text
Hello World
```

## Important

This backend executes user-supplied Java code on your computer. Use it only for local development. Do not expose this server publicly. A production compiler should execute code inside isolated containers or another sandbox.
