# Python Installation Guide for Windows

## Step 1: Download Python

1. Go to: https://www.python.org/downloads/
2. Click "Download Python 3.12.x" (or latest version)
3. The installer will download

## Step 2: Install Python

1. **Run the installer** (python-3.12.x-amd64.exe)
2. **IMPORTANT**: Check the box "Add Python to PATH" at the bottom
3. Click "Install Now"
4. Wait for installation to complete
5. Click "Close"

## Step 3: Verify Installation

**Close and reopen your terminal** (Git Bash), then run:

```bash
python --version
pip --version
```

You should see version numbers. If you see "command not found", Python wasn't added to PATH.

## Step 4: If Python Not Found

If `python --version` doesn't work:

1. Find where Python was installed (usually `C:\Users\YourName\AppData\Local\Programs\Python\Python312\`)
2. Add these to your PATH:
   - `C:\Users\YourName\AppData\Local\Programs\Python\Python312\`
   - `C:\Users\YourName\AppData\Local\Programs\Python\Python312\Scripts\`
3. Restart terminal

## Alternative: Use Python Launcher

Try `py` instead of `python`:
```bash
py --version
py -m pip --version
```

If this works, use `py` instead of `python` in all commands.

