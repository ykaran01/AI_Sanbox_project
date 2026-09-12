export const runtimes = {
    java: {
        image: "eclipse-temurin:22-jdk-alpine",
        sourceFile: "Main.java",
        compile: "javac Main.java",
        run: "java Main"
    },

    javascript: {
        image: "node:22-alpine",
        sourceFile: "Main.js",
        compile: null,
        run: "node Main.js"
    },

    python: {
        image: "python:3.13-alpine",
        sourceFile: "main.py",
        compile: null,
        run: "python main.py"
    },

    c: {
        image: "gcc:14",
        sourceFile: "main.c",
        compile: "gcc main.c -o main",
        run: "./main"
    },

    cpp: {
        image: "gcc:14",
        sourceFile: "main.cpp",
        compile: "g++ main.cpp -o main",
        run: "./main"
    }
};