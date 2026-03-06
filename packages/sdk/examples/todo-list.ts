/**
 * Todo List — A medium-complexity Mockintosh app.
 * Demonstrates: useState, useEffect, storage, TextInput, scrollable content,
 * hit regions, getContentHeight.
 */
import {
  App,
  AppBuilder,
  AppContext,
  AppProps,
  Sprite,
  fromGrid,
  OSEvent,
  WindowSize,
  TextInputState,
  BLACK,
  WHITE,
} from "@mockintosh/sdk";

const ICON = fromGrid(32, 32, [
  "................................",
  "..############################..",
  "..#..........................#..",
  "..#..##...###############...#..",
  "..#..##...###############...#..",
  "..#.......                  #..",
  "..#..##...###############...#..",
  "..#..##...###############...#..",
  "..#.......                  #..",
  "..#..##...###############...#..",
  "..#..##...###############...#..",
  "..#.......                  #..",
  "..#..##...###############...#..",
  "..#..##...###############...#..",
  "..#.......                  #..",
  "..#..##...###############...#..",
  "..#..##...###############...#..",
  "..#.......                  #..",
  "..#..........................#..",
  "..############################..",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
]);

export const sprites: Record<string, Sprite> = {
  "todo/icon": ICON,
};

interface TodoItem {
  text: string;
  done: boolean;
}

const ITEM_HEIGHT = 18;
const HEADER_HEIGHT = 30;
const INPUT_HEIGHT = 26;
const STORAGE_KEY = "todos";

const TodoApp: App = {
  id: "todo",
  title: "Todo List",
  icon: "todo/icon",
  defaultSize: { width: 220, height: 240 },
  scrollable: true,
  resizable: true,
  minSize: { width: 160, height: 120 },

  render(app: AppBuilder, ctx: AppContext, props: AppProps) {
    const [todos, setTodos] = app.useState<TodoItem[]>([]);
    const [input] = app.useState<TextInputState>({
      value: "",
      cursor: 0,
      selectionStart: null,
      scrollOffset: 0,
      focused: true,
    });
    const [loaded, setLoaded] = app.useState(false);

    app.useEffect(() => {
      props.storage.read(STORAGE_KEY).then((raw) => {
        if (raw) {
          try {
            setTodos(JSON.parse(raw));
          } catch {}
        }
        setLoaded(true);
      });
    }, []);

    const saveTodos = (newTodos: TodoItem[]) => {
      setTodos(newTodos);
      props.storage.write(STORAGE_KEY, JSON.stringify(newTodos));
    };

    ctx.clear(WHITE);

    ctx.drawText("Todo List", 8, 6, { font: "ChiKareGo", color: BLACK });
    ctx.drawText(`${todos.filter((t) => !t.done).length} remaining`, 8, 18, {
      font: "Geneva9",
      color: BLACK,
    });
    ctx.drawHLine(0, HEADER_HEIGHT, ctx.width, BLACK);

    let y = HEADER_HEIGHT + 1;
    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      const checkX = 6;
      const textX = 22;

      ctx.drawRect(checkX, y + 3, 10, 10, BLACK);
      if (todo.done) {
        ctx.drawText("✓", checkX + 1, y + 3, { font: "Geneva9", color: BLACK });
      }

      if (todo.done) {
        ctx.drawText(todo.text, textX, y + 4, {
          font: "Geneva9",
          color: BLACK,
        });
        ctx.drawHLine(textX, y + 9, ctx.width - textX - 8, BLACK);
      } else {
        ctx.drawText(todo.text, textX, y + 4, {
          font: "Geneva9",
          color: BLACK,
        });
      }

      ctx.hitRegion(
        `todo-check-${i}`,
        { x: 0, y, w: ctx.width, h: ITEM_HEIGHT },
        {
          onMouseDown: () => {
            const updated = [...todos];
            updated[i] = { ...updated[i], done: !updated[i].done };
            saveTodos(updated);
          },
        }
      );

      y += ITEM_HEIGHT;
    }

    const inputY = y + 4;
    ctx.drawHLine(0, inputY - 2, ctx.width, BLACK);
    ctx.drawTextInput(input, 4, inputY, ctx.width - 56, 16, {
      id: "todo-input",
      onChange: () => app.scheduleRender(),
    });

    ctx.drawButton({
      x: ctx.width - 48,
      y: inputY - 1,
      label: "Add",
      id: "todo-add",
      onClick: () => {
        const text = input.value.trim();
        if (!text) return;
        saveTodos([...todos, { text, done: false }]);
        input.value = "";
        input.cursor = 0;
      },
    });
  },

  onEvent(app: AppBuilder, event: OSEvent, props: AppProps, size: WindowSize) {
    if (event.type === "keyDown" && event.key === "Enter") {
      const [todos, setTodos] = app.useState<TodoItem[]>([]);
      const [input] = app.useState<TextInputState>(null as any);
      const text = input?.value?.trim();
      if (!text) return;
      const newTodos = [...todos, { text, done: false }];
      setTodos(newTodos);
      props.storage.write(STORAGE_KEY, JSON.stringify(newTodos));
      input.value = "";
      input.cursor = 0;
    }
  },

  getContentHeight(app: AppBuilder, props: AppProps, size: WindowSize): number {
    const [todos] = app.useState<TodoItem[]>([]);
    return HEADER_HEIGHT + todos.length * ITEM_HEIGHT + INPUT_HEIGHT + 12;
  },
};

export default TodoApp;
