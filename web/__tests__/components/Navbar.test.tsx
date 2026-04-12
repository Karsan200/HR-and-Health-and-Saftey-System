import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "../../src/components/Navbar";

const mainNavItems = [
    { name: "Overview", href: "/" },
    { name: "Calendar", href: "/calendar" },
    { name: "Employee Overview", href: "/employee/overview" },
    { name: "Health and Safety", href: "/health-and-safety" },
] as const;

const actionNavItems = [
    { name: "notifications", href: "/notifications" },
    { name: "profile", href: "/personal" },
] as const;

function renderNavbar(initialPath = "/") {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Navbar />
        </MemoryRouter>
    );
}

function getLink(name: string) {
    return screen.getByRole("link", { name });
}

describe("Navbar", () => {
    it("renders the Rent-A-Tech logo", () => {
        renderNavbar();
        expect(screen.getByAltText(/rent-a-tech/i)).toBeInTheDocument();
    });

    it("renders all navigation links", () => {
        renderNavbar();

        [...mainNavItems, ...actionNavItems].forEach((item) => {
            expect(getLink(item.name)).toBeInTheDocument();
        });
    });

    it("assigns the correct href to every link", () => {
        renderNavbar();

        [...mainNavItems, ...actionNavItems].forEach((item) => {
            expect(getLink(item.name)).toHaveAttribute("href", item.href);
        });
    });

    it.each(mainNavItems)(
        "marks $name as active on $href",
        ({ name, href }) => {
            renderNavbar(href);
            expect(getLink(name)).toHaveClass("active");
        }
    );

    it.each(["/calendar", "/notifications"])(
        "does not mark Overview as active on %s",
        (path) => {
            renderNavbar(path);
            expect(getLink("Overview")).not.toHaveClass("active");
        }
    );
});
