import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Vehicle from "./Vehicle";

// mock fetch
global.fetch = vi.fn((url) => {
    if (url.includes("/tracks")) {
        return Promise.resolve({
            json: () =>
                Promise.resolve([
                    { trackId: 1, name: "Test Track" },
                ]),
        });
    }

    if (url.includes("/laps/track")) {
        return Promise.resolve({
            json: () => Promise.resolve([]),
        });
    }

    return Promise.resolve({
        json: () => Promise.resolve([]),
    });
});

describe("vehicle component", () => {
    test("renders navbar logo", async () => {
        render(
            <MemoryRouter initialEntries={["/continents/Europe/Germany/1"]}>
                <Vehicle />
            </MemoryRouter>
        );

        expect(await screen.findByText(/MotoRYX/i))
            .toBeInTheDocument();
    });

    test("renders subtitle", async () => {
        render(
            <MemoryRouter initialEntries={["/continents/Europe/Germany/1"]}>
                <Vehicle />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Choose Your Vehicle/i))
            .toBeInTheDocument();
    });
});