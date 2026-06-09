const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "deploy.json");

function getTargetEnv() {
    const args = process.argv.slice(2);
    const envArg = args.find(arg => arg.startsWith("--env="));
    return envArg ? envArg.split("=")[1] : "production";
}

function loadDeploymentConfig(env) {
    if (!fs.existsSync(configPath)) {
        throw new Error("Deployment configuration file (deploy.json) is missing.");
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (!config.env || !config.env[env]) {
        throw new Error(`Deployment environment '${env}' is not defined in deploy.json.`);
    }
    
    return config.env[env];
}

function runBuildPipeline() {
    execSync("pnpm run build --dist", { stdio: "inherit" });
}

function deployToRemoteServer(target) {
    const localDistPath = path.join(__dirname, "dist");
    
    if (!fs.existsSync(localDistPath)) {
        throw new Error("Build artifacts directory (dist/) not found. Build may have failed.");
    }

    const remoteDestination = `${target.user}@${target.host}:${target.path}`;
    
    const rsyncCommand = `rsync -avz --delete \
        --exclude='.git*' \
        --exclude='node_modules' \
        ${localDistPath}/ ${remoteDestination}`;

    execSync(rsyncCommand, { stdio: "inherit" });
}

(function executeDeployment() {
    try {
        const environment = getTargetEnv();
        const targetConfig = loadDeploymentConfig(environment);

        runBuildPipeline();
        deployToRemoteServer(targetConfig);
    } catch (error) {
        process.exit(1);
    }
})();
