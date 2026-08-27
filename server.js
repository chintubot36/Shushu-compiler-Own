const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile, spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "500kb" }));
app.use(express.static(path.join(__dirname, "public")));

// =====================================================
// RUN COMMAND
// =====================================================
function runCommand(command, args, options = {}) {
    return new Promise((resolve) => {
        execFile(
            command,
            args,
            {
                cwd: options.cwd,
                timeout: 5000,
                maxBuffer: 1024 * 1024
            },
            (error, stdout, stderr) => {
                resolve({
                    error,
                    stdout: stdout || "",
                    stderr: stderr || ""
                });
            }
        );
    });
}

// =====================================================
// RUN COMMAND WITH STDIN
// Used for SQL
// =====================================================
function runCommandWithInput(command, args, input, options = {}) {
    return new Promise((resolve) => {
        const process = spawn(command, args, {
            cwd: options.cwd
        });

        let stdout = "";
        let stderr = "";
        let finished = false;

        const timeout = setTimeout(() => {
            if (!finished) {
                process.kill("SIGKILL");
            }
        }, 5000);

        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        process.on("error", (error) => {
            clearTimeout(timeout);

            resolve({
                error,
                stdout,
                stderr
            });
        });

        process.on("close", (code, signal) => {
            finished = true;
            clearTimeout(timeout);

            let error = null;

            if (signal) {
                error = new Error("Process timed out");
                error.killed = true;
            } else if (code !== 0) {
                error = new Error(`Process exited with code ${code}`);
            }

            resolve({
                error,
                stdout,
                stderr
            });
        });

        process.stdin.write(input);
        process.stdin.end();
    });
}

// =====================================================
// ERROR RESPONSE
// =====================================================
function responseError(error, stderr, stdout = "") {
    if (error?.killed) {
        return {
            success: false,
            output: "Program stopped: execution time exceeded 5 seconds."
        };
    }

    return {
        success: false,
        output:
            stderr ||
            stdout ||
            error?.message ||
            "Execution failed."
    };
}

// =====================================================
// SQL
// =====================================================
async function runSQL(tempDir, sourceCode) {
    const result = await runCommandWithInput(
        "sqlite3",
        [
            "-header",
            "-column",
            ":memory:"
        ],
        sourceCode,
        {
            cwd: tempDir
        }
    );

    if (result.error || result.stderr) {
        return responseError(
            result.error,
            result.stderr,
            result.stdout
        );
    }

    return {
        success: true,
        output:
            result.stdout ||
            "SQL executed successfully."
    };
}

// =====================================================
// JAVA
// =====================================================
async function runJava(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "Main.java"),
        sourceCode,
        "utf8"
    );

    const compile = await runCommand(
        "javac",
        ["Main.java"],
        {
            cwd: tempDir
        }
    );

    if (compile.error || compile.stderr) {
        return responseError(
            compile.error,
            compile.stderr,
            compile.stdout
        );
    }

    const run = await runCommand(
        "java",
        ["-cp", tempDir, "Main"],
        {
            cwd: tempDir
        }
    );

    if (run.error || run.stderr) {
        return responseError(
            run.error,
            run.stderr,
            run.stdout
        );
    }

    return {
        success: true,
        output:
            run.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// PYTHON
// =====================================================
async function runPython(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "main.py"),
        sourceCode,
        "utf8"
    );

    const result = await runCommand(
        "python3",
        ["main.py"],
        {
            cwd: tempDir
        }
    );

    if (result.error || result.stderr) {
        return responseError(
            result.error,
            result.stderr,
            result.stdout
        );
    }

    return {
        success: true,
        output:
            result.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// JAVASCRIPT
// =====================================================
async function runJavaScript(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "main.js"),
        sourceCode,
        "utf8"
    );

    const result = await runCommand(
        "node",
        ["main.js"],
        {
            cwd: tempDir
        }
    );

    if (result.error || result.stderr) {
        return responseError(
            result.error,
            result.stderr,
            result.stdout
        );
    }

    return {
        success: true,
        output:
            result.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// C
// =====================================================
async function runC(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "main.c"),
        sourceCode,
        "utf8"
    );

    const compile = await runCommand(
        "gcc",
        ["main.c", "-o", "main"],
        {
            cwd: tempDir
        }
    );

    if (compile.error || compile.stderr) {
        return responseError(
            compile.error,
            compile.stderr,
            compile.stdout
        );
    }

    const run = await runCommand(
        "./main",
        [],
        {
            cwd: tempDir
        }
    );

    if (run.error || run.stderr) {
        return responseError(
            run.error,
            run.stderr,
            run.stdout
        );
    }

    return {
        success: true,
        output:
            run.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// C++
// =====================================================
async function runCpp(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "main.cpp"),
        sourceCode,
        "utf8"
    );

    const compile = await runCommand(
        "g++",
        ["main.cpp", "-o", "main"],
        {
            cwd: tempDir
        }
    );

    if (compile.error || compile.stderr) {
        return responseError(
            compile.error,
            compile.stderr,
            compile.stdout
        );
    }

    const run = await runCommand(
        "./main",
        [],
        {
            cwd: tempDir
        }
    );

    if (run.error || run.stderr) {
        return responseError(
            run.error,
            run.stderr,
            run.stdout
        );
    }

    return {
        success: true,
        output:
            run.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// C#
// =====================================================
async function runCSharp(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "Program.cs"),
        sourceCode,
        "utf8"
    );

    fs.writeFileSync(
        path.join(tempDir, "Program.csproj"),
        `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>`,
        "utf8"
    );

    const result = await runCommand(
        "dotnet",
        ["run", "--project", "Program.csproj"],
        {
            cwd: tempDir
        }
    );

    if (result.error || result.stderr) {
        return responseError(
            result.error,
            result.stderr,
            result.stdout
        );
    }

    return {
        success: true,
        output:
            result.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// PHP
// =====================================================
async function runPHP(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "main.php"),
        sourceCode,
        "utf8"
    );

    const result = await runCommand(
        "php",
        ["main.php"],
        {
            cwd: tempDir
        }
    );

    if (result.error || result.stderr) {
        return responseError(
            result.error,
            result.stderr,
            result.stdout
        );
    }

    return {
        success: true,
        output:
            result.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// GO
// =====================================================
async function runGo(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "main.go"),
        sourceCode,
        "utf8"
    );

    const result = await runCommand(
        "go",
        ["run", "main.go"],
        {
            cwd: tempDir
        }
    );

    if (result.error || result.stderr) {
        return responseError(
            result.error,
            result.stderr,
            result.stdout
        );
    }

    return {
        success: true,
        output:
            result.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// RUST
// =====================================================
async function runRust(tempDir, sourceCode) {
    fs.writeFileSync(
        path.join(tempDir, "main.rs"),
        sourceCode,
        "utf8"
    );

    const compile = await runCommand(
        "rustc",
        ["main.rs", "-o", "main"],
        {
            cwd: tempDir
        }
    );

    if (compile.error || compile.stderr) {
        return responseError(
            compile.error,
            compile.stderr,
            compile.stdout
        );
    }

    const run = await runCommand(
        "./main",
        [],
        {
            cwd: tempDir
        }
    );

    if (run.error || run.stderr) {
        return responseError(
            run.error,
            run.stderr,
            run.stdout
        );
    }

    return {
        success: true,
        output:
            run.stdout ||
            "Program executed successfully. No output."
    };
}

// =====================================================
// API
// =====================================================
app.post("/run", async (req, res) => {
    const { language, sourceCode } = req.body;

    if (!language || typeof sourceCode !== "string") {
        return res.status(400).json({
            success: false,
            error:
                "language and sourceCode are required"
        });
    }

    const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "shushu-")
    );

    try {
        let result;

        switch (language) {

            case "java":
                result = await runJava(
                    tempDir,
                    sourceCode
                );
                break;

            case "python":
                result = await runPython(
                    tempDir,
                    sourceCode
                );
                break;

            case "js":
                result = await runJavaScript(
                    tempDir,
                    sourceCode
                );
                break;

            case "c":
                result = await runC(
                    tempDir,
                    sourceCode
                );
                break;

            case "cpp":
                result = await runCpp(
                    tempDir,
                    sourceCode
                );
                break;

            case "csharp":
                result = await runCSharp(
                    tempDir,
                    sourceCode
                );
                break;

            case "php":
                result = await runPHP(
                    tempDir,
                    sourceCode
                );
                break;

            case "go":
                result = await runGo(
                    tempDir,
                    sourceCode
                );
                break;

            case "rust":
                result = await runRust(
                    tempDir,
                    sourceCode
                );
                break;

            case "sql":
                result = await runSQL(
                    tempDir,
                    sourceCode
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    output:
                        `Language '${language}' is not supported yet.`
                });
        }

        return res.json(result);

    } catch (error) {

        return res.status(500).json({
            success: false,
            output:
                error.message || "Internal server error."
        });

    } finally {

        fs.rmSync(
            tempDir,
            {
                recursive: true,
                force: true
            }
        );
    }
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Shushu Compiler running on port ${PORT}`
    );

    console.log(
        "Multi-language execution is enabled."
    );
});