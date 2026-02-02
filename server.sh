#!/bin/bash

# Server Management Script for Agent-CRM
# Use this to easily start/stop the backend and frontend servers

PROJECT_DIR="/home/ritik-saini/Desktop/localhost/codewithritiksaini/mern/britannica-overseas/Agent-crm"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if port is in use
check_port() {
    lsof -i :$1 2>/dev/null | grep -q LISTEN
}

# Kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_info "Port $port is in use, killing existing process..."
        lsof -i :$port 2>/dev/null | grep -v COMMAND | awk '{print $2}' | xargs kill -9 2>/dev/null || true
        sleep 2
        print_success "Port $port cleared"
    fi
}

start_backend() {
    print_header "Starting Backend Server"
    
    if ! check_port 5000; then
        cd "$BACKEND_DIR"
        npm start > /tmp/backend.log 2>&1 &
        sleep 5
        
        if check_port 5000; then
            print_success "Backend started on port 5000"
            echo -e "${YELLOW}📍 API: http://localhost:5000/api${NC}"
            echo -e "${YELLOW}🏥 Health: http://localhost:5000/health${NC}"
        else
            print_error "Backend failed to start"
            echo -e "${YELLOW}Check logs: tail -f /tmp/backend.log${NC}"
            return 1
        fi
    else
        print_info "Backend already running on port 5000"
    fi
}

start_frontend() {
    print_header "Starting Frontend Server"
    
    if ! check_port 5173; then
        cd "$FRONTEND_DIR"
        npm run dev > /tmp/frontend.log 2>&1 &
        sleep 5
        
        if check_port 5173; then
            print_success "Frontend started on port 5173"
            echo -e "${YELLOW}🌐 App: http://localhost:5173${NC}"
        else
            print_error "Frontend failed to start"
            echo -e "${YELLOW}Check logs: tail -f /tmp/frontend.log${NC}"
            return 1
        fi
    else
        print_info "Frontend already running on port 5173"
    fi
}

stop_backend() {
    print_header "Stopping Backend Server"
    kill_port 5000
    print_success "Backend stopped"
}

stop_frontend() {
    print_header "Stopping Frontend Server"
    kill_port 5173
    print_success "Frontend stopped"
}

stop_all() {
    print_header "Stopping All Servers"
    kill_port 5000
    kill_port 5173
    print_success "All servers stopped"
}

start_all() {
    print_header "Starting All Servers"
    start_backend
    echo ""
    start_frontend
    echo ""
    print_header "Status"
    check_port 5000 && echo -e "${GREEN}✅ Backend${NC} running on port 5000" || echo -e "${RED}❌ Backend${NC} not running"
    check_port 5173 && echo -e "${GREEN}✅ Frontend${NC} running on port 5173" || echo -e "${RED}❌ Frontend${NC} not running"
}

restart_all() {
    print_header "Restarting All Servers"
    stop_all
    echo ""
    start_all
}

restart_backend() {
    print_header "Restarting Backend Server"
    stop_backend
    echo ""
    start_backend
}

restart_frontend() {
    print_header "Restarting Frontend Server"
    stop_frontend
    echo ""
    start_frontend
}

status() {
    print_header "Server Status"
    echo ""
    if check_port 5000; then
        echo -e "${GREEN}✅ Backend${NC} running on port 5000"
    else
        echo -e "${RED}❌ Backend${NC} not running"
    fi
    
    if check_port 5173; then
        echo -e "${GREEN}✅ Frontend${NC} running on port 5173"
    else
        echo -e "${RED}❌ Frontend${NC} not running"
    fi
    
    echo ""
    echo -e "${YELLOW}Database:${NC} MySQL on localhost (php_britannica_agent_crm)"
}

logs_backend() {
    echo -e "${YELLOW}Backend logs (last 50 lines):${NC}"
    tail -50 /tmp/backend.log 2>/dev/null || echo "No backend logs found"
}

logs_frontend() {
    echo -e "${YELLOW}Frontend logs (last 50 lines):${NC}"
    tail -50 /tmp/frontend.log 2>/dev/null || echo "No frontend logs found"
}

# Main menu
case "${1:-help}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    backend-start)
        start_backend
        ;;
    backend-stop)
        stop_backend
        ;;
    backend-restart)
        restart_backend
        ;;
    frontend-start)
        start_frontend
        ;;
    frontend-stop)
        stop_frontend
        ;;
    frontend-restart)
        restart_frontend
        ;;
    status)
        status
        ;;
    logs-backend)
        logs_backend
        ;;
    logs-frontend)
        logs_frontend
        ;;
    help)
        print_header "Agent CRM Server Management"
        echo ""
        echo -e "${YELLOW}Usage: $0 [command]${NC}"
        echo ""
        echo -e "${GREEN}Commands:${NC}"
        echo "  start              Start both backend and frontend"
        echo "  stop               Stop both backend and frontend"
        echo "  restart            Restart both backend and frontend"
        echo ""
        echo "  backend-start      Start backend server only"
        echo "  backend-stop       Stop backend server only"
        echo "  backend-restart    Restart backend server only"
        echo ""
        echo "  frontend-start     Start frontend server only"
        echo "  frontend-stop      Stop frontend server only"
        echo "  frontend-restart   Restart frontend server only"
        echo ""
        echo "  status             Show server status"
        echo "  logs-backend       Show backend logs"
        echo "  logs-frontend      Show frontend logs"
        echo "  help               Show this help message"
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo "  $0 start"
        echo "  $0 backend-restart"
        echo "  $0 status"
        echo "  $0 logs-backend"
        echo ""
        status
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac
