const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.join(__dirname, "public")));

function runCommand(command, args, options = {}) {
    return new Promise((resolve) => {
        execFile(
            command,
            args,
            {
                timeout: 5000,
                maxBuffer: 1024 * 1024,
                ...options
            },
            (error, stdout, stderr) => {
                resolve({ error, stdout, stderr });
            }
        );
    });
}

app.post("/run", async (req, res) => {
    const { language, sourceCode } = req.body;

    if (!language || typeof sourceCode !== "string") {
        return res.status(400).json({
            success: false,
            error: "language and sourceCode are required"
        });
    }

    // Local development backend: currently supports Java execution.
    if (language !== "java") {
        return res.status(400).json({
            success: false,
            error: "This local backend currently supports Java. HTML/CSS/JS runs directly in the browser."
        });
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "shushu-java-"));
    const javaFile = path.join(tempDir, "Main.java");

    try {
        fs.writeFileSync(javaFile, sourceCode, "utf8");

        const compileResult = await runCommand("javac", ["Main.java"], {
            cwd: tempDir
        });

        if (compileResult.error || compileResult.stderr) {
            return res.json({
                success: false,
                output: compileResult.stderr || compileResult.error.message
            });
        }

        const runResult = await runCommand("java", ["-cp", tempDir, "Main"]);

        if (runResult.error) {
            if (runResult.error.killed) {
                return res.json({
                    success: false,
                    output: "Program stopped: execution time exceeded 5 seconds."
                });
            }

            return res.json({
                success: false,
                output: runResult.stderr || runResult.error.message
            });
        }

        if (runResult.stderr) {
            return res.json({
                success: false,
                output: runResult.stderr
            });
        }

        return res.json({
            success: true,
            output: runResult.stdout
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });

    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

app.listen(PORT, () => {
    console.log(`Shushu Compiler running at http://localhost:${PORT}`);
    console.log("Java execution is enabled.");
});