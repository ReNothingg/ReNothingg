import json
import random
import argparse
import os

BOARD_FILE = "board.json"
README_FILE = "README.md"
PLAYER_SYMBOL = "X"
AI_SYMBOL = "O"

def load_board():
    if os.path.exists(BOARD_FILE):
        with open(BOARD_FILE, 'r') as f:
            return json.load(f)
    return None

def save_board(state):
    with open(BOARD_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def reset_game_state():
    # Сохраняем статистику
    current_state = load_board()
    player_wins = current_state.get("player_wins", 0) if current_state else 0
    ai_wins = current_state.get("ai_wins", 0) if current_state else 0
    draws = current_state.get("draws", 0) if current_state else 0
    
    return {
        "board": [["", "", ""], ["", "", ""], ["", "", ""]],
        "status": "В игре",
        "message": "Ваш ход (X). Кликните на свободную клетку.",
        "player_wins": player_wins,
        "ai_wins": ai_wins,
        "draws": draws
    }

def check_winner(board, player):
    # Проверка строк и столбцов
    for i in range(3):
        if all(board[i][j] == player for j in range(3)) or \
           all(board[j][i] == player for j in range(3)):
            return True
    # Проверка диагоналей
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
            state["message"] = "Поздравляю! Вы победили! Нажмите 'Начать/Сбросить игру' для новой партии."
            state["player_wins"] = state.get("player_wins", 0) + 1
        elif is_draw(board):
            state["status"] = "Ничья"
            state["message"] = "Ничья! Нажмите 'Начать/Сбросить игру' для новой партии."
            state["draws"] = state.get("draws", 0) + 1
        else:
            state["message"] = "Ход компьютера (O)..." # Временно, пока ИИ не сходил
            # Сразу после хода игрока, если игра не окончена, вызываем ход ИИ
            state = ai_move(state)
    else:
        state["message"] = "Эта клетка уже занята. Попробуйте другую."
    return state

def ai_move(state):
    if state["status"] != "В игре": # Если игрок уже выиграл/ничья
        return state

    board = state["board"]
    empty_cells = []
    for r in range(3):
        for c in range(3):
            if board[r][c] == "":
                empty_cells.append((r, c))

    if not empty_cells: # Это не должно случиться, если is_draw проверяется раньше
        return state

    # Простая стратегия ИИ:
    # 1. Выиграть, если возможно
    for r, c in empty_cells:
        board[r][c] = AI_SYMBOL
        if check_winner(board, AI_SYMBOL):
            state["status"] = "Компьютер победил"
            state["message"] = "Компьютер победил. Нажмите 'Начать/Сбросить игру' для новой партии."
            state["ai_wins"] = state.get("ai_wins", 0) + 1
            return state
        board[r][c] = "" # Откатить ход

    # 2. Блокировать игрока, если он может выиграть следующим ходом
    for r, c in empty_cells:
        board[r][c] = PLAYER_SYMBOL
        if check_winner(board, PLAYER_SYMBOL):
            board[r][c] = AI_SYMBOL # Блокирующий ход
            if is_draw(board): # Проверка на ничью после хода ИИ
                state["status"] = "Ничья"
                state["message"] = "Ничья! Нажмите 'Начать/Сбросить игру' для новой партии."
                state["draws"] = state.get("draws", 0) + 1
            else:
                 state["message"] = "Ваш ход (X). Кликните на свободную клетку."
            return state
        board[r][c] = "" # Откатить ход

    # 3. Занять центр, если свободен
    if (1, 1) in empty_cells:
        r, c = 1, 1
    # 4. Занять случайный угол, если свободен
    else:
        corners = [(0,0), (0,2), (2,0), (2,2)]
        available_corners = [cell for cell in corners if cell in empty_cells]
        if available_corners:
            r, c = random.choice(available_corners)
        # 5. Занять случайную оставшуюся клетку
        else:
            r, c = random.choice(empty_cells)
    
    board[r][c] = AI_SYMBOL
    if check_winner(board, AI_SYMBOL): # Перепроверка на всякий случай
        state["status"] = "Компьютер победил"
        state["message"] = "Компьютер победил. Нажмите 'Начать/Сбросить игру' для новой партии."
        state["ai_wins"] = state.get("ai_wins", 0) + 1
    elif is_draw(board):
        state["status"] = "Ничья"
        state["message"] = "Ничья! Нажмите 'Начать/Сбросить игру' для новой партии."
        state["draws"] = state.get("draws", 0) + 1
    else:
        state["message"] = "Ваш ход (X). Кликните на свободную клетку."
    return state

def generate_board_markdown(state):
    board = state["board"]
    status = state["status"]
    message = state["message"]
    
    # GitHub username and repo name (usually the same for profile READMEs)
    # Важно: Замените 'renothingg' на ваше имя пользователя GitHub, если оно отличается от имени репозитория.
    # Для профильных README репозиторий обычно называется так же, как и пользователь.
    github_user_repo = "renothingg/renothingg" 
    workflow_file = "tictactoe_game.yml"

    md = "<div align='center'>\n"
    md += "<table>\n"
    for r in range(3):
        md += "  <tr>\n"
        for c in range(3):
            cell_content = board[r][c] if board[r][c] else "  " # Используем   для пустых, чтобы ячейки не схлопывались
            cell_display = cell_content
            if board[r][c] == "" and status == "В игре":
                link = f"https://github.com/{github_user_repo}/actions/workflows/{workflow_file}/dispatches?ref=main&inputs[action]=move&inputs[row]={r}&inputs[col]={c}"
                # Используем более крупный шрифт или эмодзи для кликабельной области
                cell_display = f'<a href="{link}" style="text-decoration:none; color:inherit;">🕹️</a>'
            elif board[r][c] == PLAYER_SYMBOL:
                 cell_display = "❌" # X
            elif board[r][c] == AI_SYMBOL:
                 cell_display = "⭕" # O
            else: # Если игра окончена, не делаем клетки кликабельными
                 cell_display = f"{cell_content}"


            md += f'    <td align="center" valign="middle" width="50" height="50" style="font-size:24px; border: 1px solid #555;">{cell_display}</td>\n'
        md += "  </tr>\n"
    md += "</table>\n"
    
    md += f"<p>{message}</p>\n"
    md += f"<p><b>Статистика:</b> Игрок: {state.get('player_wins',0)} - ИИ: {state.get('ai_wins',0)} - Ничьи: {state.get('draws',0)}</p>\n"
    md += "</div>\n"
    return md

def update_readme(game_markdown):
    with open(README_FILE, 'r', encoding='utf-8') as f:
        readme_content = f.readlines()

    start_marker = "<!-- TICTACTOE_START -->\n"
    end_marker = "<!-- TICTACTOE_END -->\n"

    if start_marker not in readme_content or end_marker not in readme_content:
        print(f"Маркеры {start_marker.strip()} и/или {end_marker.strip()} не найдены в {README_FILE}")
        # Если маркеров нет, можно просто дописать в конец или не обновлять
        # Для простоты, если маркеров нет, мы не будем обновлять README.
        # Вам нужно убедиться, что маркеры есть в вашем README.md.
        return False

    start_index = readme_content.index(start_marker)
    end_index = readme_content.index(end_marker)

    new_readme_content = readme_content[:start_index + 1]
    new_readme_content.append(game_markdown + "\n")
    new_readme_content.extend(readme_content[end_index:])

    with open(README_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_readme_content)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--action", help="Действие: 'move' или 'reset'", required=True)
    parser.add_argument("--row", type=int, help="Ряд для хода (0-2)")
    parser.add_argument("--col", type=int, help="Колонка для хода (0-2)")
    args = parser.parse_args()

    current_state = load_board()
    if not current_state: # Если файл board.json не существует или пуст
        print("Файл board.json не найден или поврежден. Инициализация новой игры.")
        current_state = reset_game_state()
        # Не сохраняем сразу, даем действию обработать
        # Если это не reset, а move, то игра не начнется корректно.
        # Лучше, если action reset всегда вызывается первым.

    if args.action == "reset":
        current_state = reset_game_state()
        print("Игра сброшена.")
    elif args.action == "move":
        if current_state["status"] != "В игре":
            current_state["message"] = f"Игра уже окончена ({current_state['status']}). Нажмите 'Начать/Сбросить игру'."
            print(f"Попытка хода в оконченной игре. Статус: {current_state['status']}")
        elif args.row is not None and args.col is not None:
            print(f"Ход игрока: строка {args.row}, колонка {args.col}")
            current_state = player_move(current_state, args.row, args.col)
        else:
            current_state["message"] = "Ошибка: для хода не указаны строка и/или колонка."
            print("Ошибка: для хода не указаны строка и/или колонка.")
    
    save_board(current_state)
    print(f"Состояние сохранено: {current_state}")
    
    game_md = generate_board_markdown(current_state)
    if update_readme(game_md):
        print(f"{README_FILE} обновлен.")
    else:
        print(f"Не удалось обновить {README_FILE} из-за отсутствия маркеров.")