import os
import time
import subprocess
import socket
import webbrowser


def try_to_connect(host: str, port: int, timeout: float) -> bool:
    print(f"> Trying to connect...")
    ATTEMPT_INTERVAL: float = .5
    COUNT_START: float = time.time()
    DIGITS: int = len(str(timeout))
    def lasted() -> float:
        return time.time() - COUNT_START
    
    while lasted() < timeout:
        try:
            with socket.create_connection((host, port), timeout=ATTEMPT_INTERVAL):
                print("> Connection succeed\n")
                return 1
                
        except ConnectionRefusedError:
            try:
                remaining: int = int(timeout - lasted())
                print(f"\r> Wait: {remaining:>{DIGITS}}s", end="")
                time.sleep(ATTEMPT_INTERVAL)
            except KeyboardInterrupt:
                raise SystemExit("\033[K\033[F> User interrupted")
                
        except OSError:
            raise SystemExit("\033[K\033[F> Port occupied")


def open_in_browser(url) -> None:
    print("> Launching browser\n")
    if os.environ.get('TERMUX_VERSION') is not None:
        print("\033[F> Termux detected\n")
        subprocess.run(["termux-open", url])
    else:
        webbrowser.open(url, new=0, autoraise=True)


if __name__ == "__main__":
    PATH_TO_SERVER: str = os.path.join("scripts", "server", "SS.js")
    HOST: str = "localhost"
    PORT: int = 7148
    
    print("> Launching server...")
    server = subprocess.Popen(
        ["node", PATH_TO_SERVER, str(PORT)],
        cwd = ".res",
        #stdout = subprocess.PIPE,
        #stderr = subprocess.PIPE
    )
    
    succeed = try_to_connect(HOST, PORT, 10)
    if succeed:
        open_in_browser(f"http://{HOST}:{PORT}/25285")
        try:
            server.wait()
        except KeyboardInterrupt:
            print("\n> User interrupted")
            server.terminate()
            server.wait()
