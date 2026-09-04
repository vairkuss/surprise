from pathlib import Path
from multiprocessing import Process
import time, socket, os, webbrowser, subprocess


def connection_succeed(host="localhost", port=7148, timeout=30) -> bool:
    print("> Пытаюсь подключиться к серверу...")
    tries = 1
    count_start = time.time()
    while time.time() - count_start < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True;
        except (ConnectionRefusedError, OSError):
            print(f"\r\tНеудачных попыток: {tries}", end="")
            tries += 1
            time.sleep(1)
    return False;

def open_browser() -> None:
    print("\n\n> Открываю Ваш браузер...")
    url = "http://localhost:7148/25285"
    if os.environ.get('TERMUX_VERSION') is None:
        webbrowser.open(url, new=0, autoraise=True)
    else:
        print("\n".join([
            "\tОоо.. Я вижу, Вы с термукса.. Миленько!",
            "\tМодуль webbrowser в нём обычно не работает.",
            "\tНо не переживайте, это я предусмотрел!~  :3"
        ]))
        count_start = time.time()
        while time.time() - count_start < 2:
            print(f"\r{2 - (time.time() - count_start):.1f}", end="")
        print(f'\r      \n> Запускаю "termux-open {url}"...')
        subprocess.run(["termux-open", url])
        print("\n")


if __name__ == "__main__":
    
    print(f'> Запускаю "node {Path("scripts", "surprise_server.js")}"...')
    server = subprocess.Popen(["node", Path("scripts", "surprise-server.js")])
    
    if connection_succeed():
        open_browser()
    else:
        print("\n" + "\n".join([
            "\tПростите пожалуйста, я не смог",
            '\tдождаться ответа от сервера... (-_- )\n',
        ]))
    
    try:
        server.wait()
    except KeyboardInterrupt:
        print("\n> Секунду! Выключаю сервер...")
        server.terminate()
        server.wait()
