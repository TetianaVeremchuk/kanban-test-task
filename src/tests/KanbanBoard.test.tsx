import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import { DndContext } from "@dnd-kit/core";
import KanbanBoard from "../components/KanbanBoard";
import boardReducer, { fetchIssues, updateIssueStatus } from "../store/boardSlice";

const store = configureStore({
  reducer: { board: boardReducer },
});

vi.mock("../store/boardSlice", async () => {
  const actual = await vi.importActual<typeof import("../store/boardSlice")>(
    "../store/boardSlice"
  );

  return {
    ...actual,
    fetchIssues: vi.fn().mockResolvedValue([
      {
        id: 1,
        title: "Mock Issue",
        number: 123,
        createdAt: new Date().toISOString(),
        author: "mockUser",
        comments: 2,
        status: "ToDo",
        state: "open",
      },
    ]),
    updateIssueStatus: vi.fn(),
  };
});

describe("Kanban Board", () => {
  const mockOwner = "testuser";
  const mockRepo = "test-repo";

  test("renders input field and Load button", () => {
    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    expect(screen.getByPlaceholderText("Enter GitHub repo URL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /load/i })).toBeInTheDocument();
  });

  test("shows message when no repository is entered", () => {
    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    expect(screen.getByText(/Please enter a repository URL to load issues./i)).toBeInTheDocument();
  });

  test("allows user to enter and submit a repository URL", async () => {
    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Enter GitHub repo URL");
    const loadButton = screen.getByRole("button", { name: /load/i });

    fireEvent.change(input, { target: { value: `https://github.com/${mockOwner}/${mockRepo}` } });
    expect(input).toHaveValue(`https://github.com/${mockOwner}/${mockRepo}`);

    fireEvent.click(loadButton);
    expect(fetchIssues).toHaveBeenCalled();
  });

  test("renders 3 columns: ToDo, In Progress, Done", async () => {
    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/ToDo/i)).toBeInTheDocument();
      expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Done/i)).toBeInTheDocument();
    });
  });

  test("drags and drops issue between columns", async () => {
    render(
      <Provider store={store}>
        <DndContext>
          <KanbanBoard />
        </DndContext>
      </Provider>
    );

    const todoIssue = screen.getByText(/Mock Issue/i);
    const inProgressColumn = screen.getByText(/In Progress/i).closest("div");

    fireEvent.dragStart(todoIssue);
    fireEvent.drop(inProgressColumn!);
    fireEvent.dragEnd(todoIssue);

    await waitFor(() => {
      expect(updateIssueStatus).toHaveBeenCalled();
    });
  });

  test("keeps issue order after page reload", async () => {
    localStorage.setItem(
      "kanban_issues_test-repo",
      JSON.stringify([
        { id: 1, title: "Issue 1", status: "InProgress", state: "open" },
        { id: 2, title: "Issue 2", status: "ToDo", state: "open" },
      ])
    );

    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Issue 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Issue 2/i)).toBeInTheDocument();
    });
  });

  test("renders links to user profile and repo dynamically", async () => {
    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Enter GitHub repo URL");
    const loadButton = screen.getByRole("button", { name: /load/i });

    fireEvent.change(input, { target: { value: `https://github.com/${mockOwner}/${mockRepo}` } });
    expect(input).toHaveValue(`https://github.com/${mockOwner}/${mockRepo}`);

    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`^${mockOwner}$`, "i"))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`^${mockRepo}$`, "i"))).toBeInTheDocument();
    });

    const profileLink = screen.getByText(new RegExp(`^${mockOwner}$`, "i")).closest("a");
    const repoLink = screen.getByText(new RegExp(`^${mockRepo}$`, "i")).closest("a");

    expect(profileLink).toHaveAttribute("href", `https://github.com/${mockOwner}`);
    expect(repoLink).toHaveAttribute("href", `https://github.com/${mockOwner}/${mockRepo}`);
  });
});
