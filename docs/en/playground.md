---
title: Playground
description: "Run Python in your browser: an editor for quick experiments."
---

# Playground

Try out small ideas here. Press **Ctrl + Enter** (Mac: **⌘ + Enter**) to run your code. **Stop** restarts the Python session.

<ClientOnly><PythonPlayground /></ClientOnly>

## Good to know

- Each run starts with fresh variables.
- When your code calls `input()`, the editor shows the prompt. Enter an answer to rerun the program with the answers collected so far.
- Files you create exist only in the browser and disappear when the session restarts.
- The runtime includes the standard library, with browser limits on system features. Ordinary runs time out after 15 seconds.
- For longer experiments with notebooks and files, use the [Python Lab](/en/lab).
- Popular data packages (numpy, pandas, matplotlib) load automatically the first time you import them, and `plt.show()` displays charts below the output.
