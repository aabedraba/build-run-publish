#! /usr/bin/env node

import { spawn, execSync } from "child_process";
import prompts from "prompts";
import fs from "fs";

function createBuildFile() {
  let buildExists;
  try {
    const options = { stdio: "pipe" }; // run execSync with no outputs
    const buildCheck = execSync(
      "git cat-file -e origin/master:cloudbuild.yaml",
      options
    );
    if (!buildCheck) buildExists = true;
  } catch (err) {
    buildExists = false;
  }

  if (!buildExists) {
    fs.copyFile(
      "templates/cloudbuild.template.yaml",
      "cloudbuild.yaml",
      (err) => {
        if (err) throw err;
      }
    );
    fs.readFile("cloudbuild.yaml", "utf8", async (err, data) => {
      if (err) {
        return console.log(err);
      }
      const repoName = execSync(
        "basename -s .git `git config --get remote.origin.url`"
      ).toString();
      const propmtUserName = await prompts({
        type: "text",
        name: "value",
        message: "Enter your github username",
      });
      const userName = propmtUserName.value;
      execSync(`sed -i 's/REPO/${repoName}/g'\ cloudbuild.yaml`);
      execSync(`sed -i \'s/USER/${userName}/g\'\ cloudbuild.yaml`);
    });
  }
}

async function main() {
  createBuildFile();
}

main();
