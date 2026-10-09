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
        image: "python:3.13-slim",
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

export const getTheDownload = (dependency, language) => {
    console.log(dependency,language)
    if (!Array.isArray(dependency) || dependency.length === 0) {
        return "";
    }

    if (language !== "javascript" && language !== "python") {
        return "";
    }
    

    const validator = /^[a-zA-Z0-9_.@/-]+$/;

    const safeModules = dependency.filter((value) => {
        return (
            typeof value === "string" &&
            value.length > 0 &&
            validator.test(value)
        );
    });
    if (safeModules.length !== dependency.length) {
        return "";
    }

    if (language === "javascript") {
        return `npm install ${safeModules.join(" ")}`;
    }

    if (language === "python") {
        return `pip install ${safeModules.join(" ")}`;
    }

    return "";
};