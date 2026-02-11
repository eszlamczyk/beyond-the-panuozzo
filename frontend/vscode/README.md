# Beyond the Panuozzo — VSCode Extension

A VSCode extension that adds a dedicated "Beyond the Panuozzo" view to the Activity Bar.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Visual Studio Code](https://code.visualstudio.com/) (v1.85 or later)

## Development Setup

1. **Install dependencies**

   ```sh
   cd frontend/vscode
   npm install
   ```

2. **Compile the extension**

   ```sh
   npm run compile
   ```

   Or start the watch mode for automatic recompilation on changes:

   ```sh
   npm run watch
   ```

3. **Run the extension**

   - Open the `frontend/vscode` folder in VSCode (`code frontend/vscode`)
   - Press **F5** (or go to **Run → Start Debugging**)
   - A new **Extension Development Host** window will open with the extension loaded
   - Look for the rocket icon in the **Activity Bar** (left side) — click it to open the "Beyond the Panuozzo" side panel

4. **Make changes**

   - Edit files in `src/`
   - If watch mode is running, changes compile automatically
   - Press **Ctrl+Shift+F5** (Cmd+Shift+F5 on macOS) to reload the Extension Development Host
