import os
import time
import subprocess
import socket
import webbrowser


def try_to_connect(host: str, port: int, timeout: float) -> bool:
    ATTEMPT_INTERVAL: float = .5
    COUNT_START: float = time.time()
    DIGITS: int = len(str(timeout))
    def lasted() -> float:
        return time.time() - COUNT_START
    
    print(f"\n> Awaiting server launch...\n")
    
    while lasted() < timeout:
        try:
            with socket.create_connection((host, port), timeout=ATTEMPT_INTERVAL):
                print("\n> Connection succeed")
                return
                
        except ConnectionRefusedError:
            try:
                remaining: int = int(timeout - lasted())
                print(f"\033[F\033[K> Timeout in: {remaining:>{DIGITS}}s")
                time.sleep(ATTEMPT_INTERVAL)
            except KeyboardInterrupt:
                raise SystemExit("\033[F\033[K> User interrupted")
                
        except OSError:
            raise SystemExit("\033[F\033[K> Port occupied")
            
    raise SystemExit("\033[F\033[K> Connection failed due to timeout")


def open_in_browser(url) -> None:
    print("\n> Launching browser\n")
    if os.environ.get('TERMUX_VERSION') is not None:
        print("\033[F> Termux detected\n")
        subprocess.run(["termux-open", url])
    else:
        webbrowser.open(url, new=0, autoraise=True)


if __name__ == "__main__":
    PATH_TO_SERVER: str = os.path.join("server", "server.js")
    HOST: str = "localhost"
    PORT: int = 7148
    
    print("> Running server script")
    server: subprocess.Popen = subprocess.Popen(
        ["node", PATH_TO_SERVER, HOST, str(PORT)],
        cwd = ".res"
    )
    
    try_to_connect(HOST, PORT, 10)
    open_in_browser(f"http://{HOST}:{PORT}/25285")
    
    try:
        server.wait()
    except KeyboardInterrupt:
        print("\n> User interrupted")
        server.terminate()
        server.wait()
