import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Track from "./Track";

// mock fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([]),
    })
);

describe("track component", () => {
    test("renders navbar logo", async () => {
        render(
            <MemoryRouter initialEntries={["/continents/Europe/Germany"]}>
                <Track />
            </MemoryRouter>
        );

        expect(await screen.findByText(/MotoRYX/i))
            .toBeInTheDocument();
    });

    test("renders subtitle", async () => {
        render(
            <MemoryRouter initialEntries={["/continents/Europe/Germany"]}>
                <Track />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Choose Your Track/i))
            .toBeInTheDocument();
    });
});