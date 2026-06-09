const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const mode = process.env.NODE_ENV || "production";
const isTargetDist = process.argv.includes("--dist");

const paths = {
    src: path.join(__dirname, "src"),
    output: isTargetDist ? path.join(__dirname, "dist") : path.join(__dirname, "build")
};

function cleanOutput() {
    if (fs.existsSync(paths.output)) {
        fs.rmSync(paths.output, { recursive: true, force: true });
    }
    fs.mkdirSync(paths.output, { recursive: true });
}

function processStyles() {
    const styleEntry = path.join(paths.src, "sass", "plyr.scss");
    const styleOut = path.join(paths.output, "plyr.css");
    
    if (fs.existsSync(styleEntry)) {
        execSync(`npx sass ${styleEntry} ${styleOut} ${mode === "production" ? "--style=compressed" : ""}`);
        execSync(`npx postcss ${styleOut} --use autoprefixer -o ${styleOut}`);
    }
}

function processScripts() {
    const scriptEntry = path.join(paths.src, "js", "plyr.js");
    const scriptOut = path.join(paths.output, "plyr.js");

    if (fs.existsSync(scriptEntry)) {
        const minifyFlag = mode === "production" ? "--minify" : "";
        execSync(`npx esbuild ${scriptEntry} --bundle --sourcemap --format=iife --global-name=Plyr --outfile=${scriptOut} ${minifyFlag}`);
    }
}

function copyStaticAssets() {
    const spriteSrc = path.join(paths.src, "sprite", "plyr.svg");
    const spriteOut = path.join(paths.output, "plyr.svg");

    if (fs.existsSync(spriteSrc)) {
        fs.cpSync(spriteSrc, spriteOut);
    }
}

(function build() {
    try {
        cleanOutput();
        processStyles();
        processScripts();
        copyStaticAssets();
    } catch (error) {
        process.exit(1);
    }
})();
