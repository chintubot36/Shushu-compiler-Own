# Shushu Compiler 🚀

Shushu Compiler is a full-stack online code compiler that allows users to write, execute, and view the output of code directly from a web browser.

## 🌐 Live Demo

**Live Application:**  
https://shushu-compiler-own-production.up.railway.app

---

## 📖 About the Project

Shushu Compiler provides a simple online coding environment where users can write code in a code editor, execute it by clicking the **Run Code** button, and view the output on the same page.

The application is built using a frontend-backend architecture. The frontend provides the user interface, while the backend handles Java code compilation and execution.

Currently, Java code execution is supported through the backend. HTML code can also be rendered directly in the browser.

---

## ⚙️ How It Works

```text
User
  ↓
Code Editor
  ↓
Frontend
  ↓
POST /run API
  ↓
Node.js + Express Backend
  ↓
Java Compiler (javac)
  ↓
Java Program Execution
  ↓
Output
```

When a user clicks **Run Code**:

1. The user writes Java code in the code editor.
2. The frontend collects the source code.
3. The code is sent to the backend using the `/run` API.
4. The Node.js server receives the code.
5. The backend creates a temporary `Main.java` file.
6. The Java compiler (`javac`) compiles the program.
7. The Java runtime executes the compiled program.
8. The output is sent back to the frontend.
9. The result is displayed in the Output section.

---

## ✨ Features

- 📝 Code editor
- ▶️ Run code functionality
- ☕ Java code compilation and execution
- 🌐 HTML/CSS/JavaScript browser preview
- 📤 Output display
- 🌙 Dark mode
- 💾 Save code snippets
- ⬇️ Download code
- 📱 Responsive user interface
- 🚀 Online deployment
- 🌍 Accessible from desktop and mobile devices

---

## 💻 Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- Java JDK

### Deployment

- GitHub
- Railway
- Docker

---

## 📁 Project Structure

```text
Shushu-Compiler/
│
├── public/
│   └── index.html
│
├── server.js
├── package.json
├── package-lock.json
├── Dockerfile
└── README.md
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/chintubot36/Shushu-compiler-Own.git
```

### 2. Go to the project folder

```bash
cd Shushu-compiler-Own
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the application

```bash
npm start
```

### 5. Open in your browser

```text
http://localhost:3000
```

---

## ☕ Java Example

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

### Output

```text
Hello World
```

---

## 🔌 API Example

### Endpoint

```text
POST /run
```

### Request

```json
{
  "language": "java",
  "sourceCode": "public class Main { ... }"
}
```

### Response

```json
{
  "success": true,
  "output": "Hello World"
}
```

---

## 🌍 Deployment

The application is deployed using Railway.

Live URL:

https://shushu-compiler-own-production.up.railway.app

The application can be accessed from:

- 💻 Computer
- 📱 Mobile phone
- 🌐 Any modern web browser

---

## 🧠 Project Architecture

```text
Client Browser
      │
      ▼
HTML / CSS / JavaScript
      │
      ▼
Express.js API
      │
      ▼
Temporary Java File
      │
      ▼
javac Compilation
      │
      ▼
Java Program Execution
      │
      ▼
Output Response
      │
      ▼
Browser Output Panel
```

---

## 🔮 Future Improvements

- Support more backend programming languages
- Add user authentication
- Add code history
- Add input support for programs
- Improve compiler error messages
- Add code syntax highlighting
- Add secure code execution sandboxing

---

## 👨‍💻 Author

**Saikiran Reddy**

GitHub:  
https://github.com/chintubot36

---

## 📄 License

This project is created for learning and educational purposes.
