import json
import random
import argparse
import os

BOARD_FILE = "board.json"
README_FILE = "README.md" # Убедитесь, что это имя вашего основного README файла
PLAYER_SYMBOL = "X"
AI_SYMBOL = "O"

def load_board():
    if os.path.exists(BOARD_FILE):
        try:
            with open(BOARD_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"Ошибка декодирования JSON в {BOARD_FILE}. Возвращаем состояние по умолчанию.")
            return reset_game_state(load_stats=False) # Не пытаемся грузить статы, если файл битый
    print(f"{BOARD_FILE} не найден. Создаем новое состояние.")
    return reset_game_state(load_stats=False) # Не пытаемся грузить статы, если файла нет

def save_board(state):
    with open(BOARD_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def reset_game_state(load_stats=True):
    player_wins = 0
    ai_wins = 0
    draws = 0

    if load_stats: # Пытаемся сохранить статистику, если это не сброс из-за ошибки файла
        current_state = None
        if os.path.exists(BOARD_FILE):
            try:
                with open(BOARD_FILE, 'r', encoding='utf-8') as f:
                    current_state = json.load(f)
            except json.JSONDecodeError:
                print("Не удалось загрузить статистику при сбросе из-за ошибки в board.json")
        
        if current_state:
            player_wins = current_state.get("player_wins", 0)
            ai_wins = current_state.get("ai_wins", 0)
            draws = current_state.get("draws", 0)
    
    return {
        "board": [["", "", ""], ["", "", ""], ["", "", ""]],
        "status": "В игре",
        "message": "Ваш ход (X). Кликните на свободную клетку.",
        "player_wins": player_wins,
        "ai_wins": ai_wins,
        "draws": draws
    }

def check_winner(board, player):
    for i in range(3):
        if all(board[i][j] == player for j in range(3)) or \
           all(board[j][i] == player for j in range(3)):
            return True
    if all(board[i][i] == player for i in range(3)) or \
       all(board[i][2 - i] == player for i in range(3)):
        return True
    return False

def is_draw(board):
    return all(cell for row in board for cell in row)

def player_move(state, row, col):
    if state["status"] != "В игре":
        state["message"] = f"Игра окончена ({state['status']}). Начните новую игру."
        return state
    
    board = state["board"]
    if board[row][col] == "":
        board[row][col] = PLAYER_SYMBOL
        if check_winner(board, PLAYER_SYMBOL):
            state["status"] = "Вы победили!"
            state["message"] = "Поздравляю! 🎉 Вы победили! Нажмите 'Начать/Сбросить игру' для новой партии."
            state["player_wins"] = state.get("player_wins", 0) + 1
        elif is_draw(board):
            state["status"] = "Ничья"
            state["message"] = "Ничья! 🤝 Нажмите 'Начать/Сбросить игру' для новой партии."
            state["draws"] = state.get("draws", 0) + 1
        else:
            state["message"] = "Ход компьютера (O)..."
            state = ai_move(state) # Ход ИИ сразу после игрока
    else:
        state["message"] = "Эта клетка уже занята. Попробуйте другую."
    return state

def ai_move(state):
    if state["status"] != "В игре":
        return state

    board = state["board"]
    empty_cells = []
    for r_idx, row_val in enumerate(board):
        for c_idx, cell_val in enumerate(row_val):
            if cell_val == "":
                empty_cells.append((r_idx, c_idx))

    if not empty_cells: # На всякий случай, хотя is_draw должна была сработать раньше
        return state

    # Стратегия ИИ:
    # 1. Выиграть, если возможно
    for r, c in empty_cells:
        board[r][c] = AI_SYMBOL
        if check_winner(board, AI_SYMBOL):
            state["status"] = "Компьютер победил"
            state["message"] = "Компьютер победил. 🤖 Попробуйте еще раз! Нажмите 'Начать/Сбросить игру'."
            state["ai_wins"] = state.get("ai_wins", 0) + 1
            return state
        board[r][c] = ""

    # 2. Блокировать игрока
    for r, c in empty_cells:
        board[r][c] = PLAYER_SYMBOL
        if check_winner(board, PLAYER_SYMBOL):
            board[r][c] = AI_SYMBOL # Блокирующий ход
            if is_draw(board):
                state["status"] = "Ничья"
                state["message"] = "Ничья! 🤝 Нажмите 'Начать/Сбросить игру' для новой партии."
                state["draws"] = state.get("draws", 0) + 1
            else:
                 state["message"] = "Ваш ход (X). Кликните на свободную клетку."
            return state
        board[r][c] = ""

    # 3. Занять центр
    if (1, 1) in empty_cells:
        r_ai, c_ai = 1, 1
    # 4. Занять случайный угол
    else:
        corners = [(0,0), (0,2), (2,0), (2,2)]
        random.shuffle(corners)
        available_corners = [cell for cell in corners if cell in empty_cells]
        if available_corners:
            r_ai, c_ai = available_corners[0]
        # 5. Занять случайную оставшуюся клетку
        else:
            r_ai, c_ai = random.choice(empty_cells)
    
    board[r_ai][c_ai] = AI_SYMBOL
    if check_winner(board, AI_SYMBOL):
        state["status"] = "Компьютер победил"
        state["message"] = "Компьютер победил. 🤖 Попробуйте еще раз! Нажмите 'Начать/Сбросить игру'."
        state["ai_wins"] = state.get("ai_wins", 0) + 1
    elif is_draw(board):
        state["status"] = "Ничья"
        state["message"] = "Ничья! 🤝 Нажмите 'Начать/Сбросить игру' для новой партии."
        state["draws"] = state.get("draws", 0) + 1
    else:
        state["message"] = "Ваш ход (X). Кликните на свободную клетку."
    return state

def generate_board_markdown(state, github_user_repo, workflow_file):
    board = state["board"]
    status = state["status"]
    message = state["message"]
    
    md = "<div align='center'>\n"
    md += "<table>\n"
    for r in range(3):
        md += "  <tr>\n"
        for c in range(3):
            cell_content = board[r][c]
            cell_display = "  " # Для пустых ячеек по умолчанию

            if cell_content == PLAYER_SYMBOL:
                 cell_display = "❌"
            elif cell_content == AI_SYMBOL:
                 cell_display = "⭕"
            elif status == "В игре": # Пустая клетка и игра идет - делаем кликабельной
                link = f"https://github.com/{github_user_repo}/actions/workflows/{workflow_file}/dispatches?ref=main&inputs[action]=move&inputs[row]={r}&inputs[col]={c}"
                cell_display = f'<a href="{link}" style="text-decoration:none; color:inherit;">🕹️</a>'
            # Если клетка пустая, но игра не идет, остается   

            md += f'    <td align="center" valign="middle" width="50" height="50" style="font-size:24px; border: 1px solid #555;">{cell_display}</td>\n'
        md += "  </tr>\n"
    md += "</table>\n"
    
    md += f"<p>{message}</p>\n"
    md += f"<p><b>Статистика:</b> Игрок: {state.get('player_wins',0)} - ИИ: {state.get('ai_wins',0)} - Ничьи: {state.get('draws',0)}</p>\n"
    md += "</div>\n"
    return md

def update_readme(game_markdown):
    try:
        with open(README_FILE, 'r', encoding='utf-8') as f:
            readme_content = f.readlines()
    except FileNotFoundError:
        print(f"Ошибка: Файл {README_FILE} не найден.")
        return False

    start_marker = "<!-- TICTACTOE_START -->\n"
    end_marker = "<!-- TICTACTOE_END -->\n"

    try:
        start_index = readme_content.index(start_marker)
        end_index = readme_content.index(end_marker)
    except ValueError:
        print(f"Ошибка: Маркеры {start_marker.strip()} и/или {end_marker.strip()} не найдены в {README_FILE}")
        return False

    new_readme_content = readme_content[:start_index + 1]
    new_readme_content.append(game_markdown + "\n") # Добавляем сам Markdown игры
    new_readme_content.extend(readme_content[end_index:])

    with open(README_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_readme_content)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Игра Крестики-Нолики для GitHub README")
    parser.add_argument("--action", help="Действие: 'move' или 'reset'", required=True, choices=['move', 'reset'])
    
    # Делаем row и col опциональными и обрабатываем их отсутствие или некорректные значения
    parser.add_argument("--row", help="Ряд для хода (0-2)", default=None)
    parser.add_argument("--col", help="Колонка для хода (0-2)", default=None)
    
    args = parser.parse_args()

    current_state = load_board()
    # Имя репозитория и workflow для генерации ссылок
    # Замените 'renothingg/renothingg' на ваше имя пользователя/репозитория, если оно другое
    # Обычно для профильного README это ваш_логин/ваш_логин
    GITHUB_USER_REPO = os.getenv('GITHUB_REPOSITORY', 'renothingg/renothingg') 
    WORKFLOW_FILE = "tictactoe_game.yml" # Имя вашего workflow файла

    parsed_row, parsed_col = None, None

    if args.action == "reset":
        print("Действие: Сброс игры.")
        current_state = reset_game_state()
    elif args.action == "move":
        print(f"Действие: Ход. Получено row='{args.row}', col='{args.col}'")
        if args.row is not None and args.col is not None:
            try:
                temp_row = int(args.row)
                temp_col = int(args.col)
                if 0 <= temp_row <= 2 and 0 <= temp_col <= 2:
                    parsed_row = temp_row
                    parsed_col = temp_col
                else:
                    current_state["message"] = "Ошибка: Значения для хода вне допустимого диапазона (0-2)."
                    print(f"Ошибка: Некорректные значения для хода: row={temp_row}, col={temp_col}")
            except ValueError:
                current_state["message"] = "Ошибка: Значения для хода должны быть числами."
                print(f"Ошибка: Не удалось преобразовать row ('{args.row}') или col ('{args.col}') в числа.")
        
        if parsed_row is not None and parsed_col is not None:
            if current_state["status"] == "В игре":
                print(f"Ход игрока: строка {parsed_row}, колонка {parsed_col}")
                current_state = player_move(current_state, parsed_row, parsed_col)
            else:
                current_state["message"] = f"Игра уже окончена ({current_state['status']}). Нажмите 'Начать/Сбросить игру'."
                print(f"Попытка хода в оконченной игре. Статус: {current_state['status']}")
        else:
            if current_state["status"] == "В игре": # Только если игра идет, сообщаем об ошибке хода
                 current_state["message"] = "Ошибка: Для хода не были предоставлены корректные координаты."
            print("Ошибка: Не удалось получить корректные координаты для хода.")
            # Не меняем состояние игры, если ход невалидный, просто обновляем сообщение

    save_board(current_state)
    print(f"Состояние сохранено: Статус='{current_state['status']}', Сообщение='{current_state['message']}'")
    
    game_md = generate_board_markdown(current_state, GITHUB_USER_REPO, WORKFLOW_FILE)
    if update_readme(game_md):
        print(f"{README_FILE} обновлен.")
    else:
        print(f"Не удалось обновить {README_FILE}.")