@echo off
echo 🚀 Starting A-List Home Pros Django Server with Swagger...
echo.

REM Navigate to project root
cd /d "%~dp0\.."

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    echo ✅ Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo ❌ Virtual environment not found! Please create venv first.
    pause
    exit /b 1
)

REM Navigate to server directory
cd server

REM Run Django checks
echo 🔍 Checking Django configuration...
python manage.py check
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Django check failed!
    pause
    exit /b 1
)

REM Apply migrations if needed
echo 🔄 Applying migrations...
python manage.py migrate --no-input

REM Collect static files
echo 📦 Collecting static files...
python manage.py collectstatic --no-input --clear

REM Start Django development server
echo.
echo 🌟 Starting Django development server...
echo.
echo 📋 Available URLs:
echo    🏠 Admin Panel:     http://127.0.0.1:8000/admin/
echo    📖 Swagger UI:      http://127.0.0.1:8000/swagger/
echo    📚 ReDoc:           http://127.0.0.1:8000/redoc/
echo    🔗 API Root:        http://127.0.0.1:8000/api/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 127.0.0.1:8000

pause 